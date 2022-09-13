import * as dotenv from 'dotenv';
import tls, { PeerCertificate } from 'node:tls';
import { DataSourceOptions } from 'typeorm';

dotenv.config();

export default {
  type: 'postgres',
  port: 5432,
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  logging: true,
  synchronize: false,
  ssl: { ...getSSLConfig() },
  entities: ['dist/src/modules/**/entity.js'],
  migrations: ['dist/src/migration/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
} as DataSourceOptions;

function getSSLConfig() {
  if (process.env.SSL_CA && process.env.SSL_CERT && process.env.SSL_KEY) {
    return {
      checkServerIdentity: (_nohost: string, cert: PeerCertificate) => {
        return tls.checkServerIdentity(process.env.DB_CN!, cert);
      },
      sslmode: 'verify-full',
      ca: process.env.SSL_CA.replace(/\\n/g, '\n'),
      cert: process.env.SSL_CERT.replace(/\\n/g, '\n'),
      key: process.env.SSL_KEY.replace(/\\n/g, '\n'),
    };
  }

  return {};
}
