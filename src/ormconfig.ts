import * as dotenv from 'dotenv';
import tls, { PeerCertificate } from 'node:tls';
import path from 'path';
import { DataSourceOptions } from 'typeorm';
import { __prod__ } from './constants';

dotenv.config();

export default {
  type: 'postgres',
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  logging: !__prod__,
  synchronize: !__prod__, // I thought it may have been a bad idea to sync in local, but ultimately... as you make changes in dev, you only wanna generate a mig for the final decision. Having sync to false and running a mig everytime yo uwanna look at some possible changes would create a lot of bloat mig files which is unecessary
  ssl: getSSLConfig(),
  migrationsRun: __prod__, // TODO: Maybe don't do this... but seems like a good way to run any new generated migrations in prod to propogate changes for now

  /* TODO: possibly switch this back to only use the files found in the dist folder...
   * I'm kinda fuckin confused rn... I remember there was some reason I had pointed my entities, migrations, subs to the dist folder, but can't fully recall what it was...
   * As it stands now though, I set up typeorm-ts-node-esm within my pkg file, so it can technically handle TS files. I'm able to generate migrations directly from my TS entities,
   * but I'm not sure if it's better practice to just generate migration from the JS files that get built into the dist
   */
  entities: [path.join(__dirname, '/modules/**/entity.{ts,js}')], // Future Note: Keep in mind that if you are going to generate a migration, you must build the project after any changes to entities, as we set entities to point to the dist folder her
  migrations: ['dist/migrations/**/*.js'], //when running migration:run, it will use the JS files in the dist, so build project after generating migrations. Maybe best to keep it as dist, as we will usually be running the migrations in prod (dist)
  subscribers: ['src/subscriber/**/*.ts'],
} as DataSourceOptions;

function getSSLConfig() {
  if (process.env.SSL_CA && process.env.SSL_CERT && process.env.SSL_KEY) {
    return {
      checkServerIdentity: (nohost: string, cert: PeerCertificate) => {
        if (process.env.DB_CN) {
          return tls.checkServerIdentity(process.env.DB_CN!, cert);
        }

        return tls.checkServerIdentity(nohost, cert);
      },
      sslmode: 'verify-full',
      ca: process.env.SSL_CA.replace(/\\n/g, '\n'),
      cert: process.env.SSL_CERT.replace(/\\n/g, '\n'),
      key: process.env.SSL_KEY.replace(/\\n/g, '\n'),
    };
  }

  // no ssl on local dev
  return false;
}
