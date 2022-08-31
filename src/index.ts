// import fp from 'fastify-plugin';
// import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import fastify, { FastifyInstance } from 'fastify';
// import path from 'path';
// import fastifySwagger from '@fastify/swagger';
// import SwaggerConfig from '../swaggerconfig';
import MessagesRoutes from './modules/messages/routes';
import dbConnector from './plugins/PSQLDbConnector';

const server: FastifyInstance = fastify();

// server.register(fp(fastifySwagger), SwaggerConfig);
server.register(dbConnector);
server.register(MessagesRoutes);

server.get('/ping', (_, res) => {
  res.send('PONG');
});
// listen on 8080 locallys
server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
