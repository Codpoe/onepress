import { createContext, useContext, ComponentType } from 'react';
import { useSnapshot } from 'valtio';
import { PageState } from './types';

export interface AppState {
  NotFound?: ComponentType<any>;
  pageState: PageState;
}

export const AppStateContext = createContext<AppState>({
  pageState: {
    loading: false,
  },
});

export const useAppState = (): [snap: AppState, appState: AppState] => {
  const appState = useContext(AppStateContext);
  return [useSnapshot(appState) as AppState, appState];
};
