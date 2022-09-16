import fastify, { FastifyInstance } from 'fastify';

// import fastifySwagger from '@fastify/swagger';
// import SwaggerConfig from '../swaggerconfig';
import MessagesRoutes from './modules/messages/routes';

import * as dotenv from 'dotenv';
import UsersRoute from './modules/users/routes';
import dbConnector from './plugins/PSQLDbConnector';

import cors from '@fastify/cors';

// For working locally with env vars
dotenv.config();
//t
const server: FastifyInstance = fastify();
const serverOpts = {
  port: parseInt(`${process.env.PORT}`, 10) || 8080,
  host: process.env.DO_HOST || '127.0.0.1',
};

// Server and frontend are on different domains atm
server.register(cors, {
  origin: process.env.CORS_ORIGIN,
});

server.register(dbConnector);
server.register(MessagesRoutes);
server.register(UsersRoute);

server.get('/', async () => {
  //TODO: return root page from web frontend?

  //placeholder
  return {
    statusCode: 200,
    code: 'Success',
    message: "WE'RE UP AND RUNNIN",
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
