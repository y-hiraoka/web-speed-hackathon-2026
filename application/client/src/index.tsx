import "./tailwind.css";
import "./index.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { AppContainer } from "@web-speed-hackathon-2026/client/src/containers/AppContainer";

const container = document.getElementById("app")!;

createRoot(container).render(
  <BrowserRouter>
    <AppContainer />
  </BrowserRouter>,
);
