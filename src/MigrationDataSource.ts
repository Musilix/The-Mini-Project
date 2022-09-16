// DataSource instance needed for running migrations
import { DataSource } from 'typeorm';
import typeormConfig from './ormconfig';

// I made such a noob mistake with this. I was returning datasource().initialize() which wasnt throwing
// any errors, but WAS connecting to the DB, so when typeorm tried to connect to the DB during migrations,
// it wasn't able to as we had already connected after calling initialize()... smh....
export const AppDataSource = new DataSource(typeormConfig);
