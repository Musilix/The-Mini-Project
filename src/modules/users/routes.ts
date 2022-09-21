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
    Params: { user_id: number };
    Body: { user_name: string; user_age: string };
    Querystring: { id: string };
  }>;

  // Get all active Users
  fastify.get('/users', async () => {
    const usersTable: Repository<users> = fastify.psqlDB.users;
    let users: users[] = await usersTable.find({
      relations: { messages: true },
    });
    return users;
  });

  // Get details on user
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

  fastify.post('/iam', async (req: UserRequest) => {
    try {
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

  // TODO: set up join query to return messages related to a given user name (use user_id PK)
  // fastify.get('/:user_name/messages', async () => {
  //   const messagesTable: Repository<messages> = fastify.psqlDB.messages;
  //   const userMessages: messages[] = await messagesTable.find({
  //     where:
  //   })
  // })

  done();
};

export default fp(UsersRoute, '4.x');
