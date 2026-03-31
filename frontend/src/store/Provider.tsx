'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { SessionProvider } from "@/hooks/useSession";

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        {children}
      </Provider>
    </SessionProvider>
  );
}
