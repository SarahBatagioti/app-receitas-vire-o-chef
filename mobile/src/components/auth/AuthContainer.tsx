import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { SvgXml } from 'react-native-svg';

import { useAppTheme } from '../../contexts';
import { logoVireOChefXml } from '../../assets/images/logoVireOChefXml';
import { AppContainer, AppText } from '../ui';

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
  const { theme } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const isCompact = height < 760;
  const titleSize = variant === 'access' ? '5xl' : isCompact ? '4xl' : '5xl';
  const logoSize = variant === 'access' ? Math.min(width * 0.42, 172) : Math.min(width * 0.22, 92);

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
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <AppContainer flex backgroundColor="background" style={{ minHeight: height }}>
          {variant === 'access' ? (
            <>
              <AppContainer
                backgroundColor="brandGreen"
                style={{
                  position: 'absolute',
                  top: -height * 0.08,
                  left: -width * 0.3,
                  width: width * 0.75,
                  height: height * 0.46,
                  borderBottomRightRadius: width,
                  borderTopRightRadius: width * 0.3,
                }}
              />
              <AppContainer
                backgroundColor="brandOrange"
                style={{
                  position: 'absolute',
                  top: height * 0.1,
                  right: -width * 0.25,
                  width: width * 0.55,
                  height: height * 0.22,
                  borderTopLeftRadius: width,
                  borderBottomLeftRadius: width * 0.35,
                }}
              />
              <AppContainer
                backgroundColor="brandYellow"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  minHeight: height * 0.34,
                  borderTopLeftRadius: width * 0.38,
                  borderTopRightRadius: width * 0.28,
                }}
              />
            </>
          ) : null}

          <AppContainer
            flex
            paddingHorizontal={variant === 'access' ? '2xl' : 'xl'}
            paddingVertical={variant === 'access' ? '3xl' : '2xl'}
            backgroundColor="background"
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
            ) : (
              <AppContainer style={{ height: theme.spacing['5xl'], backgroundColor: 'transparent' }} />
            )}

            <AppContainer
              align="center"
              backgroundColor="background"
              style={{
                backgroundColor: 'transparent',
                marginTop: variant === 'access' ? theme.spacing['3xl'] : theme.spacing.xl,
                marginBottom: variant === 'access' ? theme.spacing['4xl'] : theme.spacing['3xl'],
              }}
            >
              <SvgXml xml={logoVireOChefXml} width={logoSize} height={logoSize} />

              {title ? (
                <AppText
                  color="primary"
                  size={titleSize}
                  style={{
                    fontFamily: theme.fonts.secondary.regular,
                    lineHeight: theme.fontSizes[titleSize] * 1.05,
                    marginTop: theme.spacing.lg,
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
              backgroundColor="background"
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
