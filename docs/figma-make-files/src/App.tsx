import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner@2.0.3';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;