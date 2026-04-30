# Mobile

Aplicativo React Native puro com autenticação por e-mail e autenticação social via Google/Facebook integrada ao backend.

## Dependências principais

- `firebase`
- `@react-native-google-signin/google-signin`
- `react-native-fbsdk-next`
- `react-native-config`
- `react-native-keychain`

## Variáveis de ambiente

Preencha o `.env` com:

```env
API_BASE_URL=

FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=

GOOGLE_WEB_CLIENT_ID=
GOOGLE_ANDROID_CLIENT_ID=
GOOGLE_IOS_CLIENT_ID=

FACEBOOK_APP_ID=
FACEBOOK_CLIENT_TOKEN=
```

## Fluxo social

1. O usuário inicia login com Google ou Facebook.
2. O app autentica no Firebase Auth com o provider escolhido.
3. O app obtém o `firebaseToken` da sessão do Firebase.
4. O frontend envia o `firebaseToken` ao backend em `/auth/social-login`.
5. Se o backend responder com JWT próprio da aplicação, o token é salvo com `react-native-keychain`.
6. Se o backend indicar cadastro social incompleto, o contexto mantém o estado pendente e redireciona para a tela de conclusão.
7. A tela `CompleteSocialRegisterScreen` envia nome, senha e `firebaseToken` para `/auth/social-complete-register`.
8. O backend retorna o JWT próprio do app, que passa a ser a sessão principal.

## Android

- Depois de instalar dependências, rode a sincronização normal do Gradle.
- O `AndroidManifest.xml` já foi preparado para Facebook Login.
- O `android/app/build.gradle` lê `FACEBOOK_APP_ID` e `FACEBOOK_CLIENT_TOKEN` via `react-native-config`.

## iOS

- Rode `bundle exec pod install` dentro de `ios/` após instalar as dependências.
- O `Info.plist` já contém as chaves base de Facebook.
- Defina no target iOS um valor para `GOOGLE_IOS_REVERSED_CLIENT_ID`, derivado do `GOOGLE_IOS_CLIENT_ID`.
- Garanta que `FACEBOOK_APP_ID` e `FACEBOOK_CLIENT_TOKEN` estejam disponíveis nas build settings usadas pelo `Info.plist`.

## Execução

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
