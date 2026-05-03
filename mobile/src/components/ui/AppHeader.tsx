import React from 'react';
import { useWindowDimensions } from 'react-native';
import { Path, Svg, SvgXml } from 'react-native-svg';

import {
  getLogoVireOChefXml,
  LOGO_VIRE_O_CHEF_ASPECT_RATIO,
} from '../../assets/images/logoVireOChefXml';
import { useAppTheme } from '../../contexts';
import AppContainer from './AppContainer';
import AppText from './AppText';

type NotificationBellIconProps = {
  color: string;
  size?: number;
};

function NotificationBellIcon({ color, size = 26 }: NotificationBellIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2Zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7a5.002 5.002 0 0 0-4.005-4.901Z"
        fill={color}
      />
    </Svg>
  );
}

function AppHeader() {
  const { theme, themeMode } = useAppTheme();
  const { width } = useWindowDimensions();
  const isDarkMode = themeMode === 'dark';
  const accentColor = isDarkMode ? theme.colors.text : theme.colors.primary;
  const logoHeight = Math.min(Math.max(width * 0.13, 44), 52);
  const logoWidth = logoHeight * LOGO_VIRE_O_CHEF_ASPECT_RATIO;
  const titleSize = width < 360 ? '4xl' : '5xl';

  return (
    <AppContainer
      align="center"
      backgroundColor="background"
      direction="row"
      justify="space-between"
      style={{ backgroundColor: 'transparent' }}
    >
      <AppContainer
        align="center"
        backgroundColor="background"
        direction="row"
        style={{
          backgroundColor: 'transparent',
          flexShrink: 1,
        }}
      >
        <SvgXml xml={getLogoVireOChefXml(themeMode)} width={logoWidth} height={logoHeight} />

        <AppText
          adjustsFontSizeToFit
          color={isDarkMode ? 'text' : 'primary'}
          numberOfLines={1}
          size={titleSize}
          style={{
            flexShrink: 1,
            fontFamily: theme.fonts.secondary.regular,
            lineHeight: theme.fontSizes[titleSize] * 1.05,
            marginLeft: theme.spacing.sm,
          }}
        >
          Vire o Chef
        </AppText>
      </AppContainer>

      <AppContainer
        backgroundColor="background"
        style={{
          backgroundColor: 'transparent',
          marginLeft: theme.spacing.lg,
        }}
      >
        <NotificationBellIcon color={accentColor} />
      </AppContainer>
    </AppContainer>
  );
}

export default AppHeader;
