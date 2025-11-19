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
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-primary-foreground">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Alex</h1>
              <p className="text-xs text-muted-foreground">Your AI Companion</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <VoiceOrb
              isListening={isListening}
              isSpeaking={isSpeaking}
              onClick={handleOrbClick}
            />
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] space-y-6 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-2xl">
                  <span className="text-3xl font-bold text-primary-foreground">A</span>
                </div>
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">Hey there! I'm Alex</h2>
                <p className="text-muted-foreground max-w-md">
                  I'm here to chat, help, or just listen. Go ahead and ask me anything or tap the voice button to speak!
                </p>
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full">
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
                    <span>Ready to chat</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-32">
              {messages.map((message, index) => (
                <ChatMessage 
                  key={index} 
                  role={message.role} 
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-start gap-4 animate-fade-in">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-primary-foreground">A</span>
                  </div>
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">Alex</span>
                      <span className="text-xs text-muted-foreground">typing...</span>
                    </div>
                    <div className="bg-secondary/50 rounded-2xl px-4 py-3 inline-block">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="sticky bottom-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <TextInput onSend={(text) => sendMessage(text, false)} disabled={isLoading} />
          
          {/* Status indicator for mobile */}
          {(isListening || isSpeaking) && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2 animate-fade-in">
              {isListening ? (
                <>
                  <Mic className="w-3 h-3 text-primary animate-pulse" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  <span>Speaking...</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
