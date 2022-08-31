import { FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';
import { Repository } from 'typeorm';
import users from './entity';

const UsersRoute: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get('/users', async () => {
    const usersTable: Repository<users> = fastify.psqlDB.users;
    let users: users[] = await usersTable.find();
    return users;
  });

  done();
};

export default fp(UsersRoute, '4.x');
