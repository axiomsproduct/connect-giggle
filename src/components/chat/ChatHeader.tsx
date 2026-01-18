import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LogOut, RotateCw, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { useStore } from '@/store/useStore';

interface ChatHeaderProps {
  onDisconnect: () => void;
  onNextChat: () => void;
}

export function ChatHeader({ onDisconnect, onNextChat }: ChatHeaderProps) {
  const { chatStatus, partnerName } = useStore();

  const getStatusColor = () => {
    switch (chatStatus) {
      case 'connected':
        return 'bg-status-online';
      case 'searching':
        return 'bg-status-searching';
      default:
        return 'bg-status-offline';
    }
  };

  const getStatusText = () => {
    switch (chatStatus) {
      case 'connected':
        return partnerName ? `Chatting with ${partnerName}` : 'Connected';
      case 'searching':
        return 'Finding someone...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Ready to chat';
    }
  };

  return (
    <header className="glass border-b border-border/50 px-4 h-16 flex items-center justify-between sticky top-0 z-50">
      <Logo size="sm" />

      <div className="flex items-center gap-3">
        <motion.div 
          className="flex items-center gap-2 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <span className="text-muted-foreground hidden sm:inline">
            {getStatusText()}
          </span>
        </motion.div>

        <Link to="/memes">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            title="Browse Memes"
          >
            <Image className="w-4 h-4" />
          </Button>
        </Link>

        {chatStatus === 'connected' && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onNextChat}
              className="h-9 w-9"
              title="Next chat"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDisconnect}
              className="h-9 w-9 text-destructive hover:text-destructive"
              title="Disconnect"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
