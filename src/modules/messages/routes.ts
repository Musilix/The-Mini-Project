import { FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';
import { Repository } from 'typeorm';
import messages from '../messages/entity';

const MessagesRoutes: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get('/messages', async () => {
    const messagesTable: Repository<messages> = fastify.psqlDB.messages;

    // will default to returning all elements from table since no where clause specified
    let messages: messages[] = await messagesTable.find();

    return messages;
  });

  done();
};

export default fp(MessagesRoutes, '4.x');
