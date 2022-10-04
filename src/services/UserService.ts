import { FastifyInstance } from 'fastify';
import { Repository } from 'typeorm';
import users from '../modules/users/entity';

export async function getUser(fastify: FastifyInstance, username: string) {
  try {
    const usersTable: Repository<users> = fastify.psqlDB.users;

    let specificUser: users | null = await usersTable.findOne({
      select: {
        user_id: true,
        username: true,
        user_age: true,
      },
      where: { username: username },
    });

    return specificUser;
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      code: 'Internal server error',
      message: `Error retrieving details on${username}`,
      error: e,
      time: new Date(),
    };
  }
}
