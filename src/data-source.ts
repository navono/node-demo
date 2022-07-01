import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { root } from "./paths"

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: `${root}/data/line.sqlite`,
  entities: [User],
  logging: true,
  synchronize: true,
});
