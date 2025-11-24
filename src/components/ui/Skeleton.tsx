import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, DimensionValue } from 'react-native';

type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
  variant?: 'rect' | 'circle' | 'text';
};

const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 12, borderRadius = 6, style, variant = 'rect' }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);

  const opacity = anim;

  const containerStyle: ViewStyle = {
    width: width as any,
    height: height as any,
    borderRadius,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  };

  if (variant === 'circle') {
    containerStyle.borderRadius = typeof height === 'number' ? height / 2 : 9999;
  }

  if (variant === 'text') {
    containerStyle.height = typeof height === 'number' ? Math.max(10, height) : height;
    containerStyle.borderRadius = 4;
  }

  return (
    <Animated.View style={[containerStyle, style, { opacity }]} />
  );
};

export default Skeleton;
