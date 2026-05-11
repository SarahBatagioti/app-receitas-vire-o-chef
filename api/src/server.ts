import { app } from './app';
import { testDatabaseConnection } from './config/database';
import { env } from './config/env';
import { PublicationRepository } from './repositories/publication.repository';
import { RecipeRepository } from './repositories/recipe.repository';
import { UserRepository } from './repositories/user.repository';

const publicationRepository = new PublicationRepository();
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
    await publicationRepository.ensureTables();
    console.log('Estrutura de receitas verificada com sucesso.');
  } catch (error) {
    console.error('Erro ao verificar a estrutura de receitas/publicacoes.');
    console.error(error);
  }
});
