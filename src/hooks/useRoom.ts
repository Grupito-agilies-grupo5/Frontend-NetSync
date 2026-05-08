// ============================================
// NetSync Frontend - useRoom Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { RoomUser } from '../types';

interface UseRoomReturn {
  users: RoomUser[];
  isConnected: boolean;
  joinRoom: (roomId: string, userName: string, isHost: boolean) => void;
}

export function useRoom(socket: Socket): UseRoomReturn {
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('room:userJoined', (data: { user: RoomUser; users: RoomUser[] }) => {
      setUsers(data.users);
    });

    socket.on('room:userLeft', (data: { user: RoomUser; users: RoomUser[] }) => {
      setUsers(data.users);
    });

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room:userJoined');
      socket.off('room:userLeft');
    };
  }, [socket]);

  const joinRoom = useCallback(
    (roomId: string, userName: string, isHost: boolean) => {
      socket.emit('room:join', { roomId, userName, isHost });
    },
    [socket]
  );

  return { users, isConnected, joinRoom };
}
