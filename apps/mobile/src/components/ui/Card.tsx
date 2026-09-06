import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ children, padding = 'md', className = '', ...props }: CardProps) {
  const paddings = { sm: 'p-3', md: 'p-4', lg: 'p-6' };
  return (
    <View
      className={`bg-surface-card rounded-card shadow-sm ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
