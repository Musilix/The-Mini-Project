// import path from 'path';
import { DataSourceOptions } from 'typeorm';

export default {
  type: 'postgres',
  port: 8888,
  host: 'localhost',
  username: 'kareem',
  password: '560688Ks!',
  database: 'theminiproject',
  logging: true,
  synchronize: false,
  entities: ['dist/src/modules/**/entity.js'],
  migrations: ['src/migration/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
} as DataSourceOptions;
