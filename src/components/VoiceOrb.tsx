import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

interface VoiceOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  onClick: () => void;
}

const VoiceOrb = ({ isListening, isSpeaking, onClick }: VoiceOrbProps) => {
  return (
    <motion.button
      onClick={onClick}
      className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-glow shadow-lg flex items-center justify-center cursor-pointer group hover:shadow-xl"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        boxShadow: isListening
          ? "0 0 20px rgba(var(--primary), 0.5)"
          : isSpeaking
          ? "0 0 20px rgba(var(--primary-glow), 0.5)"
          : "0 4px 12px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Animated rings */}
      {(isListening || isSpeaking) && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/50"
            animate={{
              scale: [1, 1.5],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary-glow/50"
            animate={{
              scale: [1, 1.5],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.75,
            }}
          />
        </>
      )}

      {/* Center icon */}
      <motion.div
        animate={{
          scale: isListening ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 0.5,
          repeat: isListening ? Infinity : 0,
        }}
      >
        {isListening || isSpeaking ? (
          <Mic className="w-5 h-5 text-primary-foreground" />
        ) : (
          <MicOff className="w-5 h-5 text-primary-foreground" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default VoiceOrb;
