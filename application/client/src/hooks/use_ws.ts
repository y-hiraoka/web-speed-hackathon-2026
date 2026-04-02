import { useEffect, useEffectEvent } from "react";

export function useWs<T>(url: string, onMessage: (event: T) => void) {
  const handleMessage = useEffectEvent((event: MessageEvent) => {
    onMessage(JSON.parse(event.data));
  });

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;
    let backoff = 1000;

    function connect() {
      if (disposed) return;

      ws = new WebSocket(url);
      ws.addEventListener("message", handleMessage);
      ws.addEventListener("open", () => {
        backoff = 1000;
      });
      ws.addEventListener("close", () => {
        if (!disposed) {
          reconnectTimer = setTimeout(connect, backoff);
          backoff = Math.min(backoff * 2, 30_000);
        }
      });
    }

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer != null) {
        clearTimeout(reconnectTimer);
      }
      if (ws != null) {
        ws.close();
      }
    };
  }, [url]);
}
