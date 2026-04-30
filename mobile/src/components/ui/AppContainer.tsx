import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';

import { useAppTheme } from '../../contexts';
import { ColorKey } from '../../styles/colors';
import { BorderRadiusKey, ShadowKey, SpacingKey } from '../../styles/spacing';

interface AppContainerProps extends ViewProps {
  padding?: SpacingKey;
  paddingHorizontal?: SpacingKey;
  paddingVertical?: SpacingKey;
  margin?: SpacingKey;
  marginHorizontal?: SpacingKey;
  marginVertical?: SpacingKey;
  marginTop?: SpacingKey;
  marginBottom?: SpacingKey;
  borderRadius?: BorderRadiusKey;
  shadow?: ShadowKey;
  backgroundColor?: ColorKey;
  direction?: 'row' | 'column';
  justify?: ViewStyle['justifyContent'];
  align?: ViewStyle['alignItems'];
  flex?: boolean | number;
  disabled?: boolean;
  children?: React.ReactNode;
}

const AppContainer = React.forwardRef<View, AppContainerProps>(
  (
    {
      padding,
      paddingHorizontal,
      paddingVertical,
      margin,
      marginHorizontal,
      marginVertical,
      marginTop,
      marginBottom,
      borderRadius = 'none',
      shadow = 'none',
      backgroundColor = 'background',
      direction = 'column',
      justify = 'flex-start',
      align = 'stretch',
      flex,
      disabled = false,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const { theme } = useAppTheme();

    const computedStyle: ViewStyle = {
      alignItems: align,
      backgroundColor: theme.colors[backgroundColor],
      borderRadius: theme.borderRadius[borderRadius],
      flex: flex === true ? 1 : flex === false ? undefined : flex,
      flexDirection: direction,
      justifyContent: justify,
      opacity: disabled ? 0.5 : 1,
    };

    if (padding) {
      computedStyle.paddingHorizontal = theme.spacing[padding];
      computedStyle.paddingVertical = theme.spacing[padding];
    }
    if (paddingHorizontal) {
      computedStyle.paddingHorizontal = theme.spacing[paddingHorizontal];
    }
    if (paddingVertical) {
      computedStyle.paddingVertical = theme.spacing[paddingVertical];
    }
    if (margin) {
      computedStyle.marginHorizontal = theme.spacing[margin];
      computedStyle.marginVertical = theme.spacing[margin];
    }
    if (marginHorizontal) {
      computedStyle.marginHorizontal = theme.spacing[marginHorizontal];
    }
    if (marginVertical) {
      computedStyle.marginVertical = theme.spacing[marginVertical];
    }
    if (marginTop) {
      computedStyle.marginTop = theme.spacing[marginTop];
    }
    if (marginBottom) {
      computedStyle.marginBottom = theme.spacing[marginBottom];
    }
    if (shadow !== 'none' && theme.shadows[shadow]) {
      Object.assign(computedStyle, theme.shadows[shadow] as object);
    }

    return (
      <View ref={ref} style={[computedStyle, style]} {...props}>
        {children}
      </View>
    );
  },
);

AppContainer.displayName = 'AppContainer';

export default AppContainer;
