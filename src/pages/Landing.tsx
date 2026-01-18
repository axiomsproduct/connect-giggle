import { motion } from 'framer-motion';
import { MessageCircle, Shield, Zap } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { UsernameForm } from '@/components/landing/UsernameForm';
import { useStore } from '@/store/useStore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: MessageCircle,
    title: 'Random Chat',
    description: 'Connect with strangers worldwide instantly',
  },
  {
    icon: Shield,
    title: 'Anonymous',
    description: 'No registration, complete privacy',
  },
  {
    icon: Zap,
    title: 'Real-time',
    description: 'Instant messaging with low latency',
  },
];

export default function Landing() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container flex items-center justify-between h-16 px-4">
          <Logo size="sm" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center pt-16 pb-24 px-4">
        <div className="w-full max-w-md text-center space-y-8">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance">
              Meet new people.
              <br />
              <span className="text-muted-foreground">Anonymously.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-sm mx-auto">
              Connect with strangers from around the world in real-time. No sign-up required.
            </p>
          </motion.div>

          {/* Form */}
          <UsernameForm />

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-3 gap-4 pt-8"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-center space-y-2"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-secondary flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-foreground" />
                </div>
                <p className="text-xs font-medium">{feature.title}</p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-xs text-muted-foreground">
        <p>© 2026 Chatiefy. All rights reserved.</p>
      </footer>
    </div>
  );
}
