import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";

import { AppContainer } from "@web-speed-hackathon-2026/client/src/containers/AppContainer";
import { InitialDataContext } from "@web-speed-hackathon-2026/client/src/utils/initial_data_context";

export function render(url: string, initialData?: InitialData): string {
  return renderToString(
    <InitialDataContext.Provider value={initialData}>
      <StaticRouter location={url}>
        <AppContainer />
      </StaticRouter>
    </InitialDataContext.Provider>,
  );
}
