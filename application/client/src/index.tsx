import "./tailwind.css";
import "./index.css";
import { hydrateRoot, createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { AppContainer } from "@web-speed-hackathon-2026/client/src/containers/AppContainer";
import { InitialDataContext } from "@web-speed-hackathon-2026/client/src/utils/initial_data_context";

const container = document.getElementById("app")!;
const initialData = window.__INITIAL_DATA__;

const app = (
  <InitialDataContext.Provider value={initialData}>
    <BrowserRouter>
      <AppContainer />
    </BrowserRouter>
  </InitialDataContext.Provider>
);

// If server-rendered HTML exists, hydrate; otherwise do a full client render
if (container.childNodes.length > 0) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
