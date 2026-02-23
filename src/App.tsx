import { createBrowserRouter, RouterProvider, Outlet } from 'react-router';
import { Box } from '@mui/material';
import AppHeader from './components/common/AppHeader';
import LibraryPage from './pages/LibraryPage';
import EditorPage from './pages/EditorPage';
import PresentationPage from './pages/PresentationPage';
import SharePage from './pages/SharePage';

function AppShell() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppHeader />
      <Outlet />
    </Box>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <LibraryPage /> },
      { path: 'editor/new', element: <EditorPage /> },
      { path: 'editor/:id', element: <EditorPage /> },
      { path: 'share/:id', element: <SharePage /> },
    ],
  },
  // Presentation is fullscreen — outside AppShell
  {
    path: '/present/:id',
    element: <PresentationPage />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
