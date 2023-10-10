# Setting up ESM and first tests in Ava

## ESM

Before I start Ava tests, I want to set up for ESM--mainly so there's less retrofit to do. I'll use a couple of references:

- [Using Typescript Node.js with native ESM](https://gist.github.com/slavafomin/cd7a54035eff5dc1c7c2eff096b23b6b)
- [ECMAScript Modules in Node.js](https://www.typescriptlang.org/docs/handbook/esm-node.html)

What to do:

- Set `"type":"module"` in `package.json`.
- Ensure all `.ts` files are imported with `.js`.
- In `tsconfig.json`, set `"module": "NodeNext"` and`"moduleResolution": "NodeNext"`.
  - This setting differs from guidance in the gist, but is based on TS docs.

Let's build and try to run the built code. Ava prefers to test against built code, so I may move away from `ts-node`, especially given `tsc` is pretty quick.

It works.

## First tests in Ava

We need to install Ava and TypeScript support. `npm i -D ava @ava/typescript`.

In `package.json`, add the section described in the [@ava/typescript repo](https://github.com/avajs/typescript).

For the first test, let's test that livez returns "Service is alive." Doing so will require writing a test and making an HTTP call.

Building the test involved combining information from the Ava TS guide, testing docs and assertions docs, Fastify testing docs (they use tap, which is similar to Ava in many ways), etc. 

Change the test script in `package.json` to run `ava`.

It fails because the tests aren't built to `./dist`. Let's try renaming the test file to `.js` and removing TypeScript-isms. After several tries, that isn't working.

Let's try changing things up.

- In `tsconfig.json`, allow tests and test helpers into the build.
- Rename `tsconfig-build.json` to `tsconfig-deploy.json` and set it to exclude tests and test helpers.
- Make the test TypeScript again.

Build npm scripts as

```json
    "clean": "rimraf dist",
    "build:test": "npm run clean && tsc -p tsconfig.json",
    "test": "npm run build:test && ava",
    "start:test": "node ./dist/server.js",
    "build:deploy": "npm run clean && tsc -p tsconfig-deploy.json",
```

Now `npm run test` gives an error saying I can't use `t.teardown()` in hooks (`beforeEach`). So, let's move it to `afterEach()`.

Now the test fails because it can't parse the body as JSON. Which makes sense if I think about it. Use `result.payload` instead of `result.json()`.

Now the test fails because I told it to look for "Service is dead." That's the failure I expected to see, so let's fix the test.

Now the test passes. After a bit more cleanup, and adding a test helper to check `between()`, I think the zpages tests are good and I have a basic model for testing.

I will probably need to write more assertion helpers because Ava has a handful of basic assertions.

I also need to find a way to rebuild only the changed code. 

## Watch mode

Get TypeScript compiling with [watch mode](https://www.typescriptlang.org/docs/handbook/configuring-watch.html).

Get Ava running with [watch mode](https://github.com/avajs/ava/blob/main/docs/recipes/watch-mode.md).

Investigate `eslint-plugin-ava` mentioned in [Ava docs](https://github.com/avajs/ava/blob/main/docs/08-common-pitfalls.md).

Consider how `ts-node`, `ts-node-dev`, or `tsx` might play into the picture and how they might or might not work well with Ava. Investigate `tsc` and incremental compilation.

https://www.reddit.com/r/typescript/comments/11cunoh/question_does_tsc_watch_do_anything_special_or/
https://mgregersen.dk/how-to-best-setup-typescript-compilation-with-javascript-rerendering/
