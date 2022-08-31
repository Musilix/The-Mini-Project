import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import dataSrcOptions from 'ormconfig';
import { DataSource, Repository } from 'typeorm';

import messages from '../modules/messages/entity';
import users from '../modules/users/entity';

// need to do some declaration merging to append new psqlDB decorator to fastify instance
declare module 'fastify' {
  interface FastifyInstance {
    psqlDB: {
      messages: Repository<messages>;
      users: Repository<users>;
    };
  }
}

async function dbConnector(fastify: FastifyInstance) {
  try {
    const AppDataSource = await new DataSource(dataSrcOptions).initialize(); // we dont use deprecated connection class here! yippee
    fastify.decorate('psqlDB', {
      messages: AppDataSource.getRepository(users),
      users: AppDataSource.getRepository(messages),
    });
  } catch (e) {
    console.error(`Something went dreadfully wrong: ${e}`);
  }
}

export default fp(dbConnector);
