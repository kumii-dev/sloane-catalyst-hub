import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, Sparkles, TrendingUp, FileText, Lightbulb, History, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  { icon: TrendingUp, text: "Help me create a funding strategy", category: "Funding" },
  { icon: FileText, text: "Review my business plan", category: "Documents" },
  { icon: Lightbulb, text: "Suggest growth opportunities", category: "Strategy" },
  { icon: History, text: "Analyze my market competition", category: "Market" },
];

export default function Copilot() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const focus = searchParams.get("focus");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/copilot-chat`;
    
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ 
        messages: userMessages,
        context: {
          userType: "startup_founder", // Could be dynamic from user profile
          industry: "technology",
          stage: "seed",
          focus: focus || undefined
        }
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
      if (resp.status === 402) {
        throw new Error("AI credits depleted. Please add funds to continue.");
      }
      throw new Error("Failed to get response from AI");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;
    let assistantContent = "";

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            // Update the last message with accumulated content
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMsg = newMessages[newMessages.length - 1];
              if (lastMsg?.role === "assistant") {
                newMessages[newMessages.length - 1] = {
                  ...lastMsg,
                  content: assistantContent
                };
              } else {
                newMessages.push({ role: "assistant", content: assistantContent });
              }
              return newMessages;
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat(newMessages);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      // Remove the failed assistant message if it exists
      setMessages(prev => prev.filter(m => m.role === "user" || m.content.trim() !== ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
    textareaRef.current?.focus();
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <Layout showSidebar>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <Card className="mb-4">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Kumii AI Assistant
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      Powered by AI
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {focus === "strategy" && "Focused on Business Strategy"}
                    {focus === "funding" && "Focused on Funding Advice"}
                    {focus === "market" && "Focused on Market Analysis"}
                    {!focus && "Your intelligent business advisor"}
                  </p>
                </div>
              </div>
              {messages.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearChat}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Chat
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Quick Prompts */}
        {messages.length === 0 && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium mb-3">Quick Start</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4"
                    onClick={() => handleQuickPrompt(prompt.text)}
                  >
                    <prompt.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-sm">{prompt.text}</div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {prompt.category}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Messages */}
        <Card className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Bot className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Welcome to Kumii AI Assistant</h3>
                <p className="text-muted-foreground max-w-md">
                  I'm here to help with business strategy, funding advice, market analysis,
                  and more. Ask me anything or use one of the quick prompts above!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold">You</span>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                placeholder="Ask me anything about your business..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[60px] w-[60px]"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
