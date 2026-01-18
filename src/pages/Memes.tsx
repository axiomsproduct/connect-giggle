import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ThumbsUp, ThumbsDown, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { useStore } from '@/store/useStore';
import { fetchMemes, type Meme } from '@/lib/api';

function MemeCard({ meme, onClick }: { meme: Meme; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group cursor-pointer overflow-hidden rounded-xl bg-secondary"
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={meme.path}
          alt={meme.filename}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-4 text-white text-sm">
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            {meme.likes}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsDown className="w-4 h-4" />
            {meme.dislikes}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function MemeModal({ meme, onClose }: { meme: Meme; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-card shadow-floating"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
        
        <img
          src={meme.path}
          alt={meme.filename}
          className="w-full h-auto max-h-[70vh] object-contain"
        />
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-sm">
                <ThumbsUp className="w-4 h-4" />
                {meme.likes}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <ThumbsDown className="w-4 h-4" />
                {meme.dislikes}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              By {meme.hunter}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Memes() {
  const navigate = useNavigate();
  const { user, authToken, isAuthenticated } = useStore();
  
  const [memes, setMemes] = useState<Meme[]>([]);
  const [lastMemeId, setLastMemeId] = useState('0');
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const loadMemes = useCallback(async () => {
    if (!user || !authToken || isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const response = await fetchMemes(authToken, user.auth, lastMemeId);
      setMemes((prev) => [...prev, ...response.memes]);
      setHasMore(response.has_more);
      if (response.memes.length > 0) {
        setLastMemeId(response.memes[response.memes.length - 1].id);
      }
    } catch (error) {
      console.error('Failed to load memes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, authToken, isLoading, hasMore, lastMemeId]);

  // Initial load
  useEffect(() => {
    if (memes.length === 0 && isAuthenticated) {
      loadMemes();
    }
  }, [isAuthenticated]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMemes();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMemes, hasMore, isLoading]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass border-b border-border/50 px-4 h-16 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chat')}
            className="h-9 w-9"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Logo size="sm" />
        </div>
        <span className="text-sm text-muted-foreground">Meme Browser</span>
      </header>

      {/* Grid */}
      <main className="container max-w-5xl py-6 px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {memes.map((meme) => (
            <MemeCard
              key={meme.id}
              meme={meme}
              onClick={() => setSelectedMeme(meme)}
            />
          ))}
        </div>

        {/* Loader */}
        <div ref={loaderRef} className="flex justify-center py-8">
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading memes...</span>
            </div>
          )}
          {!hasMore && memes.length > 0 && (
            <p className="text-sm text-muted-foreground">No more memes to load</p>
          )}
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {selectedMeme && (
          <MemeModal meme={selectedMeme} onClose={() => setSelectedMeme(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
