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
            colorPrimary: '#ffffff',
            colorBgContainer: '#0f0f0f',
            colorBgElevated: '#161616',
            colorBgSpotlight: '#1a1a1a',
            colorBorder: 'rgba(255,255,255,0.1)',
            colorBorderSecondary: 'rgba(255,255,255,0.06)',
            colorText: '#e0e0e0',
            colorTextSecondary: 'rgba(255,255,255,0.45)',
            colorTextTertiary: 'rgba(255,255,255,0.3)',
            colorTextQuaternary: 'rgba(255,255,255,0.18)',
            colorError: '#ef4444',
            borderRadius: 8,
            fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
            fontSize: 14,
            lineHeight: 1.6,
          },
          components: {
            Input: {
              colorBgContainer: 'rgba(255,255,255,0.04)',
              colorBorder: 'rgba(255,255,255,0.1)',
              colorText: '#ffffff',
              colorPlaceholderText: 'rgba(255,255,255,0.2)',
              hoverColorBorder: 'rgba(255,255,255,0.2)',
              activeBorderColor: 'rgba(255,255,255,0.35)',
              activeShadow: '0 0 0 3px rgba(255,255,255,0.06)',
            },
            Button: {
              colorBgContainer: '#ffffff',
              colorBgGhost: 'transparent',
              colorBorder: '#ffffff',
              colorText: '#0a0a0a',
              colorTextGhost: '#ffffff',
              fontWeight: 600,
            },
            Form: {
              colorError: '#fca5a5',
              colorTextSecondary: 'rgba(255,255,255,0.4)',
            },
            Card: {
              colorBgContainer: '#0f0f0f',
              colorBorderSecondary: 'rgba(255,255,255,0.07)',
            },
            Alert: {
              colorInfoBg: 'rgba(59,130,246,0.08)',
              colorErrorBg: 'rgba(220,38,38,0.08)',
              colorSuccessBg: 'rgba(34,197,94,0.08)',
              colorWarningBg: 'rgba(234,179,8,0.08)',
              colorInfoBorder: 'rgba(59,130,246,0.2)',
              colorErrorBorder: 'rgba(220,38,38,0.2)',
              colorSuccessBorder: 'rgba(34,197,94,0.2)',
              colorWarningBorder: 'rgba(234,179,8,0.2)',
              colorText: '#ffffff',
              colorTextDescriptionText: 'rgba(255,255,255,0.6)',
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </QueryClientProvider>
  );
};
