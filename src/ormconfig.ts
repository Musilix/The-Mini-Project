import * as dotenv from 'dotenv';
import tls, { PeerCertificate } from 'node:tls';
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
  logging: true,
  synchronize: !__prod__,
  ssl: getSSLConfig(),
  entities: ['dist/modules/**/entity.js'],
  migrations: ['dist/migration/**/*.ts'],
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
