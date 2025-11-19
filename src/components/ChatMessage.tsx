import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const ChatMessage = ({ role, content, timestamp }: ChatMessageProps) => {
  const isUser = role === "user";
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser ? "bg-secondary" : "bg-gradient-to-br from-primary to-primary-glow"
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-foreground" />
        ) : (
          <Bot className="w-5 h-5 text-primary-foreground" />
        )}
      </div>
      
      <div className="flex flex-col gap-1 max-w-[70%]">
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-secondary text-foreground"
              : "bg-card text-card-foreground border border-primary/20"
          }`}
        >
          <p className="text-sm leading-relaxed">{content}</p>
        </div>
        <span className={`text-xs text-muted-foreground ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(timestamp)}
        </span>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
