<img width="1680" height="640" alt="Banner Vire o Chef" src="https://github.com/user-attachments/assets/79484f11-e859-49fd-883f-a9618b67bf3e" />

# 📖 Sobre o aplicativo
Bem-vindo ao "Vire o Chef", o aplicativo que te ajuda a organizar suas receitas, criar um diário alimentar e controlar sua despensa virtual. Prepare receitas com facilidade, siga desafios culinários e registre sua jornada na cozinha de forma divertida e prática.

## Percentual estimado do trabalho

- **Entrega 1 concluída: ~25% do escopo total**
- **Entrega 2 restante: ~75% do escopo total**

> Critério usado: leitura dos **30 requisitos funcionais** e **10 não funcionais** do PDF, comparando com o estado atual do código.

## Legenda do checklist

- `[x]` concluído
- `[~]` parcialmente adiantado
- `[ ]` pendente

## 1ª Entrega

### O que já foi feito no código

- [x] Aplicativo mobile estruturado em **React Native CLI**
- [x] Backend estruturado em **Node.js + Express**
- [x] Fluxo de **cadastro de usuário com e-mail e senha**
- [x] Fluxo de **login com e-mail e senha**
- [x] **Persistência de sessão** do usuário autenticado
- [x] **Logout**
- [x] Fluxo de **esqueci minha senha** no app e no backend
- [x] Estrutura de **receitas** com criação, listagem e detalhe
- [x] Cadastro de receita com **ingredientes**
- [x] Cadastro de receita com **informação nutricional**
- [x] Cadastro de receita com **modo de preparo**
- [x] Suporte a **rascunho** e **publicação** de receitas
- [x] Upload de **imagens e vídeos** para receitas
- [x] Listagem de **receitas públicas**
- [x] Listagem de **minhas receitas**
- [x] Sistema de **favoritos locais** com `AsyncStorage`
- [x] Sistema de **avaliação de receitas**
- [x] Base visual com **tema**, componentes reutilizáveis e organização de UI

### Requisitos do PDF já iniciados, mas ainda não finalizados

- [~] **Requisito 1. Cadastro e autenticação de usuário**
Ja existe cadastro, login, sessao e backend preparado para fluxo social/Firebase, com o app agora mantendo somente o login social com Google.
- [~] **Requisito 12. Receitas colaborativas**
  Já existe o campo `isColaborativa`, mas ainda não há edição em tempo real entre múltiplos usuários.
- [~] **Requisito 17. Galeria pública de fotos**
  Já existe upload de mídia nas receitas e visualização pública, mas ainda faltam feed, curtidas e comentários.
- [~] **Requisito 22. Modo offline avançado**
  Já existe persistência local de favoritos, mas ainda não existe download/sincronização offline de receitas da comunidade.
- [~] **Requisito 30. Temas personalizáveis com cores e fontes**
  Já existe a base de tema e alternância visual, mas o usuário ainda não personaliza cores e tipografia como pede o escopo final.
- [~] **Requisito não funcional 3. Back-end e persistência**
  O backend em Node.js/Express já existe, mas a arquitetura final descrita no PDF ainda não está completa.
- [~] **Requisito não funcional 4. Autenticação com Firebase Auth**
  O backend já conversa com Firebase para validar tokens, mas a experiência social completa ainda não está fechada no app.
- [~] **Requisito não funcional 9. Interface moderna e responsiva**
  A base visual está bem encaminhada, mas ainda faltam várias telas finais do produto.

## 2ª Entrega

### O que ainda falta para concluir o escopo do PDF

- [ ] **Requisito 2.** Perfil do usuário com preferências e restrições alimentares
- [ ] **Requisito 3.** Cadastro de receitas por comando de voz
- [ ] **Requisito 4.** Importação de receitas por URL com scraping no back-end
- [ ] **Requisito 5.** Organização de receitas em pastas customizadas e aninhadas
- [ ] **Requisito 6.** Planejamento de refeições com metas nutricionais
- [ ] **Requisito 7.** Lista de compras inteligente
- [ ] **Requisito 8.** Lembretes por localização com GPS/geofencing
- [ ] **Requisito 9.** Modo chef avançado
- [ ] **Requisito 10.** Timer simultâneo para múltiplas receitas
- [ ] **Requisito 11.** Diário alimentar
- [ ] **Requisito 13.** Histórico de versões de receitas
- [ ] **Requisito 14.** Impressão de receitas em PDF
- [ ] **Requisito 15.** Comandos de voz durante o preparo
- [ ] **Requisito 16.** Desafios culinários semanais
- [ ] **Requisito 18.** Notificações de receitas sazonais
- [ ] **Requisito 19.** Cálculo de desperdício
- [ ] **Requisito 20.** Compartilhamento de lista de compras com outros apps
- [ ] **Requisito 21.** Despensa virtual
- [ ] **Requisito 23.** Backup automático diário para nuvem
- [ ] **Requisito 24.** Suporte a múltiplos idiomas
- [ ] **Requisito 25.** Favoritar chefs
- [ ] **Requisito 26.** Sistema de reputação
- [ ] **Requisito 27.** Modo criança
- [ ] **Requisito 28.** Integração com calendário
- [ ] **Requisito 29.** Receitas por temporada

### Requisitos não funcionais que ainda precisam ser fechados

- [ ] **Requisito não funcional 2.** Persistência local com `Realm` ou `WatermelonDB`
- [ ] **Requisito não funcional 5.** Reconhecimento de voz com `react-native-voice`
- [ ] **Requisito não funcional 6.** Geofencing com `react-native-geofencing`
- [ ] **Requisito não funcional 7.** Scraping de receitas implementado no back-end
- [ ] **Requisito não funcional 8.** Colaboração em tempo real com WebSockets ou Firebase Realtime Database
- [ ] **Requisito não funcional 10.** Testes automatizados cobrindo voz, geofencing e colaboração

## Resumo rápido

A **1ª entrega** já deixou pronta a fundação do projeto: autenticação básica, backend, fluxo principal de receitas, mídia, favoritos, avaliações e a base visual do app.

A **2ª entrega** concentra a maior parte do escopo diferencial do PDF: voz, geolocalização, planejamento, listas inteligentes, colaboração em tempo real, offline de verdade, integrações externas e recursos sociais mais avançados.

## Como rodar o projeto

### API

```bash
cd api
npm install
npm run dev
```

### Mobile

```bash
cd mobile
npm install
npm start
npm run android
```
