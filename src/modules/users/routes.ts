// import { Session } from '@mgcrea/fastify-session';
import { Session } from '@mgcrea/fastify-session';
import { FastifyPluginCallback, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { Repository } from 'typeorm';
import users from './entity';
/* 
  *This is NOT the way fastify-session or mcgrea/fastify-session recommended augmenting the module that contained session fields, but their recommended methods DIDNT work,
  *so I found out how to actually make it work by directly augmenting the Session on the fastify module itself.

  *The fastify session module augments the Session interface (that resides in the fastify module) with it' own SessionDetails namespace/internal interface. (Session extends SessionDetails)
  *his adds the fields defined in the Sessiondetails to the Session interface. So we can just do the same directly to the Session interface for the fields we want to define on the session (in our case, userId)
*/

// declare module '@mgcrea/fastify-session' {
//   interface Session<T extends SessionData = SessionData> {
//     userId: string;
//   }
// }

declare module '@mgcrea/fastify-session' {
  interface SessionData {
    userId: string;
  }
}

const UsersRoute: FastifyPluginCallback = (fastify, _, done) => {
  //TODO: Abstract out of file
  type UserRequest = FastifyRequest<{
    // session: Session;
    Params: { user_id: number; username: string };
    Body: { username: string; user_age: string };
    Querystring: { id: string };
  }>;

  // Get all active Users
  fastify.get('/users', async () => {
    const usersTable: Repository<users> = fastify.psqlDB.users;
    let users: users[] = await usersTable.find({
      select: {
        username: true,
        user_age: true,
      },
      relations: { messages: false },
    });
    return users;
  });

  // Get details on user
  fastify.get('/users/:user_id', async (req: UserRequest) => {
    try {
      const usersTable: Repository<users> = fastify.psqlDB.users;
      let specificUser: users = (
        await usersTable.find({
          select: {
            username: true,
            user_age: true,
          },
          where: { user_id: req.params.user_id },
        })
      )[0];

      return specificUser;
    } catch (e) {
      console.error('wah wah');
      return {
        statusCode: 500,
        code: 'Internal server error',
        message: `Error retrieving User-${req.params.user_id}`,
        error: e,
        time: new Date(),
      };
    }
  });

  fastify.get('/:username/messages', async (req: UserRequest) => {
    try {
      const usersTable: Repository<users> = fastify.psqlDB.users;
      const user = await usersTable.findOne({
        select: { user_id: true },
        where: { username: req.params.username },
      });

      // No user with that username found
      if (!user) {
        return {
          statusCode: 404,
          code: 'Not Found',
          message: `User by the name ${req.params.username} was not found`,
          time: new Date(),
        };
      }

      const userMessages = await usersTable
        .createQueryBuilder('user') // This will be the alias we refer to our Entity A (in this case, the "users" table)
        .innerJoin('user.messages', 'messages', 'messages.user_id = :id', {
          id: user.user_id,
        }) //join our 2 tables and store it under the alias "messages". Any row in the users and messages table which has the user_id of user.use_id will be added to this temp table
        .select([
          'messages.message as message',
          'messages.posting_date as posting_date',
        ]) //select the fields we need (under any alias we'd like)
        .getRawMany(); //since what we're working with wasnt a true entity, but rather a middleground temp alias ("messages"), it isn't register as an entity, so getMany() doesn't work to execute and retrieve. We need to run getRawMany()

      return userMessages;
    } catch (e) {
      console.error('wah wahmp');
      return {
        statusCode: 500,
        code: 'Internal server error',
        message: `Error retrieving messages for ${req.params.username}`,
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
        username: req.body.username,
        user_age: req.body.user_age,
      });

      // TODO: Switch to use the queryBUilder here as it is more optimal in the case of inserting a new object into a DB filled with a lot of items
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

  fastify.post('/iam', async (req: UserRequest) => {
    try {
      // Set up session object with a userId field so we can retrieve necessary (specific) user details when we need
      req.session.set('userId', req.query.id);

      // This DOESNT work
      // req.session.userId = req.query.id;
      return {
        message: `You are signed in under userId ${req.query.id}`,
      };
    } catch (e) {
      console.error();
      return {
        error: '501',
        message: 'Error Setting Session Details',
      };
    }
  });

  fastify.get('/whoami', async (req: UserRequest) => {
    try {
      const usersTable: Repository<users> = fastify.psqlDB.users;
      const userSession: Session = req.session;

      // No Cookie sent for fastify-session to decrypt and verify
      if (!userSession.get('userId')) {
        return null;
      }

      const user = usersTable.find({
        where: { user_id: parseInt(userSession.get('userId')!) },
      });

      return user;
    } catch (e) {
      console.error();
      return {
        error: '501',
        message: 'Error Retrieving Session Details',
      };
    }
  });

  done();
};

export default fp(UsersRoute, '4.x');
