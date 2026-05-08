// ============================================
// NetSync Frontend - useSocket Hook
// ============================================

import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket } from '../services/socket';

export function useSocket(): Socket {
  const socketRef = useRef<Socket>(connectSocket());

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      // Don't disconnect on unmount — let the RoomPage handle disconnect
    };
  }, []);

  return socketRef.current;
}
