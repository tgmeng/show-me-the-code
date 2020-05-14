import * as React from 'react';
import { createContext, useContext } from 'react';

import Global from '@/App/global';

const AppContext = createContext<typeof Global | undefined>(undefined);

export const AppConsumer = AppContext.Consumer;

export const AppProvider: React.FC = ({ children }) => {
  return <AppContext.Provider value={Global}>{children}</AppContext.Provider>;
};

export function useApp() {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useApp must be used within a AppProvider');
  }

  return context;
}
