import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import type { Message } from '@/lib/api';

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface MessageBubbleProps {
  message: Message;
  isSelf: boolean;
}

function MessageBubble({ message, isSelf }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl ${
          isSelf
            ? 'bg-chat-self text-chat-self-foreground rounded-br-md'
            : 'bg-chat-other text-chat-other-foreground rounded-bl-md'
        }`}
      >
        <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
          {message.message}
        </p>
        <p
          className={`text-[10px] mt-1 ${
            isSelf ? 'text-chat-self-foreground/60' : 'text-muted-foreground'
          }`}
        >
          {formatTime(message.time)}
        </p>
      </div>
    </motion.div>
  );
}

export function ChatMessages() {
  const { messages, user } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground text-center"
        >
          Say hello to start the conversation!
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => (
          <MessageBubble
            key={`${message.time}-${index}`}
            message={message}
            isSelf={message.hunter === user?.username}
          />
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
}
