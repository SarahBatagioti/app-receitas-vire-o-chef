# Mobile

Aplicativo React Native puro com autenticacao por e-mail e autenticacao social via Google integrada ao backend.

## Dependencias principais

- `firebase`
- `@react-native-google-signin/google-signin`
- `react-native-config`
- `react-native-keychain`

## Variaveis de ambiente

Preencha o `.env` com:

```env
API_BASE_URL=http://10.0.2.2:3000/api

FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=

GOOGLE_WEB_CLIENT_ID=
GOOGLE_ANDROID_CLIENT_ID=
GOOGLE_IOS_CLIENT_ID=
```

Observacoes sobre a API no mobile:

- O backend deste projeto responde sob o prefixo `/api`, por isso a `API_BASE_URL` precisa terminar com `/api`.
- No emulador Android, `localhost` dentro do app nao aponta para o seu computador. Use `http://10.0.2.2:3000/api`.
- Em dispositivo Android fisico, use o IP da sua maquina na rede local, por exemplo `http://192.168.0.15:3000/api`.
- Depois de alterar o `.env`, refaca o build do app para o valor novo entrar na aplicacao.

## Fluxo social

1. O usuario inicia login com Google.
2. O app autentica no Firebase Auth com o provider escolhido.
3. O app obtem o `firebaseToken` da sessao do Firebase.
4. O frontend envia o `firebaseToken` ao backend em `/auth/social-login`.
5. Se o backend responder com JWT proprio da aplicacao, o token e salvo com `react-native-keychain`.
6. Se o backend indicar cadastro social incompleto, o contexto mantem o estado pendente e redireciona para a tela de conclusao.
7. A tela `CompleteSocialRegisterScreen` envia nome, senha e `firebaseToken` para `/auth/social-complete-register`.
8. O backend retorna o JWT proprio do app, que passa a ser a sessao principal.

## Android

- Para usar Google no Android, mantenha `GOOGLE_WEB_CLIENT_ID` configurado. `GOOGLE_IOS_CLIENT_ID` nao e exigido nesse fluxo.
- Depois de instalar dependencias, rode a sincronizacao normal do Gradle.

## iOS

- Configure `GOOGLE_IOS_CLIENT_ID` somente se voce for gerar o app iOS.
- Rode `bundle exec pod install` dentro de `ios/` apos instalar as dependencias.
- Defina no target iOS um valor para `GOOGLE_IOS_REVERSED_CLIENT_ID`, derivado do `GOOGLE_IOS_CLIENT_ID`.

## Execucao

```sh
npm start
npm run android
```

Para iOS:

```sh
bundle install
cd ios
bundle exec pod install
cd ..
npm run ios
```
