import { createContext, useContext } from "react";

export const InitialDataContext = createContext<InitialData | undefined>(undefined);

export function useInitialData(): InitialData | undefined {
  return useContext(InitialDataContext);
}
