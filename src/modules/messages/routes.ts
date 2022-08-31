import { FastifyPluginCallback, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { Repository } from 'typeorm';
import messages from '../messages/entity';

const MessagesRoutes: FastifyPluginCallback = (fastify, _, done) => {
  // must perform declaration merging on our req objects, so we can grab IDs of users making requests.
  type UserRequest = FastifyRequest<{
    Params: { user_id: string };
    Body: { message: string };
  }>;

  fastify.get('/messages', async () => {
    const messagesTable: Repository<messages> = fastify.psqlDB.messages;

    let messages: messages[] = await messagesTable.find();

    return messages;
  });

  fastify.post('/messages/:user_id', async (req: UserRequest) => {
    try {
      const messagesTable: Repository<messages> = fastify.psqlDB.messages;
      const newMessage = messagesTable.create({
        user_id: req.params.user_id,
        message: req.body.message,
      });
      await messagesTable.save(newMessage);
    } catch (e) {
      return {
        statusCode: 500,
        code: '500 - internal server error',
        message: 'Error adding message for user',
        error: e,
        time: new Date(),
      };
    }

    return {
      statusCode: 200,
      code: '200 - Success',
      message: 'Successfully added Message for User',
      time: new Date(),
    };
  });

  done();
};

export default fp(MessagesRoutes, '4.x');
