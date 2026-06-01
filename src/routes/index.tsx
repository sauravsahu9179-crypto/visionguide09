import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Clock, X, Pencil, Check } from "lucide-react";
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
const DEFAULT_TITLE = "New Conversation";

type Recent = { id: string; label: string; ts: number };

function loadRecents(): Recent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/**
 * Build a title from a message: first 5 words, with "…" if longer.
 * Exported-style helper kept in-file so the naming rule lives in one place
 * and can be reused if/when we wire up programmatic message capture.
 */
export function titleFromMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return DEFAULT_TITLE;
  const words = trimmed.split(/\s+/);
  if (words.length <= 5) return words.join(" ");
  return words.slice(0, 5).join(" ") + "…";
}

function Index() {
  const [sessionId, setSessionId] = useState<string>(() => `s-${Date.now()}`);
  const [panel, setPanel] = useState<"none" | "search" | "recents">("none");
  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState<Recent[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  const persist = (next: Recent[]) => {
    setRecents(next);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  };

  const newChat = () => {
    const id = `s-${Date.now()}`;
    const entry: Recent = { id, label: DEFAULT_TITLE, ts: Date.now() };
    persist([entry, ...recents].slice(0, 20));
    setSessionId(id);
    setPanel("none");
  };

  const openRecent = (id: string) => {
    setSessionId(id);
    setPanel("none");
  };

  const clearRecents = () => {
    persist([]);
  };

  const startRename = (r: Recent) => {
    setEditingId(r.id);
    setEditingValue(r.label === DEFAULT_TITLE ? "" : r.label);
  };

  const commitRename = (id: string) => {
    const title = titleFromMessage(editingValue);
    persist(recents.map((r) => (r.id === id ? { ...r, label: title } : r)));
    setEditingId(null);
    setEditingValue("");
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
                  placeholder="Search chats by title…"
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
                        <li key={r.id} className="group">
                          {editingId === r.id ? (
                            <div className="flex items-center gap-1 px-1">
                              <Input
                                autoFocus
                                value={editingValue}
                                onChange={(e) =>
                                  setEditingValue(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") commitRename(r.id);
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                placeholder="Title (first 5 words)…"
                                className="h-7 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => commitRename(r.id)}
                                className="text-muted-foreground hover:text-foreground"
                                aria-label="Save title"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div
                              className={cn(
                                "flex items-center gap-1 rounded transition-colors hover:bg-secondary/60",
                                sessionId === r.id &&
                                  "bg-secondary text-secondary-foreground",
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => openRecent(r.id)}
                                className="flex-1 truncate px-2 py-1.5 text-left text-xs"
                                title={r.label}
                              >
                                {r.label || DEFAULT_TITLE}
                              </button>
                              <button
                                type="button"
                                onClick={() => startRename(r)}
                                className="px-1.5 text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100"
                                aria-label="Rename chat"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                            </div>
                          )}
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
