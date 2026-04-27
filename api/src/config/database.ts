import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const database = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function testDatabaseConnection() {
  try {
    const connection = await database.getConnection();

    console.log("Conexão com MySQL realizada com sucesso!");

    connection.release();
  } catch (error) {
    console.error("Erro ao conectar com o MySQL:");
    console.error(error);
  }
}