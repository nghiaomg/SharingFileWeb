import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { LoginPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import { UsersPage } from '@/features/users';
import { FilesPage } from '@/features/files';
import { FoldersPage } from '@/features/folders';
import { ShareLinksPage } from '@/features/shareLinks';
import { NotificationsPage } from '@/features/notifications';
import { TrashPage } from '@/features/trash';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'files',
        element: <FilesPage />,
      },
      {
        path: 'folders',
        element: <FoldersPage />,
      },
      {
        path: 'share-links',
        element: <ShareLinksPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'trash',
        element: <TrashPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
