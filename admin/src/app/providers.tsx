import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { queryClient } from './queryClient';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#000000',
            borderRadius: 6,
          },
          components: {
            Menu: {
              itemSelectedBg: '#000000',
              itemSelectedColor: '#ffffff',
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </QueryClientProvider>
  );
};
