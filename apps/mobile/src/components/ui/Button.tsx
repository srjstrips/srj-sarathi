import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({ title, variant = 'primary', loading, fullWidth, disabled, style, ...props }: ButtonProps) {
  const base = 'flex-row items-center justify-center rounded-lg px-5 py-3';

  const variants = {
    primary: 'bg-brand-orange active:bg-brand-orange-dark',
    outline: 'border border-brand-orange bg-transparent',
    ghost: 'bg-transparent',
  };

  const textVariants = {
    primary: 'text-white font-semibold text-base',
    outline: 'text-brand-orange font-semibold text-base',
    ghost: 'text-brand-orange font-semibold text-base',
  };

  return (
    <TouchableOpacity
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-50' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : '#F97316'} className="mr-2" />}
      <Text className={textVariants[variant]}>{title}</Text>
    </TouchableOpacity>
  );
}
