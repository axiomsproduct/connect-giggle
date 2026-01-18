import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { checkUsername, registerGuest } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';

export function UsernameForm() {
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const setUser = useStore((s) => s.setUser);
  const navigate = useNavigate();

  const checkAvailability = useCallback(async (name: string) => {
    if (name.length < 3) {
      setIsAvailable(null);
      setSuggestions([]);
      return;
    }
    
    setIsChecking(true);
    try {
      const result = await checkUsername(name);
      setIsAvailable(result.available ?? false);
      setSuggestions(result.suggestions ?? []);
      setError(result.error || null);
    } catch {
      setError('Failed to check username');
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const debouncedCheck = useDebounce(checkAvailability, 400);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
    setUsername(value);
    setError(null);
    if (value.length >= 3) {
      debouncedCheck(value);
    } else {
      setIsAvailable(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || username.length < 3 || !isAvailable) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await registerGuest(username);
      setUser(
        {
          username: result.details.username,
          auth: result.auth,
          avatar: result.details.avatar,
        },
        result.auth
      );
      navigate('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setUsername(suggestion);
    setIsAvailable(true);
    setSuggestions([]);
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <div className="space-y-2">
        <label 
          htmlFor="username" 
          className="text-sm font-medium text-muted-foreground"
        >
          Choose a username
        </label>
        <div className="relative">
          <Input
            id="username"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={handleInputChange}
            maxLength={20}
            className="h-14 text-lg pr-12 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-foreground/20"
            autoComplete="off"
            autoFocus
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <AnimatePresence mode="wait">
              {isChecking && (
                <motion.div
                  key="checking"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                </motion.div>
              )}
              {!isChecking && isAvailable === true && (
                <motion.div
                  key="available"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Check className="w-5 h-5 text-status-online" />
                </motion.div>
              )}
              {!isChecking && isAvailable === false && (
                <motion.div
                  key="unavailable"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <X className="w-5 h-5 text-destructive" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <p className="text-xs text-muted-foreground">Try these instead:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    className="px-3 py-1.5 text-sm bg-secondary hover:bg-accent rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={!username || username.length < 3 || !isAvailable || isSubmitting}
        className="w-full h-14 text-base font-medium gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            Start Chatting
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        No registration required. Your identity stays private.
      </p>
    </motion.form>
  );
}
