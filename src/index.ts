import fastify, { FastifyInstance } from 'fastify';

// import fastifySwagger from '@fastify/swagger';
// import SwaggerConfig from '../swaggerconfig';
import MessagesRoutes from './modules/messages/routes';

import * as dotenv from 'dotenv';
import UsersRoute from './modules/users/routes';
import dbConnector from './plugins/PSQLDbConnector';

import cors from '@fastify/cors';

import fastifyCookie from '@fastify/cookie';
import fastifySession from '@mgcrea/fastify-session';
import RedisStore from '@mgcrea/fastify-session-redis-store';
import Redis from 'ioredis';
import { __prod__ } from './constants';

// For working locally with env vars
dotenv.config();
const server: FastifyInstance = fastify();
const serverOpts = {
  port: parseInt(`${process.env.PORT}`, 10) || 8080,
  host: process.env.DO_HOST || '127.0.0.1',
};

// Configure Redis Client and a Session Store object (based around the Redis Client Instance)
const redis = new Redis(process.env.REDIS_URL!);
const redisStore = new RedisStore({
  client: redis,
  // disableTouch: true
});

// Server and frontend are on different domains atm
// Allow CORs + credentials, so Cookies can be sent here by browser
server.register(cors, {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
});

server.register(fastifyCookie);
// Details on Cookie metadata: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
server.register(fastifySession, {
  secret: process.env.SESS_SALT!, // The salt we use to has a cookie on the server side
  cookieName: 'qid', // just a cookie name
  cookie: {
    maxAge: 60 * 3, // 3 mins - sets expire date by date.now() + maxAge
    httpOnly: true, // stops JS from being able to access cookie details on client side
    sameSite: 'lax',
    secure: __prod__, // cookie is sent to server only when request is made with https
    domain: __prod__ ? 'squatch.skin' : undefined, // the host to which the cookie will be sent - will default to current document URL (not including subdomains)
  },
  store: redisStore,
  saveUninitialized: false, // if set to false, this will only save a session to our session store ONLY when we mutate or create it. I have no clue why you would want to store blank sessions upon a fresh load of a webpage...
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
