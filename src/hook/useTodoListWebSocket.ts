import { useEffect, useRef } from "react";

type WsEvent = {
  event: string;
  listId: number;
  error?: string;
};

export function useTodoListWebSocket(
  listId: number,
  onMessage?: (data: WsEvent) => void
) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!listId) return;

    if (wsRef.current) return;

    const url = `${import.meta.env.VITE_WS_URL}/ws/todolists/${listId}`;
    const ws = new WebSocket(url);

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WS connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WS message:", data);
        onMessage?.(data);
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WS error:", err);
    };

    ws.onclose = (e) => {
      console.log("WS closed", e.code, e.reason)
      wsRef.current = null;
    };

    ws.onclose = (e) => {
      console.log("WS closed", e.code, e.reason);
      if (e.code === 1006) {
        setTimeout(() => {
          wsRef.current = null;
        }, 500);
      } else {
        wsRef.current = null;
      }
    };
  }, [listId, onMessage]);

  return wsRef;
}
