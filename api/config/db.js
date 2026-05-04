import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;
const isProduction = process.env.NODE_ENV === "production";
const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false 
      }
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      ssl: false,
    };

export const pool = new Pool(dbConfig);

pool.on("connect", () => {
  if (!process.env.DATABASE_URL) {
    console.log("Conectado ao Banco Local (Localhost)");
  }
});