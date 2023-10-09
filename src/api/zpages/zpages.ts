import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export async function registerZpagesRoutes(server: FastifyInstance) {

    server.route({
        method: 'GET',
        url: '/livez',
        schema: {
            response: {
                200: {
                    type: 'string'
                }
            }
        },
        handler: function (request: FastifyRequest, reply: FastifyReply) {
            reply.code(200).send('Service is alive.');
        }
    });

    server.route({
        method: 'GET',
        url: '/readyz',
        schema: {
            response: {
                200: {
                    type: 'string'
                }
            }
        },
        handler: function(request: FastifyRequest, reply: FastifyReply) {
            // if ready 
            reply.code(200).send('Service is ready.');
            // else reply 500
        }
    });

    server.route({
        method: 'GET',
        url: '/healthz',
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        time: {
                            type: 'string',
                        }
                    }
                }
            }
        },
        handler: function(request: FastifyRequest, reply: FastifyReply) {
            reply.code(200).send({
                time: (new Date()).toISOString(),
            });
        }
    });
}