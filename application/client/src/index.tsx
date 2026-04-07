import "./index.css";

import { createRoot } from "react-dom/client";

import { Root } from "@web-speed-hackathon-2026/client/src/root";

declare global {
  interface Window {
    _INITIAL_DATA?: Record<string, unknown>;
  }
}

createRoot(document.getElementById("app")!).render(
  <Root ssrData={window._INITIAL_DATA} />,
);
