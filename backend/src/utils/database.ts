import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { initModels } from '../models/init-models';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

class Database {
  private static instance: Sequelize;

  private constructor() {}

  public static getInstance(): Sequelize {
    if (!Database.instance) {
      const dbName: string = process.env.MYSQL_DATABASE || '';
      const dbUsername: string = process.env.MYSQL_USER || '';
      const dbPassword: string = process.env.MYSQL_PASSWORD || '';
      const dbHost: string = process.env.DB_HOST || '';
      const dbPort: number = Number(process.env.DB_PORT) || 3306;

      Database.instance = new Sequelize(dbName, dbUsername, dbPassword, {
        host: dbHost,
        port: dbPort,
        dialect: 'mysql',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      });
    }

    return Database.instance;
  }
}

export const sequelize = Database.getInstance();
export const models = initModels(sequelize);
export default Database;