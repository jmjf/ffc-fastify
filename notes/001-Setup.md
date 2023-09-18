# Setting up

I'm planning to work through the FreeCodeCamp Fastify example, which uses MongoDB. Getting that setup in dev containers has proven interesting.

## Mongo Express instead of Mongo Compass

I wanted to use Mongo Compass as a UI, but I can't find a container for it. The instructions say to download and install locally (and connect to containers, etc.). But a key point of devcontainers is to keep all the development components in the devcontainer and not install them locally.

Maybe I could have set up a container to run Mongo Compass, but I opted to use Mongo Express because it does run in a container, which is demonstrated in a docker compose spec in the official MongoDB image [on DockerHub](https://hub.docker.com/_/mongo) (see "Example `docker-compose.yml` for `mongo`").

## Networking

The following may be an issue with how EndeavourOS (Arch-based), where I've read Docker networking may be odd. If you use a different distro, you may not have this problem.

I can't connect to Mongo Express on `localhost`. I've found several IP addresses that work, but `localhost` and 127.0.0.1 do not.

The easy way to find a working IP address is to run `ip a` in the VS Code terminal when in the devcontainer. Replace the last octet of the IP address with 1. For example, if `ip a` shows the devcontainer is 172.21.0.3 then 192.21.0.1:3081 gets to Mongo Express.

Alternatively, run `ip a` from the host and look for the IP address for the network named `virbr0` or `docker0` (may vary if you have more than one Docker network running). That IP address plus the Mongo Express port (3081 in my configuration) works.

I think this problem is related to networking limitations for rootless Docker on Arch derivatives.

## Devcontainer setup

See `.devcontainer` for the details. It's a fairly multi-file setup based on what I've done in the past. All ports for this set of containers are on 308x ports.

- `mongo-compose.yaml` builds the database setup, in this case MongoDB plus Mongo Express (web UI), exposed on ports 3087 (a nod to the default 27107) and 3081 (default 8081) respectively.
- `node-dc-compose.yaml` builds the NodeJS development container. It adds some basic Node/Typescript extensions for VS Code in the container. Use the `VARIANT` arg to change NodeJS versions.
- `node-dockerfile` defines the `node-dc` devcontainer built by `node-dc-compose.yaml`; based on Microsoft's NodeJS devcontainer Dockerfile with a few changes; among other things, installed `iproute2` because I like having the `ip` command available.
- `devcontainer.json` uses `mongo-compose.yaml` and `node-dc-compose.yaml` to start up the container

This setup results in the following containers (names):

- `fcc-fastify-mongodb` -- the MongoDB instance with hostname ffmongodb; uses a Docker volume named `fcc-fastify-mongodb-data` to persist data
- `fcc-fastify-mongo-express` -- the Mongo Express instance
- `fcc-fastify_devcontainer-node-dc-1` -- the NodeJS devcontainer; thanks for that lovely name, VS Code, but I guess it's unique

**COMMIT** CHORE: build devcontainer setup and get it working

## Initializing

- `npm init` to create `package.json`
- `mkdir src` so we have a place for code
- `npm i mongoose fastify`
- `npm i -D fastify-swagger eslint prettier typescript ts-node jest ts-jest @types/node @types/jest nodemon`
- Maybe `fastify-swagger` will move to a production dependency, but I'm not sure having a Swagger UI on a production instance is wise
- Add `"esbenp.prettier-vscode"` to the extensions in `devcontainer.json` and rebuild the container to get the Prettier extension
- Brought in `.prettierrc`, `.prettierignore`, `tsconfig.json`, `jest.config.js`, `.eslintignore`, and `.eslintrc.js` from another project

I created a simple `index.ts` file in `src` and found `ts-node` fails with "unknown file extension" errors. This seems to be an issue with `ts-node` and Node 20. See [this issue](https://github.com/TypeStrong/ts-node/issues/2033). I'm changing `.devcontainer/node-dockerfile` and `.devcontainer/node-dc-compose.yaml` to use Node 18. I'm also not forcing to a specific subversion--any 18 will do. After deleting old containers and images (because it picked up Node 20 again--be sure to run `node -v` to confirm version if it unexpectedly fails), it works, though npm wants to be upgraded. from 9.x to 10.x. I'm leaving it as is for now.

I created a `start-dev` script to run `index.ts` and a `nodemon-dev` script to run it with `nodemon`. I'm not sure the latter makes sense because I'll probably edit several files before wanting to try again and will probably want to run tests first. But it exists and works.

So, the final thing to do is add a pre-commit hook to run Prettier so code is always formatted per spec. I'm using option 1 from [Prettier docs](https://prettier.io/docs/en/precommit.html) -- `npx mrm@2 lint-staged`.

And I get an error saying `usr/local/share/npm-global/lib` doesn't exist. Creating it and `chown`/`chmod` based on `.devcontainer/node-dockerfile` solves it, so update the Dockerfile to create `${NPM_GLOBAL}/lib` and change the `chown`/`chmod` commands to run recursively (`-R` option).

I also changed VS Code settings to format on save. I'm seeing some strange behavior with this and it seems to not honor the `.prettierrc` settings, even after adjusting VS Code settings more. I'll dig into this in more detail later. Right now, it isn't a critical issue.

The commit hook is failing. `npm i -D typescript-eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier` fixes it.

**COMMIT** CHORE: setup remaining parts of the environment so we're ready to build
