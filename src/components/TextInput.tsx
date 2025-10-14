import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

interface TextInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const TextInput = ({ onSend, disabled }: TextInputProps) => {
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !disabled) {
      onSend(inputText.trim());
      setInputText("");
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      onSubmit={handleSubmit}
      className="w-full max-w-2xl flex gap-2"
    >
      <Input
        type="text"
        placeholder="Type your message..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={disabled}
        className="flex-1 bg-card border-primary/20 focus:border-primary transition-colors"
      />
      <Button
        type="submit"
        disabled={!inputText.trim() || disabled}
        className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
      >
        <Send className="w-4 h-4" />
      </Button>
    </motion.form>
  );
};

export default TextInput;
