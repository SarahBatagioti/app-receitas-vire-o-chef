import React from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import {
  ChefHat,
  House,
  ShoppingBasket,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

import { useAppTheme } from '../contexts';
import { ScreenKey } from '../types/navigation';

// Constantes de design do navbar
const ICON_SIZE = 24;
const FAB_SIZE = 72;
const NAVBAR_HEIGHT = 74;
const NAVBAR_TOP_RADIUS = 24;
const NOTCH_DEPTH = 28;
const NOTCH_WIDTH = 144;
const NOTCH_CONTROL_OFFSET = 28;

type BottomNavProps = {
  activeScreen: ScreenKey;
  onChangeScreen: (screen: ScreenKey) => void;
};

/**
 * Componente BottomNav
 * Navegação inferior com FAB customizado
 * Utiliza o tema global para cores e estilos
 */
function BottomNav({ activeScreen, onChangeScreen }: BottomNavProps) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();

  // Calcula posições para o path SVG do navbar
  const centerX = width / 2;
  const leftNotchX = centerX - NOTCH_WIDTH / 2;
  const rightNotchX = centerX + NOTCH_WIDTH / 2;
  const notchBottomY = NOTCH_DEPTH;

  // Path SVG para criar o shape customizado com notch para o FAB
  const navbarPath = [
    `M 0 ${NAVBAR_TOP_RADIUS}`,
    `Q 0 0 ${NAVBAR_TOP_RADIUS} 0`,
    `L ${leftNotchX} 0`,
    `C ${leftNotchX + NOTCH_CONTROL_OFFSET} 0 ${centerX - 42} ${notchBottomY} ${centerX} ${notchBottomY}`,
    `C ${centerX + 42} ${notchBottomY} ${rightNotchX - NOTCH_CONTROL_OFFSET} 0 ${rightNotchX} 0`,
    `L ${width - NAVBAR_TOP_RADIUS} 0`,
    `Q ${width} 0 ${width} ${NAVBAR_TOP_RADIUS}`,
    `L ${width} ${NAVBAR_HEIGHT}`,
    `L 0 ${NAVBAR_HEIGHT} Z`,
  ].join(' ');

  // Determina a cor do ícone baseado no estado (ativo ou inativo)
  const getIconColor = (screen: ScreenKey) => {
    return activeScreen === screen ? theme.colors.iconActive : theme.colors.iconInactive;
  };

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <View style={{ height: NAVBAR_HEIGHT, overflow: 'visible', justifyContent: 'center' }}>
        {/* SVG do navbar com forma customizada */}
        <Svg width={width} height={NAVBAR_HEIGHT + 6} style={{ position: 'absolute', top: 0, left: 0 }}>
          <Path d={navbarPath} fill={theme.colors.primary} />
        </Svg>

        {/* Seções de ícones do navbar */}
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 34,
          }}
        >
          {/* Grupo esquerdo: Início e Produtos */}
          <View style={{ flexDirection: 'row', width: '30%', justifyContent: 'space-between' }}>
            <Pressable
              onPress={() => onChangeScreen('inicio')}
              accessibilityRole="button"
              accessibilityLabel="Ir para inicio"
              style={{ alignItems: 'center', justifyContent: 'center', width: 34, height: 34 }}
            >
              <House color={getIconColor('inicio')} size={ICON_SIZE} strokeWidth={2} />
            </Pressable>

            <Pressable
              onPress={() => onChangeScreen('produtos')}
              accessibilityRole="button"
              accessibilityLabel="Ir para produtos"
              style={{ alignItems: 'center', justifyContent: 'center', width: 34, height: 34 }}
            >
              <ShoppingBasket color={getIconColor('produtos')} size={ICON_SIZE} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Grupo direito: Refeições e Perfil */}
          <View style={{ flexDirection: 'row', width: '30%', justifyContent: 'space-between' }}>
            <Pressable
              onPress={() => onChangeScreen('refeicoes')}
              accessibilityRole="button"
              accessibilityLabel="Ir para refeicoes"
              style={{ alignItems: 'center', justifyContent: 'center', width: 34, height: 34 }}
            >
              <UtensilsCrossed color={getIconColor('refeicoes')} size={ICON_SIZE} strokeWidth={2} />
            </Pressable>

            <Pressable
              onPress={() => onChangeScreen('perfil')}
              accessibilityRole="button"
              accessibilityLabel="Ir para perfil"
              style={{ alignItems: 'center', justifyContent: 'center', width: 34, height: 34 }}
            >
              <UserRound color={getIconColor('perfil')} size={ICON_SIZE} strokeWidth={2} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* FAB (Floating Action Button) para Receitas */}
      <Pressable
        onPress={() => onChangeScreen('receitas')}
        accessibilityRole="button"
        accessibilityLabel="Ir para receitas"
        style={{
          position: 'absolute',
          top: -(FAB_SIZE / 2) + 1,
          left: '50%',
          marginLeft: -(FAB_SIZE / 2),
          width: FAB_SIZE,
          height: FAB_SIZE,
          borderRadius: FAB_SIZE / 2,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          ...theme.shadows.md,
        }}
      >
        <ChefHat color={getIconColor('receitas')} size={28} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

export default BottomNav;
