import fastify from 'fastify';
import { buildApp } from './app';

async function startServer() {

    const apiPort = parseInt(process.env.API_PORT || '9080');

    const server = fastify({
        logger: {
            level: 'info',
        }
    });

    await buildApp(server);

    server.listen({ port: apiPort, host: '0.0.0.0'}, (err, address) => {
        if (err) {
            server.log.fatal(err, 'SERVER START ERROR');
            process.exit(1);
        }

        server.log.info(`Server listening at ${address}.`);
    });
}

startServer();


