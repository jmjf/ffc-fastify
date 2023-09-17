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