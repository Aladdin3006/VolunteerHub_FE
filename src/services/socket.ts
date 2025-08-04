// src/services/socket.ts
import { io, Socket } from "socket.io-client";

export interface ServerToClientEvents {
  "storm-activated": (data: any) => void;
  "storm-deactivated": (stormId: string) => void;
  "notification": (data: any) => void;
  "relief-point:new": (data: any) => void;
  "weather:update": (data: { alerts: any[]; current: any; location: any }) => void;
}

export interface ClientToServerEvents {
  "join-room": (roomId: string) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  import.meta.env.VITE_API_URL || "http://localhost:4000",
  {
    transports: ["websocket"],
    autoConnect: true,
    query: {
      userId: localStorage.getItem("userId") || "",
    },
  }
);

export default socket;
