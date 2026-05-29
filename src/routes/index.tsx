import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Image as ImageIcon, Plus, Search, Clock } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "My Doc Expert — Ask questions about your documents" },
      {
        name: "description",
        content:
          "Chat with your document collections. Ask questions and get instant answers from My Doc Expert.",
      },
    ],
  }),
});

const collections = [
  {
    id: "ai-image-video",
    name: "AI Image & Video Doc",
    icon: ImageIcon,
    src: "https://udify.app/chatbot/2fH0FZvt7QYGT8G9",
  },
] as const;

const topActions = [
  { id: "new", name: "NEW CHAT", icon: Plus },
  { id: "search", name: "SEARCH CHAT", icon: Search },
  { id: "recents", name: "RECENTS", icon: Clock },
] as const;

function Index() {
  const [activeId, setActiveId] = useState<string>(collections[0].id);
  const active = collections.find((c) => c.id === activeId) ?? collections[0];

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">My Doc Expert</h1>
          <p className="text-xs text-muted-foreground">
            Ask questions about your documents.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-border p-3 md:flex">
          <nav className="flex flex-col gap-1">
            {topActions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.id}
                  type="button"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{a.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="my-3 border-t border-border" />

          <nav className="flex flex-col gap-1">
            {collections.map((c) => {
              const Icon = c.icon;
              const isActive = activeId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-secondary text-secondary-foreground font-medium"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{c.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <iframe
            key={active.id}
            src={active.src}
            title={`${active.name} Chat`}
            allow="microphone"
            frameBorder={0}
            style={{ width: "100%", height: "100%", minHeight: 700 }}
          />
        </main>
      </div>
    </div>
  );
}
