import { createBrowserRouter } from 'react-router';
import { MarketplacePage } from './pages/MarketplacePage';
import { MyQuotesPage } from './pages/MyQuotesPage';
import { MyTradesPage } from './pages/MyTradesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: MarketplacePage,
  },
  {
    path: '/my-quotes',
    Component: MyQuotesPage,
  },
  {
    path: '/my-trades',
    Component: MyTradesPage,
  },
]);
