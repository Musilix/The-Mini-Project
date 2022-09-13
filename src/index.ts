import fastify, { FastifyInstance } from 'fastify';

// import fastifySwagger from '@fastify/swagger';
// import SwaggerConfig from '../swaggerconfig';
import MessagesRoutes from './modules/messages/routes';

import * as dotenv from 'dotenv';
import UsersRoute from './modules/users/routes';
import dbConnector from './plugins/PSQLDbConnector';

// For working locally with env vars
dotenv.config();
const server: FastifyInstance = fastify();
const serverOpts = {
  port: parseInt(`${process.env.PORT}`, 10) || 8080,
  host: `${process.env.DO_HOST}` || '127.0.0.1',
};

server.register(dbConnector);
console.info('db registered');

server.register(MessagesRoutes);
server.register(UsersRoute);

server.get('/', async () => {
  return {
    statusCode: 200,
    code: 'Success',
    message: 'hello mawmaw',
    time: new Date(),
  };
});

server.listen(serverOpts, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.info(`Server listening at ${address}`);
});
