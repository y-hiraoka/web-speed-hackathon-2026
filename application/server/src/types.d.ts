import WebSocket from "ws";

interface AppSession {
  userId?: string | undefined;
  isChanged?: boolean | undefined;
  isNew?: boolean | undefined;
  isPopulated?: boolean | undefined;
}

declare module "express" {
  function Router(options?: RouterOptions): Router;
  interface Router {
    ws: IRouterMatcher<this>;
  }
}

declare global {
  namespace Express {
    interface Request {
      session: AppSession;
      sessionOptions: CookieSessionInterfaces.CookieSessionOptions;
      _wsHandled: boolean;
      ws: WebSocket;
    }
    interface Application {
      ws: import("express").IRouterMatcher<this>;
    }
  }
}
