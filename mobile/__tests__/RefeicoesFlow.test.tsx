import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { ThemeProvider } from '../src/contexts/ThemeContext';
import RefeicoesFlow from '../src/screens/refeicoes/RefeicoesFlow';
import { addWeeksToIsoDate, createEmptyMealDiaryDay, getTodayLocalIsoDate } from '../src/screens/refeicoes/utils';

jest.mock('react-native-config', () => ({
  API_BASE_URL: 'http://localhost:3000/api',
  FIREBASE_API_KEY: 'firebase-api-key',
  FIREBASE_AUTH_DOMAIN: 'firebase-auth-domain',
  FIREBASE_PROJECT_ID: 'firebase-project-id',
  FIREBASE_STORAGE_BUCKET: 'firebase-storage-bucket',
  FIREBASE_MESSAGING_SENDER_ID: 'firebase-messaging-sender-id',
  FIREBASE_APP_ID: 'firebase-app-id',
  GOOGLE_WEB_CLIENT_ID: 'google-web-client-id',
  GOOGLE_ANDROID_CLIENT_ID: 'google-android-client-id',
  GOOGLE_IOS_CLIENT_ID: 'google-ios-client-id',
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getTokens: jest.fn(),
  },
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn().mockResolvedValue(false),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
  setGenericPassword: jest.fn().mockResolvedValue(true),
}));

jest.mock('firebase/app', () => ({
  getApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: {
    credential: jest.fn(),
  },
  getAuth: jest.fn(() => ({})),
  getIdToken: jest.fn(),
  initializeAuth: jest.fn(() => ({})),
  inMemoryPersistence: {},
  signInWithCredential: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('../src/services/mealDiaryService', () => ({
  mealDiaryService: {
    getDiaryByDate: jest.fn(),
    replaceMeal: jest.fn(),
  },
}));

jest.mock('../src/services/recipeService', () => ({
  recipeService: {
    listMyRecipes: jest.fn(),
    listPublicRecipes: jest.fn(),
  },
}));

const { mealDiaryService } = jest.requireMock('../src/services/mealDiaryService') as {
  mealDiaryService: {
    getDiaryByDate: jest.Mock;
    replaceMeal: jest.Mock;
  };
};

const { recipeService } = jest.requireMock('../src/services/recipeService') as {
  recipeService: {
    listMyRecipes: jest.Mock;
    listPublicRecipes: jest.Mock;
  };
};

describe('RefeicoesFlow', () => {
  beforeEach(() => {
    const emptyDay = createEmptyMealDiaryDay(getTodayLocalIsoDate());

    mealDiaryService.getDiaryByDate.mockResolvedValue(emptyDay);
    mealDiaryService.replaceMeal.mockResolvedValue({
      type: 'breakfast',
      totalCalories: 203,
      items: [],
    });
    recipeService.listMyRecipes.mockResolvedValue([
      {
        id: 'recipe-1',
        nome: 'Arroz branco',
        tempoPreparoMinutos: 20,
        rendimentoPorcoes: 1,
        dificuldade: 'FACIL',
        isColaborativa: false,
        status: 'PUBLICADA',
        avaliacaoMedia: 4,
        autorId: 'user-1',
        autorNome: 'Thais Andrade',
        autorUsername: 'thais',
        createdAt: '',
        updatedAt: '',
        midiaPrincipal: null,
        ingredientes: [],
        informacaoNutricional: { id: 'nutrition-1', calorias: 203, proteinas: null, carboidratos: null, gorduras: null },
        modoPreparo: [],
        midias: [],
      },
    ]);
    recipeService.listPublicRecipes.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('saves using the currently selected date', async () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider initialTheme="light">
          <RefeicoesFlow />
        </ThemeProvider>,
      );
    });

    const nextWeekButton = renderer.root.findByProps({ accessibilityLabel: 'Avancar uma semana' });

    await ReactTestRenderer.act(async () => {
      nextWeekButton.props.onPress();
    });

    const openBreakfastButton = renderer.root.findByProps({
      accessibilityLabel: 'Adicionar receita em Café da manhã',
    });

    await ReactTestRenderer.act(async () => {
      openBreakfastButton.props.onPress();
    });

    const addRecipeButton = renderer.root.findByProps({ accessibilityLabel: 'Adicionar Arroz branco' });

    await ReactTestRenderer.act(async () => {
      addRecipeButton.props.onPress();
    });

    const saveButton = renderer.root.findByProps({ label: 'Salvar refeição' });

    await ReactTestRenderer.act(async () => {
      saveButton.props.onPress();
    });

    expect(mealDiaryService.replaceMeal).toHaveBeenCalledWith(
      addWeeksToIsoDate(getTodayLocalIsoDate(), 1),
      'breakfast',
      [{ recipeId: 'recipe-1', quantity: 1 }],
    );
  });

  test('renders in dark mode without crashing', async () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider initialTheme="dark">
          <RefeicoesFlow />
        </ThemeProvider>,
      );
    });

    expect(renderer.toJSON()).toBeTruthy();
  });
});
