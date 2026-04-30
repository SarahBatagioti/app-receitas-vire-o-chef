import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

import { useAppTheme } from '../../contexts';
import { ColorKey } from '../../styles/colors';
import { FontSizeKey, LineHeightKey } from '../../styles/fontSizes';
import { FontWeight } from '../../styles/fonts';
import { SpacingKey } from '../../styles/spacing';

interface AppTextProps extends TextProps {
  size?: FontSizeKey;
  weight?: FontWeight;
  color?: ColorKey;
  lineHeight?: LineHeightKey;
  disabled?: boolean;
  bold?: boolean;
  marginBottom?: SpacingKey;
  marginTop?: SpacingKey;
  children?: React.ReactNode;
}

const AppText = React.forwardRef<Text, AppTextProps>(
  (
    {
      size = 'base',
      weight = 'regular',
      color = 'text',
      lineHeight = 'normal',
      disabled = false,
      bold,
      marginBottom,
      marginTop,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const { theme } = useAppTheme();
    const effectiveWeight = bold ? 'bold' : weight;

    const computedStyle: TextStyle = {
      color: theme.colors[color],
      fontFamily: theme.fonts.primary.regular,
      fontSize: theme.fontSizes[size],
      fontWeight: theme.fontWeights[effectiveWeight],
      lineHeight: theme.fontSizes[size] * theme.lineHeights[lineHeight],
      opacity: disabled ? 0.5 : 1,
      marginBottom: marginBottom ? theme.spacing[marginBottom] : undefined,
      marginTop: marginTop ? theme.spacing[marginTop] : undefined,
    };

    return (
      <Text ref={ref} style={[computedStyle, style]} {...props}>
        {children}
      </Text>
    );
  },
);

AppText.displayName = 'AppText';

export default AppText;
