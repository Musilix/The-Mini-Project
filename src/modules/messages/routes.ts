import { FastifyPluginCallback, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { Repository } from 'typeorm';
import messages from '../messages/entity';
import { postMessageSchema } from './schema';

const MessagesRoutes: FastifyPluginCallback = (fastify, _, done) => {
  // must perform declaration merging on our req objects, so we can grab IDs of users making requests.
  type UserRequest = FastifyRequest<{
    Params: { user_id: number; message_id: number };
    Body: { message: string };
  }>;

  // NOTE that in all the callback funcitons provided to these fastify route handlers, we can make them async
  // and in turn don't need to utilize the reply callback parameter to send back responses. We can instead just
  // return outright.

  //GET all messages
  fastify.get('/messages', async () => {
    const messagesTable: Repository<messages> = fastify.psqlDB.messages;

    let messages: messages[] = await messagesTable.find();

    return messages;
  });

  // GET messages for a user
  fastify.get('/messages/:id', async () => {
    return 1;
  });

  // POST message for a given user
  fastify.post(
    '/messages/:user_id',
    postMessageSchema,
    async (req: UserRequest) => {
      try {
        const messagesTable: Repository<messages> = fastify.psqlDB.messages;

        const newMessage = messagesTable.create({
          user_id: req.params.user_id,
          message: req.body.message,
        });
        await messagesTable.save(newMessage);
      } catch (e) {
        console.error('wah wah');
        return {
          statusCode: 500,
          code: 'Internal server error',
          message: `Error adding message for user-${req.params.user_id}`,
          error: e,
          time: new Date(),
        };
      }

      return {
        statusCode: 200,
        code: 'Success',
        message: `Successfully added Message for user-${req.params.user_id}`,
        time: new Date(),
      };
    }
  );

  // DELETE all messages

  // DELETE all messages for a given user

  // DELETE specific message
  fastify.delete(
    '/messages/:message_id',

    async (req: UserRequest) => {
      try {
        const messagesTable: Repository<messages> = fastify.psqlDB.messages;

        await messagesTable.delete({
          message_id: req.params.message_id,
        });
      } catch (e) {
        console.error('wah wah');
        return {
          statusCode: 500,
          code: 'Internal server error',
          message: `Error deleting message-${req.params.message_id}`,
          error: e,
          time: new Date(),
        };
      }

      return {
        statusCode: 200,
        code: 'Success',
        message: `Successfully deleted message-${req.params.message_id}`,
        time: new Date(),
      };
    }
  );

  done();
};

export default fp(MessagesRoutes, '4.x');
