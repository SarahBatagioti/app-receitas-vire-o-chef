import mysql from 'mysql2/promise';
import { env } from './env';

export const database = mysql.createPool({
  host: env.database.host,
  port: env.database.port,
  user: env.database.user,
  password: env.database.password,
  database: env.database.name || undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function testDatabaseConnection() {
  if (!env.database.name) {
    console.warn('DATABASE_NAME nao configurado. Teste de conexao ignorado.');
    return;
  }

  try {
    const connection = await database.getConnection();

    console.log('Conexao com banco relacional realizada com sucesso.');

    connection.release();
  } catch (error) {
    console.error('Erro ao conectar com o banco relacional.');
    console.error(error);
  }
}
