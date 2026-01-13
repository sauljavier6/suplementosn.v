// src/config/database.ts
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import Product from '../models/Product';
import Stock from '../models/Stock';
import Store from '../models/Store';
import User from '../models/User';
import LoyverseSyncState from '../models/LoyverseSyncState';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  models: [ Product, Stock, Store, User, LoyverseSyncState],
  logging: false,
});

export default sequelize;
