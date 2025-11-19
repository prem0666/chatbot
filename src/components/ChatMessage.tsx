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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex items-start gap-4 group ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
          isUser 
            ? "bg-gradient-to-br from-secondary to-secondary/80" 
            : "bg-gradient-to-br from-primary to-primary-glow"
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-foreground" />
        ) : (
          <span className="text-sm font-bold text-primary-foreground">A</span>
        )}
      </div>
      
      {/* Message Content */}
      <div className={`flex-1 space-y-1 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {/* Name and Timestamp */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? "flex-row-reverse" : ""}`}>
          <span className="font-semibold text-sm">{isUser ? "You" : "Alex"}</span>
          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(timestamp)}
          </span>
        </div>
        
        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 max-w-[85%] ${
            isUser
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary/50 text-foreground"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
