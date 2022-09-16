import { FastifyPluginCallback, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { Repository } from 'typeorm';
// import messages from '../messages/entity';
import users from './entity';

const UsersRoute: FastifyPluginCallback = (fastify, _, done) => {
  type UserRequest = FastifyRequest<{
    Params: { user_id: number };
    Body: { user_name: string; user_age: string };
  }>;

  // Get all active Users
  fastify.get('/users', async () => {
    const usersTable: Repository<users> = fastify.psqlDB.users;
    let users: users[] = await usersTable.find();
    return users;
  });

  // TODO: return details on user + messages attached to user
  fastify.get('/users/:user_id', async (req: UserRequest) => {
    try {
      const usersTable: Repository<users> = fastify.psqlDB.users;
      let specificUser: users = (
        await usersTable.find({
          where: { user_id: req.params.user_id },
        })
      )[0];

      return specificUser;
    } catch (e) {
      console.error('wah wah');
      return {
        statusCode: 500,
        code: 'Internal server error',
        message: `Error adding retrieving User-${req.params.user_id}`,
        error: e,
        time: new Date(),
      };
    }
  });

  // Create User
  fastify.post('/users', async (req: UserRequest) => {
    try {
      const usersTable: Repository<users> = fastify.psqlDB.users;
      const newUser = usersTable.create({
        user_name: req.body.user_name,
        user_age: req.body.user_age,
      });

      await usersTable.save(newUser);

      return {
        statusCode: 200,
        code: 'Success',
        message: `Successfully added new User`,
        time: new Date(),
      };
    } catch (e) {
      console.error('wah wah');
      return {
        statusCode: 500,
        code: 'Internal server error',
        message: `Error adding new User`,
        error: e,
        time: new Date(),
      };
    }
  });

  // TODO: set up join query to return messages related to a given user name (use user_id PK)
  // fastify.get('/users/:user_name/messages', async () => {
  //   const messagesTable: Repository<messages> = fastify.psqlDB.messages;
  //   const userMessages: messages[] = await messagesTable.find({
  //     where:
  //   })
  // })

  done();
};

export default fp(UsersRoute, '4.x');
