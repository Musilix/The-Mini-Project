// import { Session } from '@mgcrea/fastify-session';
import { Session } from '@mgcrea/fastify-session';
import { S3 } from 'aws-sdk';
import { FastifyPluginCallback, FastifyRequest } from 'fastify';
import multer from 'fastify-multer';
import fp from 'fastify-plugin';
import { __usrImgsBucket__ } from '../../constants';
// import sharp from 'sharp';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as UserService from '../../services/UserService';
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

// Create a set of customized properties for our custom UserRequest type
// We seperate these custom properties out so we can specify them on our route.post() call when doing img uploads
// * If we dont provide the custom props like such route.post<customProps>() it will cause typing issues when we try to use our UserReq custom object in the route handler function
interface CustomRouteProperties {
  Params: { user_id: number; username: string };
  Body: { username: string; user_age: string };
  Querystring: { id: string };
}
interface RequestFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: {
    type: string;
    data: number[];
  };
  size: number;
}
declare module '@mgcrea/fastify-session' {
  interface SessionData {
    userName: string;
  }
}
// let TS know that we'll have a new "file" field on our req objects
declare module 'fastify' {
  export interface FastifyRequest {
    file: RequestFile;
  }
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const UsersRoute: FastifyPluginCallback = (fastify, _, done) => {
  //TODO: Abstract out of file?
  // extending fastify request type, auto override  the 3 fields we care about rn... butttt, we gotta let it be known that we can still hold the default expected val type in each field - being "unknown"... ugly.
  type UserRequest = FastifyRequest<CustomRouteProperties>;

  // Get all active Users
  fastify.get('/users', async () => {
    const usersTable: Repository<users> = fastify.psqlDB.users;
    let users: users[] = await usersTable.find({
      select: {
        user_id: true,
        username: true,
        user_age: true,
      },
      relations: { messages: false },
    });
    return users;
  });

  // Get details on user
  fastify.get('/:username', async (req: UserRequest) => {
    return UserService.getUser(fastify, req.params.username);
  });

  // TODO: move all this controller business logic junk to svc
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
          'messages.message_id as id',
          'messages.message as message',
          'messages.posting_date as posting_date',
          'messages.edited_on as edit_date',
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

  /* Notes
   * Make sure that if you want the multer middleware to parse a multiform file data, you provide an upload means through a pre-handler function
   * the prehandler will work its magic, use the dest you provide, the memoryStorage you provide, or the diskStorage you provide to do it's magic
   * a file field and a body field will be appended to our req object, but YOU MUST MAKE SURE that the name provided to the upload func === the name of the form field
   
  * Make sure you also set the generic to your set of custom props that u use on UserRequest type
  */

  // TODO: move this work to routes related to UserUploads, rather than User
  fastify.post<CustomRouteProperties>(
    '/user/upload',
    { preHandler: upload.single('propic') },
    async (req: UserRequest) => {
      const s3 = new S3({
        credentials: {
          accessKeyId: process.env.aws_access_key!,
          secretAccessKey: process.env!.aws_secret_access_key!,
        },
        signatureVersion: 'v4',
        region: 'us-west-2',
      });

      // TODO: abstract this out to a worker class
      const res = await new Promise((resolve, reject) => {
        const image_id = uuidv4();
        s3.putObject(
          {
            Bucket: __usrImgsBucket__,
            ContentType: req.file.mimetype,
            Key: `images/${image_id}`,
            Body: req.file.buffer,
          },

          (err, data) => {
            if (err) {
              reject(err);
            }

            return resolve(data);
          }
        );
      });

      return { res };
    }
  );

  done();
};

export default fp(UsersRoute, '4.x');
