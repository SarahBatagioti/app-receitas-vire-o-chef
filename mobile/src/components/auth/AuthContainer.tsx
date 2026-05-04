import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { SvgXml } from 'react-native-svg';

import { useAppTheme } from '../../contexts';
import {
  getLogoVireOChefXml,
  LOGO_VIRE_O_CHEF_ASPECT_RATIO,
} from '../../assets/images/logoVireOChefXml';
import { AppContainer, AppText } from '../ui';

const accessBackground = require('../../assets/images/accessBackground.png');

type AuthContainerProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  helperText?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  variant?: 'access' | 'form';
};

function AuthContainer({
  children,
  title,
  subtitle,
  helperText,
  showBackButton = false,
  onBack,
  variant = 'form',
}: AuthContainerProps) {
  const { theme, themeMode } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const isCompact = height < 760;
  const titleSize = variant === 'access' ? '5xl' : isCompact ? '4xl' : '5xl';
  const accessTitleFontSize = Math.min(width * 0.145, 62);
  const resolvedTitleFontSize =
    variant === 'access' ? accessTitleFontSize : theme.fontSizes[titleSize];
  const logoHeight =
    variant === 'access' ? Math.min(width * 0.42, 172) : Math.min(width * 0.22, 92);
  const logoWidth = logoHeight * LOGO_VIRE_O_CHEF_ASPECT_RATIO;
  const titleColor = variant === 'access' && themeMode === 'dark' ? 'text' : 'primary';
  const containerBackgroundColor = variant === 'access' ? 'surface' : 'background';
  const logoThemeMode = variant === 'access' ? 'light' : themeMode;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: theme.spacing['4xl'],
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          backgroundColor:
            variant === 'access' ? theme.colors.surface : theme.colors.background,
        }}
      >
        <AppContainer flex backgroundColor={containerBackgroundColor} style={{ minHeight: height }}>
          {variant === 'access' ? (
            <Image
              source={accessBackground}
              resizeMode="stretch"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width,
                height,
              }}
            />
          ) : null}

          <AppContainer
            flex
            justify={variant === 'access' ? 'center' : 'flex-start'}
            paddingHorizontal={variant === 'access' ? '2xl' : 'xl'}
            paddingVertical={variant === 'access' ? '3xl' : '2xl'}
            backgroundColor={containerBackgroundColor}
            style={{ backgroundColor: 'transparent' }}
          >
            {showBackButton ? (
              <Pressable
                accessibilityLabel="Voltar"
                accessibilityRole="button"
                onPress={onBack}
                style={{
                  width: theme.spacing['5xl'],
                  height: theme.spacing['5xl'],
                  justifyContent: 'center',
                }}
              >
                <ArrowLeft color={theme.colors.primary} size={theme.fontSizes['4xl']} />
              </Pressable>
            ) : null}

            <AppContainer
              align="center"
              backgroundColor={containerBackgroundColor}
              style={{
                backgroundColor: 'transparent',
                marginTop: variant === 'access' ? 0 : theme.spacing.lg,
                marginBottom: variant === 'access' ? theme.spacing['4xl'] : theme.spacing['3xl'],
              }}
            >
              <AppContainer
                align="center"
                backgroundColor={containerBackgroundColor}
                style={{
                  backgroundColor: 'transparent',
                  width: logoWidth,
                }}
              >
                <SvgXml
                  xml={getLogoVireOChefXml(logoThemeMode)}
                  width={logoWidth}
                  height={logoHeight}
                />
              </AppContainer>

              {title ? (
                <AppText
                  color={titleColor}
                  size={titleSize}
                  style={{
                    color: variant === 'access' ? '#D7070C' : undefined,
                    fontFamily: theme.fonts.secondary.regular,
                    fontSize: resolvedTitleFontSize,
                    lineHeight: resolvedTitleFontSize * (variant === 'access' ? 0.95 : 1.05),
                    marginTop: theme.spacing.lg,
                    maxWidth: width * 0.82,
                    textAlign: 'center',
                  }}
                >
                  {title}
                </AppText>
              ) : null}

              {subtitle ? (
                <AppText
                  color="text"
                  size="md"
                  weight="semibold"
                  style={{
                    marginTop: theme.spacing.lg,
                    maxWidth: width * 0.82,
                    textAlign: 'center',
                  }}
                >
                  {subtitle}
                </AppText>
              ) : null}

              {helperText ? (
                <AppText
                  color="text"
                  size="lg"
                  weight="bold"
                  style={{
                    marginTop: theme.spacing.xl,
                    maxWidth: width * 0.86,
                    textAlign: 'left',
                    alignSelf: 'stretch',
                  }}
                >
                  {helperText}
                </AppText>
              ) : null}
            </AppContainer>

            <AppContainer
              backgroundColor={containerBackgroundColor}
              style={{
                width: '100%',
                maxWidth: 420,
                alignSelf: 'center',
                backgroundColor: 'transparent',
              }}
            >
              {children}
            </AppContainer>
          </AppContainer>
        </AppContainer>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default AuthContainer;
