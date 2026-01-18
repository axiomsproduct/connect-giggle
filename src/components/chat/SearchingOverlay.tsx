import { motion } from 'framer-motion';
import { Loader2, Users } from 'lucide-react';

export function SearchingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm z-40"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Users className="w-10 h-10 text-foreground" />
          </motion.div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Finding someone...</h3>
          <p className="text-sm text-muted-foreground">
            Connecting you with a random stranger
          </p>
        </div>

        <motion.div
          className="flex items-center justify-center gap-2 text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Please wait</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
