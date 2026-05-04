import { app } from './app';
import { testDatabaseConnection } from './config/database';
import { env } from './config/env';
import { RecipeRepository } from './repositories/recipe.repository';
import { UserRepository } from './repositories/user.repository';

const recipeRepository = new RecipeRepository();
const userRepository = new UserRepository();

app.listen(env.port, async () => {
  console.log(`Servidor rodando na porta ${env.port}`);

  await testDatabaseConnection();

  if (!env.database.name) {
    console.warn('DATABASE_NAME nao configurado. Criacao das tabelas de receitas ignorada.');
    return;
  }

  try {
    await userRepository.ensureUsersTable();
    await recipeRepository.ensureTables();
    console.log('Estrutura de receitas verificada com sucesso.');
  } catch (error) {
    console.error('Erro ao verificar a estrutura de receitas.');
    console.error(error);
  }
});
