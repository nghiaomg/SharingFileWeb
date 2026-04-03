import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { queryClient } from './queryClient';
import { ThemeProvider } from '@/shared/contexts/ThemeContext';
import { useTheme } from '@/shared/contexts/useTheme';
import { antdTokens } from '@/shared/themes/antd.tokens';

const AntdThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mode } = useTheme();
  return (
    <ConfigProvider theme={antdTokens(mode)}>
      {children}
    </ConfigProvider>
  );
};

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AntdThemeProvider>
          {children}
        </AntdThemeProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
