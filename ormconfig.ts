import path from 'path';
import { DataSourceOptions } from 'typeorm';

export default {
  type: 'postgres',
  port: 8888,
  host: process.env.POSTGRESHOST,
  username: process.env.POSTGRESUSER,
  password: process.env.POSTGRESPASS,
  database: process.env.POSTGRESDB,
  logging: false,
  synchronize: false,
  entities: [path.join(__dirname, './modules/**/entity.js')],
  migrations: ['src/migration/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
} as DataSourceOptions;
