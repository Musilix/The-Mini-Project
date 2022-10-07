import { FastifyPluginCallback, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { Repository } from 'typeorm';
import messages from '../messages/entity';

// import * as UserService from '../../services/UserService';
import users from '../users/entity';
import { postMessageSchema } from './schema';

const MessagesRoutes: FastifyPluginCallback = (fastify, _, done) => {
  // must perform declaration merging on our req objects, so we can grab IDs of users making requests.
  type UserRequest = FastifyRequest<{
    Params: { user_id: number; username: string; message_id: number };
    Body: { username: string; message: string; user: users };
  }>;

  // NOTE that in all the callback funcitons provided to these fastify route handlers, we can make them async
  // and in turn don't need to utilize the reply callback parameter to send back responses. We can instead just
  // return outright.

  //GET all messages
  fastify.get('/messages', async () => {
    const messagesTable: Repository<messages> = fastify.psqlDB.messages;

    let messages: messages[] = await messagesTable.find({
      relations: {
        user: false,
      },
    });

    return messages;
  });

  // POST message for a given user
  fastify.post('/messages', postMessageSchema, async (req: UserRequest) => {
    try {
      const messagesTable: Repository<messages> = fastify.psqlDB.messages;
      const userAdding = req.body.user;

      const newMessage = messagesTable.create({
        // Future Note: I didn't realize that once we have a true relation defined beteween 2 entities, we will have to go through that relational column (in this case 'user' of type users)
        // and then through that we define the actual FK field we are interested in (in this case, user_id of the users type)
        user: { user_id: userAdding.user_id },
        message: req.body.message,
      });

      await messagesTable.save(newMessage);

      return {
        statusCode: 200,
        code: 'Success',
        message: `Successfully added Message for ${req.body.user.username}`,
        time: new Date(),
      };
    } catch (e) {
      return {
        statusCode: 500,
        code: 'Internal server error',
        message: `Error adding message for ${req.body.user.username}`,
        error: e,
        time: new Date(),
      };
    }
  });

  fastify.put('/message/:message_id', async (req: UserRequest) => {
    try {
      const messagesTable: Repository<messages> = fastify.psqlDB.messages;
      await messagesTable
        .createQueryBuilder('messages')
        .update(messages)
        .set({ message: req.body.message })
        .where('message_id = :message_id', {
          message_id: req.params.message_id,
        })
        .execute();

      return {
        statusCode: 200,
        code: 'Success',
        message: `Successfully updated Message with an ID of ${req.params.message_id}`,
        time: new Date(),
      };
    } catch (e) {
      return {
        statusCode: 500,
        code: 'Internal server error',
        message: `Error updating message-${req.params.message_id}`,
        error: e,
        time: new Date(),
      };
    }
  });

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
