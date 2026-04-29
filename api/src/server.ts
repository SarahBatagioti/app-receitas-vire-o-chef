import { app } from './app';
import { testDatabaseConnection } from './config/database';
import { env } from './config/env';

app.listen(env.port, async () => {
  console.log(`Servidor rodando na porta ${env.port}`);

  await testDatabaseConnection();
});
