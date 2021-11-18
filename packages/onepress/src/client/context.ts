import { createContext, useContext, ComponentType } from 'react';
import { PageStatus } from './types';

export interface AppContextValue {
  NotFound?: ComponentType<any>;
  onStatusChange: (status: PageStatus) => void;
}

export const AppContext = createContext<AppContextValue>({
  onStatusChange: () => null,
});

export function useAppContext() {
  return useContext(AppContext);
}
