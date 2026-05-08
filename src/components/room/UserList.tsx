import React from 'react';
import { RoomUser } from '../../types';
import { Crown, User, Wifi } from 'lucide-react';

interface UserListProps {
  users: RoomUser[];
  currentUser: string;
}

export const UserList: React.FC<UserListProps> = ({ users, currentUser }) => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Conectados</h3>
        <div className="flex items-center gap-1.5 text-xs text-green-400">
          <Wifi className="w-3 h-3" />
          {users.length}
        </div>
      </div>
      <div className="space-y-2">
        {users.map((user) => {
          const isMe = user.name === currentUser;
          return (
            <div
              key={user.id}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                isMe ? 'bg-primary-600/15 border border-primary-500/20' : 'bg-dark-800/40'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  user.isHost
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-dark-900'
                    : 'bg-gradient-to-br from-primary-500 to-accent-500 text-white'
                }`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium truncate">
                    {user.name}
                    {isMe && <span className="text-dark-500 text-xs ml-1">(tú)</span>}
                  </span>
                  {user.isHost && (
                    <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  )}
                </div>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
            </div>
          );
        })}
        {users.length === 0 && (
          <div className="text-center py-4 text-dark-500 text-sm">
            <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Esperando usuarios...</p>
          </div>
        )}
      </div>
    </div>
  );
};
