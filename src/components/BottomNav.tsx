import { Home, MessageSquare, MessageCircle, Bell, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '@/lib/store';
import { getDeviceId } from '@/lib/nickname';

const navItems = [
  { path: '/', icon: Home, label: '피드' },
  { path: '/messages', icon: MessageSquare, label: '쪽지' },
  { path: '/chats', icon: MessageCircle, label: '채팅' },
  { path: '/notifications', icon: Bell, label: '알림' },
  { path: '/profile', icon: User, label: '내 정보' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const deviceId = getDeviceId();
  const unread = unreadCount(deviceId);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors relative ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
              {label === '알림' && unread > 0 && (
                <span className="absolute -top-0.5 right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
