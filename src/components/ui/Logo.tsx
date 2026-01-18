import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-3xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <motion.div 
      className="flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative">
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-foreground"
        >
          <rect
            x="4"
            y="8"
            width="40"
            height="28"
            rx="6"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="16" cy="22" r="3" fill="currentColor" />
          <circle cx="32" cy="22" r="3" fill="currentColor" />
          <path
            d="M20 28C20 28 22 30 24 30C26 30 28 28 28 28"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M12 36L8 42"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M36 36L40 42"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {showText && (
        <span className={`font-semibold tracking-tight ${text}`}>
          Chatiefy
        </span>
      )}
    </motion.div>
  );
}
