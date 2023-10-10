import avaTest, { TestFn } from 'ava';

import { between } from '../../test-helpers/assertionHelpers.js';

import fastify, { FastifyInstance } from 'fastify';
import { buildApp } from '../../app.js';


const test = avaTest as TestFn<{app: FastifyInstance}>;

test.beforeEach(async t => {
    const server = fastify({
        logger: {
            level: 'silent',
        }
    });
    await buildApp(server);
    t.context = { 
        app: server
    };
});

test.afterEach(async t => {
    await t.context.app.close();
});

test('livez', async t => {
    const result = await t.context.app.inject({
        method: 'GET',
        url: '/zpages/livez'
    })

    t.is(result.statusCode, 200);
    t.is(result.payload, 'Service is alive.');
});

test('readyz', async t => {
    const result = await t.context.app.inject({
        method: 'GET',
        url: '/zpages/readyz'
    })

    t.is(result.statusCode, 200);
    t.is(result.payload, 'Service is ready.');
});

test('healthz', async t => {
    const startTime = new Date();
    const result = await t.context.app.inject({
        method: 'GET',
        url: '/zpages/healthz'
    });
    const endTime = new Date();

    t.is(result.statusCode, 200);
    t.truthy(result.payload);
    const body = result.json();
    const bodyTime = new Date(body.time);
    t.true(between(bodyTime.valueOf(), startTime.valueOf(), endTime.valueOf()));
});