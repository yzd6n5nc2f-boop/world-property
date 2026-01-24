"use client";

import { useMemo, useState } from "react";
import { Bot, SendHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getConciergeReply, type ConciergeMessage } from "@/lib/ai/concierge";
import { cn } from "@/lib/utils/cn";

const suggestions = [
  "I want a 2-bed in Lisbon under £400k",
  "Show me stylish rentals near the beach",
  "Find stays in Tokyo for next month"
];

export function AiConcierge() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ConciergeMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm your World Property concierge. Tell me what you're looking for."
    }
  ]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  const canSend = draft.trim().length > 2 && !loading;

  async function sendMessage(content: string) {
    const nextUserMessage: ConciergeMessage = { role: "user", content };
    setMessages((prev) => [...prev, nextUserMessage]);
    setDraft("");
    setLoading(true);

    const reply = await getConciergeReply([...messages, nextUserMessage]);
    setMessages((prev) => [...prev, reply]);
    setLoading(false);
  }

  const renderedMessages = useMemo(
    () =>
      messages.map((message, index) => (
        <div
          key={`${message.role}-${index}`}
          className={cn(
            "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
            message.role === "assistant" ? "bg-muted text-foreground" : "ml-auto bg-primary text-primary-foreground"
          )}
        >
          {message.content}
        </div>
      )),
    [messages]
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-5 right-5 z-40 gap-2 rounded-full px-5 shadow-soft" size="lg">
          <Sparkles className="h-4 w-4" />
          AI Concierge
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex h-full flex-col gap-4">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Concierge
          </SheetTitle>
          <SheetDescription>Get guided suggestions for buying, renting, or staying.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Button key={suggestion} variant="secondary" size="sm" onClick={() => void sendMessage(suggestion)}>
              {suggestion}
            </Button>
          ))}
        </div>

        <ScrollArea className="flex-1 rounded-xl border border-border/60 bg-background p-3">
          <div className="flex flex-col gap-3">{renderedMessages}</div>
        </ScrollArea>

        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSend) return;
            void sendMessage(draft.trim());
          }}
        >
          <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask for a neighbourhood, budget, or vibe…" />
          <Button type="submit" size="icon" disabled={!canSend} aria-label="Send message">
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
