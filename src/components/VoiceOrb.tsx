import { motion } from "framer-motion";

interface VoiceOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  onClick: () => void;
}

const VoiceOrb = ({ isListening, isSpeaking, onClick }: VoiceOrbProps) => {
  const getOrbState = () => {
    if (isListening) return "listening";
    if (isSpeaking) return "speaking";
    return "idle";
  };

  const state = getOrbState();

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      <motion.div
        className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-primary/20 to-primary-glow/20 blur-2xl"
        animate={{
          scale: state !== "idle" ? [1, 1.2, 1] : 1,
          opacity: state !== "idle" ? [0.3, 0.6, 0.3] : 0.2,
        }}
        transition={{
          duration: 2,
          repeat: state !== "idle" ? Infinity : 0,
          ease: "easeInOut",
        }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute w-64 h-64 rounded-full border-2 border-primary/30"
        animate={{
          scale: state === "listening" ? [1, 1.15, 1] : state === "speaking" ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: state === "listening" ? 1.5 : 2,
          repeat: state !== "idle" ? Infinity : 0,
          ease: "easeInOut",
        }}
      />

      {/* Main orb */}
      <motion.button
        onClick={onClick}
        className="relative w-48 h-48 rounded-full bg-gradient-to-br from-primary to-primary-glow shadow-glow cursor-pointer outline-none border-none overflow-hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: state !== "idle" 
            ? [
                "0 0 40px hsl(195 100% 50% / 0.3)",
                "0 0 60px hsl(195 100% 50% / 0.5)",
                "0 0 40px hsl(195 100% 50% / 0.3)",
              ]
            : "0 0 40px hsl(195 100% 50% / 0.3)",
        }}
        transition={{
          duration: 1.5,
          repeat: state !== "idle" ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        {/* Inner pulse effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
          animate={{
            opacity: state === "speaking" ? [0.2, 0.4, 0.2] : state === "listening" ? [0.3, 0.5, 0.3] : 0.2,
          }}
          transition={{
            duration: 1,
            repeat: state !== "idle" ? Infinity : 0,
            ease: "easeInOut",
          }}
        />

        {/* Voice wave visualization */}
        {state !== "idle" && (
          <div className="absolute inset-0 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-white/80 rounded-full"
                animate={{
                  height: state === "listening" ? ["20%", "60%", "20%"] : ["30%", "50%", "30%"],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}

        {/* Idle state icon */}
        {state === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
        )}
      </motion.button>
    </div>
  );
};

export default VoiceOrb;
