import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Clock, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "VisionGuide — Advisory pixel knowledge" },
      {
        name: "description",
        content:
          "VisionGuide is your advisor for AI image, video, and digital pixel knowledge.",
      },
    ],
  }),
});

const CHAT_SRC = "https://udify.app/chatbot/2fH0FZvt7QYGT8G9";
const RECENTS_KEY = "visionguide.recents";

type Recent = { id: string; label: string; ts: number };

function loadRecents(): Recent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function Index() {
  const [sessionId, setSessionId] = useState<string>(() => `s-${Date.now()}`);
  const [panel, setPanel] = useState<"none" | "search" | "recents">("none");
  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState<Recent[]>([]);

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  const newChat = () => {
    const id = `s-${Date.now()}`;
    const entry: Recent = {
      id,
      label: new Date().toLocaleString(),
      ts: Date.now(),
    };
    const next = [entry, ...recents].slice(0, 20);
    setRecents(next);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    setSessionId(id);
    setPanel("none");
  };

  const openRecent = (id: string) => {
    setSessionId(id);
    setPanel("none");
  };

  const clearRecents = () => {
    setRecents([]);
    localStorage.removeItem(RECENTS_KEY);
  };

  const filteredRecents = useMemo(
    () =>
      recents.filter((r) =>
        r.label.toLowerCase().includes(query.toLowerCase()),
      ),
    [recents, query],
  );

  const topActions = [
    { id: "new", name: "NEW CHAT", icon: Plus, onClick: newChat },
    {
      id: "search",
      name: "SEARCH CHAT",
      icon: Search,
      onClick: () => setPanel(panel === "search" ? "none" : "search"),
    },
    {
      id: "recents",
      name: "RECENTS",
      icon: Clock,
      onClick: () => setPanel(panel === "recents" ? "none" : "recents"),
    },
  ] as const;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">VisionGuide</h1>
          <p className="text-xs text-muted-foreground">
            Advisory pixel knowledge for AI image, video & digital insights.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-border p-3 md:flex">
          <nav className="flex flex-col gap-1">
            {topActions.map((a) => {
              const Icon = a.icon;
              const isActive =
                (a.id === "search" && panel === "search") ||
                (a.id === "recents" && panel === "recents");
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={a.onClick}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium tracking-wide transition-colors",
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{a.name}</span>
                </button>
              );
            })}
          </nav>

          {panel !== "none" && (
            <div className="mt-4 flex min-h-0 flex-1 flex-col rounded-md border border-border bg-card p-2">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {panel === "search" ? "Search" : "Recents"}
                </span>
                <button
                  type="button"
                  onClick={() => setPanel("none")}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {panel === "search" && (
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search recent chats…"
                  className="mb-2"
                />
              )}

              <div className="flex-1 overflow-y-auto">
                {(panel === "search" ? filteredRecents : recents).length === 0 ? (
                  <p className="px-2 py-4 text-xs text-muted-foreground">
                    No chats yet. Start a new one.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {(panel === "search" ? filteredRecents : recents).map(
                      (r) => (
                        <li key={r.id}>
                          <button
                            type="button"
                            onClick={() => openRecent(r.id)}
                            className={cn(
                              "w-full truncate rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-secondary/60",
                              sessionId === r.id &&
                                "bg-secondary text-secondary-foreground",
                            )}
                          >
                            {r.label}
                          </button>
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </div>

              {panel === "recents" && recents.length > 0 && (
                <button
                  type="button"
                  onClick={clearRecents}
                  className="mt-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </aside>

        <main className="min-w-0 flex-1">
          <iframe
            key={sessionId}
            src={CHAT_SRC}
            title="VisionGuide Chat"
            allow="microphone"
            frameBorder={0}
            style={{ width: "100%", height: "100%", minHeight: 700 }}
          />
        </main>
      </div>
    </div>
  );
}
