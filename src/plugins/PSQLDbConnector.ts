import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
// import dataSrcOptions from 'ormconfig';
import { DataSource, Repository } from 'typeorm';

import messages from '../modules/messages/entity';
import users from '../modules/users/entity';

import typeormConfig from '../../ormconfig';

// import { __prod__ } from '../../constants';
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
    const AppDataSource = await new DataSource(typeormConfig).initialize();
    fastify.decorate('psqlDB', {
      messages: AppDataSource.getRepository(messages),
      users: AppDataSource.getRepository(users),
    });
  } catch (e) {
    console.error(`Something went dreadfully wrong: ${e}`);
  }
}

export default fp(dbConnector);
