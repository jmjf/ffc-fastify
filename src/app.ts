import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { registerZpagesRoutes } from './api/zpages/zpages.js';

export async function buildApp(server: FastifyInstance) {
    server.register(registerZpagesRoutes, { prefix: '/zpages'});
    server.get('/hello', async (request: FastifyRequest, reply: FastifyReply) => {
        reply.code(200).send('Hello world!');
    });
}