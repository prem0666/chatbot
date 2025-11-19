import { useState, useRef, useEffect } from "react";
import VoiceOrb from "@/components/VoiceOrb";
import ChatMessage from "@/components/ChatMessage";
import TextInput from "@/components/TextInput";
import { useToast } from "@/hooks/use-toast";
import { streamChat, speakText, stopSpeaking } from "@/utils/audioUtils";
import { Mic, MicOff } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (userText: string, shouldSpeak: boolean = false) => {
    const userMsg: Message = { role: "user", content: userText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantContent = "";
    const assistantTimestamp = new Date();
    const upsertAssistant = (nextChunk: string) => {
      assistantContent += nextChunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent, timestamp: assistantTimestamp }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => {
          setIsLoading(false);
          if (shouldSpeak) {
            setIsSpeaking(true);
            speakText(assistantContent);
            
            setTimeout(() => {
              setIsSpeaking(false);
            }, assistantContent.length * 50);
          }
        },
      });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
    }
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      await sendMessage(transcript, true);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error !== "no-speech") {
        toast({
          title: "Recognition Error",
          description: "Could not understand audio. Please try again.",
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleOrbClick = () => {
    if (isListening) {
      stopListening();
    } else if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-radial opacity-50 pointer-events-none" />
      
      <div className="w-full max-w-4xl flex flex-col items-center gap-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Voice Assistant
          </h1>
          <p className="text-muted-foreground">
            {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Tap to speak"}
          </p>
        </div>

        {/* Voice Orb */}
        <VoiceOrb
          isListening={isListening}
          isSpeaking={isSpeaking}
          onClick={handleOrbClick}
        />

        {/* Status indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isListening ? (
            <>
              <Mic className="w-4 h-4 text-primary animate-pulse" />
              <span>Listening to your voice...</span>
            </>
          ) : isSpeaking ? (
            <>
              <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
              <span>Speaking response...</span>
            </>
          ) : (
            <>
              <MicOff className="w-4 h-4" />
              <span>Click the orb to start</span>
            </>
          )}
        </div>

        {/* Chat History */}
        {messages.length > 0 && (
          <div className="w-full max-w-2xl bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-6 max-h-96 overflow-y-auto space-y-4">
            {messages.map((message, index) => (
              <ChatMessage 
                key={index} 
                role={message.role} 
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-glow">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
                <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-card text-card-foreground border border-primary/20">
                  <p className="text-sm text-muted-foreground">Alex is typing...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Text Input */}
        <TextInput onSend={(text) => sendMessage(text, false)} disabled={isLoading} />
      </div>
    </div>
  );
};

export default Index;
