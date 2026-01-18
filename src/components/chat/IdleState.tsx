import { motion } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IdleStateProps {
  onStartChat: () => void;
  isLoading?: boolean;
}

export function IdleState({ onStartChat, isLoading }: IdleStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col items-center justify-center p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <div className="w-24 h-24 mx-auto rounded-full bg-secondary flex items-center justify-center">
          <MessageCircle className="w-12 h-12 text-foreground" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Ready to connect?</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Start a random chat and meet someone new from around the world.
          </p>
        </div>

        <Button
          size="lg"
          onClick={onStartChat}
          disabled={isLoading}
          className="h-14 px-8 text-base gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Find Someone
        </Button>
      </motion.div>
    </motion.div>
  );
}
