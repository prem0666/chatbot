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
    <form
      onSubmit={handleSubmit}
      className="w-full flex gap-2 items-end"
    >
      <div className="flex-1 relative">
        <Input
          type="text"
          placeholder="Message Alex..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={disabled}
          className="w-full bg-secondary/50 border-border/50 focus:border-primary transition-all rounded-2xl px-4 py-3 pr-12 text-sm shadow-sm"
        />
        <Button
          type="submit"
          disabled={!inputText.trim() || disabled}
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary hover:bg-primary/90 rounded-xl shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
};

export default TextInput;
