import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Image } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MemeButton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
    >
      <Link to="/memes">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          title="Browse Memes"
        >
          <Image className="w-5 h-5" />
        </Button>
      </Link>
    </motion.div>
  );
}
