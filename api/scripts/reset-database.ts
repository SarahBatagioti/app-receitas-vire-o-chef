import { database } from '../src/config/database';
import { env } from '../src/config/env';
import { AppError } from '../src/utils/app-error';

async function resetDatabase() {
  if (!env.database.name) {
    throw new AppError('DATABASE_NAME não configurado no arquivo .env', 500);
  }

  console.log('🗑️  Iniciando limpeza do banco de dados...');

  try {
    const connection = await database.getConnection();

    try {
      // Desabilitar verificação de chave estrangeira temporariamente
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');

      // Lista de tabelas para dropar
      const tables = [
        'publication_comments',
        'publication_likes',
        'publications',
        'favorite_recipes',
        'recipe_media',
        'recipe_preparation_steps',
        'recipe_nutrition',
        'recipe_ingredients',
        'recipes',
        'meal_entries',
        'password_reset_tokens',
        'users',
      ];

      // Dropar cada tabela
      for (const table of tables) {
        try {
          await connection.query(`DROP TABLE IF EXISTS ${table}`);
          console.log(`✓ Tabela "${table}" removida`);
        } catch (error) {
          console.warn(`⚠️  Erro ao remover tabela "${table}":`, error);
        }
      }

      // Reabilitar verificação de chave estrangeira
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');

      console.log('\n✅ Banco de dados resetado com sucesso!');
      console.log('📝 Inicie o servidor para recriar as tabelas automaticamente.\n');

      connection.release();
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('❌ Erro ao resetar o banco de dados:', error);
    process.exit(1);
  }

  process.exit(0);
}

resetDatabase();
