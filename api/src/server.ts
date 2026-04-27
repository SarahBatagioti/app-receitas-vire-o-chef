import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testDatabaseConnection } from "./config/database";

dotenv.config();

const app = express();
''
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  return res.json({
    message: "API Vire o Chef rodando com sucesso!",
  });
});

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  await testDatabaseConnection();
});