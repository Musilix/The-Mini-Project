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
    userName: string;
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
  fastify.get('/:username', async (req: UserRequest) => {
    try {
      const usersTable: Repository<users> = fastify.psqlDB.users;

      let specificUser: users | null = await usersTable.findOne({
        select: {
          username: true,
          user_age: true,
        },
        where: { username: req.params.username },
      });

      return specificUser;
    } catch (e) {
      return {
        statusCode: 500,
        code: 'Internal server error',
        message: `Error retrieving details on${req.params.username}`,
        error: e,
        time: new Date(),
      };
    }
  });

  fastify.get('/:username/messages', async (req: UserRequest) => {
    try {
      //TODO: abstract out to /:username endpoint in here?
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

      await usersTable
        .createQueryBuilder('user') // This will be the alias we refer to our Entity A (in this case, the "users" table)
        .insert()
        .into(users)
        .values([newUser])
        .execute();

      return {
        statusCode: 200,
        code: 'Success',
        message: `Successfully added new User`,
        time: new Date(),
      };
    } catch (e) {
      let errMsg = '';
      if (e.code === '23505') {
        errMsg = 'User already exists';
      } else {
        errMsg =
          "Something went wrong, but we don't know what. Try creating an account again.";
      }

      return {
        statusCode: 500,
        code: 'Internal server error',
        message: errMsg,
        error: e,
        time: new Date(),
      };
    }
  });

  fastify.post('/iam', async (req: UserRequest) => {
    try {
      if (req.session.get('userName')) {
        return {
          message: `You are already signed in under ${req.session.get(
            'userName'
          )}`,
        };
      }

      // Set up session object with a userName field so we can retrieve necessary (specific) user details when we need
      req.session.set('userName', req.body.username);

      // This DOESNT work
      // req.session.userId = req.query.id;

      return {
        message: `You are signed in under ${req.body.username}`,
      };
    } catch (e) {
      console.error();
      return {
        error: '501',
        message: 'Error Signing in',
        e: e,
      };
    }
  });

  fastify.post('/iamnomore', async (req: UserRequest) => {
    if (req.session.get('userName')) {
      //remove cookie for user if they manually log out
      req.session.destroy();

      return {
        code: 200,
        message: 'Logged out succesfully',
      };
    }

    return {
      status: 403,
      message: 'How did you do that?',
    };
  });

  fastify.get('/whoami', async (req: UserRequest) => {
    try {
      const usersTable: Repository<users> = fastify.psqlDB.users;
      const userSession: Session = req.session;

      // No Cookie sent for fastify-session to decrypt and verify
      if (!userSession.get('userName')) {
        return null;
      }

      const user = await usersTable.findOne({
        where: { username: userSession.get('userName')! },
      });
      return user;
    } catch (e) {
      console.error(e);
      return {
        error: '501',
        message: 'Error Retrieving Session Details',
      };
    }
  });

  done();
};

export default fp(UsersRoute, '4.x');
