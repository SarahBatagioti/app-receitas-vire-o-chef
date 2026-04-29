import React from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  ChefHat,
  House,
  ShoppingBasket,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

import { ScreenKey } from '../types/navigation';

const BRAND_RED = '#D7040A';
const BACKGROUND = '#e5e5e5';
const ICON_SIZE = 24;
const ACTIVE_ICON = '#ffffff';
const INACTIVE_ICON = 'rgba(255, 255, 255, 0.72)';
const FAB_SIZE = 72;
const NAVBAR_HEIGHT = 74;
const NAVBAR_TOP_RADIUS = 24;
const NOTCH_DEPTH = 28;
const NOTCH_WIDTH = 144;

type BottomNavProps = {
  activeScreen: ScreenKey;
  onChangeScreen: (screen: ScreenKey) => void;
};

function BottomNav({ activeScreen, onChangeScreen }: BottomNavProps) {
  const { width } = useWindowDimensions();
  const centerX = width / 2;
  const leftNotchX = centerX - NOTCH_WIDTH / 2;
  const rightNotchX = centerX + NOTCH_WIDTH / 2;
  const notchControlOffset = 28;
  const notchBottomY = NOTCH_DEPTH;
  const navbarPath = [
    `M 0 ${NAVBAR_TOP_RADIUS}`,
    `Q 0 0 ${NAVBAR_TOP_RADIUS} 0`,
    `L ${leftNotchX} 0`,
    `C ${leftNotchX + notchControlOffset} 0 ${centerX - 42} ${notchBottomY} ${centerX} ${notchBottomY}`,
    `C ${centerX + 42} ${notchBottomY} ${rightNotchX - notchControlOffset} 0 ${rightNotchX} 0`,
    `L ${width - NAVBAR_TOP_RADIUS} 0`,
    `Q ${width} 0 ${width} ${NAVBAR_TOP_RADIUS}`,
    `L ${width} ${NAVBAR_HEIGHT}`,
    `L 0 ${NAVBAR_HEIGHT} Z`,
  ].join(' ');

  return (
    <View style={styles.navWrapper}>
      <View style={styles.navbar}>
        <Svg width={width} height={NAVBAR_HEIGHT + 6} style={styles.navbarSvg}>
          <Path d={navbarPath} fill={BRAND_RED} />
        </Svg>

        <View style={styles.iconSections}>
          <View style={styles.sideGroup}>
            <Pressable
              style={styles.iconButton}
              onPress={() => onChangeScreen('inicio')}
              accessibilityRole="button"
              accessibilityLabel="Ir para inicio"
            >
              <House
                color={activeScreen === 'inicio' ? ACTIVE_ICON : INACTIVE_ICON}
                size={ICON_SIZE}
                strokeWidth={2}
              />
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => onChangeScreen('produtos')}
              accessibilityRole="button"
              accessibilityLabel="Ir para produtos"
            >
              <ShoppingBasket
                color={activeScreen === 'produtos' ? ACTIVE_ICON : INACTIVE_ICON}
                size={ICON_SIZE}
                strokeWidth={2}
              />
            </Pressable>
          </View>

          <View style={styles.sideGroup}>
            <Pressable
              style={styles.iconButton}
              onPress={() => onChangeScreen('refeicoes')}
              accessibilityRole="button"
              accessibilityLabel="Ir para refeicoes"
            >
              <UtensilsCrossed
                color={activeScreen === 'refeicoes' ? ACTIVE_ICON : INACTIVE_ICON}
                size={ICON_SIZE}
                strokeWidth={2}
              />
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => onChangeScreen('perfil')}
              accessibilityRole="button"
              accessibilityLabel="Ir para perfil"
            >
              <UserRound
                color={activeScreen === 'perfil' ? ACTIVE_ICON : INACTIVE_ICON}
                size={ICON_SIZE}
                strokeWidth={2}
              />
            </Pressable>
          </View>
        </View>
      </View>

      <Pressable
        style={styles.fab}
        onPress={() => onChangeScreen('receitas')}
        accessibilityRole="button"
        accessibilityLabel="Ir para receitas"
      >
        <ChefHat
          color={activeScreen === 'receitas' ? ACTIVE_ICON : INACTIVE_ICON}
          size={28}
          strokeWidth={2}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  navWrapper: {
    paddingHorizontal: 0,
    paddingBottom: 0,
    backgroundColor: BACKGROUND,
  },
  navbar: {
    height: NAVBAR_HEIGHT,
    overflow: 'visible',
    justifyContent: 'center',
  },
  navbarSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  iconSections: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 34,
  },
  sideGroup: {
    flexDirection: 'row',
    width: '30%',
    justifyContent: 'space-between',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
  },
  fab: {
    position: 'absolute',
    top: -(FAB_SIZE / 2) + 1,
    left: '50%',
    marginLeft: -(FAB_SIZE / 2),
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: BRAND_RED,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
});

export default BottomNav;
