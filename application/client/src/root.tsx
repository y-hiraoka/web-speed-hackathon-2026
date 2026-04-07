import "./index.css";

import { BrowserRouter } from "react-router";
import { SWRConfig } from "swr";

import { AppContainer } from "@web-speed-hackathon-2026/client/src/containers/AppContainer";

export const Root: React.FC<{
  ssrData?: Record<string, unknown>;
}> = ({ ssrData }) => {
  return (
    <SWRConfig value={{ fallback: ssrData }}>
      <BrowserRouter>
        <AppContainer />
      </BrowserRouter>
    </SWRConfig>
  );
};
