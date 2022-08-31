import { DataSourceOptions } from 'typeorm';

// TODO: SWITCH TO USE ENV VARIABLES
const dataSrcOptions: DataSourceOptions = {
  type: 'postgres',
  port: 8888,
  host: 'localhost',
  username: process.env.POSTGRESUSER,
  password: process.env.POSTGRESPASS,
  database: 'theminiproject',
  logging: false,
  synchronize: true,
  entities: ['src/modules/*/entity/**/*.ts'],
  migrations: ['src/migration/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
  //  "cli": {
  //     "entitiesDir": "src/entity",
  //     "migrationsDir": "src/migration",
  //     "subscribersDir": "src/subscriber"
  //  }
};

export default dataSrcOptions;
