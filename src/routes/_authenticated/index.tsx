import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  Plus,
  Search,
  Clock,
  X,
  Pencil,
  Check,
  LogOut,
  Menu,
  Trash2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "VisionGuide — Advisory Pixel Knowledge" },
      {
        name: "description",
        content: "VisionGuide is your advisor for AI image, video, and digital pixel knowledge.",
      },
    ],
  }),
});

const DEFAULT_CHAT_SRC = "https://udify.app/chatbot/2fH0FZvt7QYGT8G9";
const RECENTS_KEY = "visionguide.recents";
const DEFAULT_TITLE = "New Conversation";
const MAX_RECENTS = 30;

function getValidatedChatSrc(): string {
  const envUrl = import.meta.env.VITE_CHATBOT_URL;
  if (
    typeof envUrl === "string" &&
    (envUrl.startsWith("https://") || envUrl.startsWith("http://localhost"))
  ) {
    return envUrl;
  }
  return DEFAULT_CHAT_SRC;
}

type Recent = { id: string; label: string; ts: number };

function isValidRecent(item: unknown): item is Recent {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof (item as Recent).id === "string" &&
    typeof (item as Recent).label === "string" &&
    typeof (item as Recent).ts === "number"
  );
}

function loadRecents(): Recent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(isValidRecent).slice(0, MAX_RECENTS);
    }
    return [];
  } catch {
    return [];
  }
}

function titleFromMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return DEFAULT_TITLE;
  const words = trimmed.split(/\s+/);
  const truncated = words.length <= 5 ? words.join(" ") : words.slice(0, 5).join(" ") + "…";
  return truncated.slice(0, 60);
}

function Index() {
  const navigate = useNavigate();
  const initialId = useMemo(() => `s-${Date.now()}`, []);
  const [sessionId, setSessionId] = useState<string>(initialId);
  const [openSessions, setOpenSessions] = useState<string[]>([initialId]);
  const [panel, setPanel] = useState<"none" | "search" | "recents">("none");
  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState<Recent[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const chatSrc = useMemo(() => getValidatedChatSrc(), []);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = loadRecents();
    if (!loaded.some((r) => r.id === initialId)) {
      const seeded = [{ id: initialId, label: DEFAULT_TITLE, ts: Date.now() }, ...loaded].slice(
        0,
        MAX_RECENTS,
      );
      setRecents(seeded);
      try {
        localStorage.setItem(RECENTS_KEY, JSON.stringify(seeded));
      } catch {
        // Handle storage quota issues gracefully
      }
    } else {
      setRecents(loaded);
    }
  }, [initialId]);

  const persist = (next: Recent[]) => {
    const clamped = next.slice(0, MAX_RECENTS);
    setRecents(clamped);
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(clamped));
    } catch {
      toast.error("Could not save to local storage. Storage quota may be full.");
    }
  };

  const newChat = () => {
    const id = `s-${Date.now()}`;
    const entry: Recent = { id, label: DEFAULT_TITLE, ts: Date.now() };
    persist([entry, ...recents]);
    setOpenSessions((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setSessionId(id);
    setPanel("none");
    setMobileMenuOpen(false);
  };

  const openRecent = (id: string) => {
    setOpenSessions((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setSessionId(id);
    setPanel("none");
    setMobileMenuOpen(false);
  };

  const deleteRecent = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextRecents = recents.filter((r) => r.id !== id);
    persist(nextRecents);

    if (sessionId === id) {
      if (nextRecents.length > 0) {
        setSessionId(nextRecents[0].id);
      } else {
        newChat();
      }
    }
  };

  const clearRecents = () => {
    persist([]);
    newChat();
  };

  const startRename = (r: Recent, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(r.id);
    setEditingValue(r.label === DEFAULT_TITLE ? "" : r.label);
  };

  const commitRename = (id: string) => {
    const title = titleFromMessage(editingValue);
    persist(recents.map((r) => (r.id === id ? { ...r, label: title } : r)));
    setEditingId(null);
    setEditingValue("");
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate({ to: "/auth", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sign out");
      setSigningOut(false);
    }
  };

  const filteredRecents = useMemo(
    () => recents.filter((r) => r.label.toLowerCase().includes(query.toLowerCase())),
    [recents, query],
  );

  const topActions = [
    {
      id: "new",
      name: "NEW CHAT",
      icon: Plus,
      onClick: newChat,
      primary: true,
    },
    {
      id: "search",
      name: "SEARCH CHAT",
      icon: Search,
      onClick: () => {
        setPanel((curr) => {
          const next = curr === "search" ? "none" : "search";
          if (next === "search") {
            setTimeout(() => searchInputRef.current?.focus(), 100);
          }
          return next;
        });
      },
      primary: false,
    },
    {
      id: "recents",
      name: "RECENTS",
      icon: Clock,
      onClick: () => setPanel((curr) => (curr === "recents" ? "none" : "recents")),
      primary: false,
    },
  ] as const;

  const renderRecentList = (isMobile = false) => {
    const list = panel === "search" ? filteredRecents : recents;

    if (list.length === 0) {
      return (
        <p className="px-3 py-6 text-center text-xs text-muted-foreground">
          {panel === "search" ? "No matching chats found." : "No chats yet. Start a new one."}
        </p>
      );
    }

    return (
      <ul className="flex flex-col gap-1 px-1">
        {list.map((r) => {
          const isSelected = sessionId === r.id;
          const isEditing = editingId === r.id;

          return (
            <li key={r.id} className="group relative">
              {isEditing ? (
                <div className="flex items-center gap-1 rounded-md border border-primary/30 bg-background/80 p-1 shadow-sm">
                  <Input
                    autoFocus
                    value={editingValue}
                    maxLength={60}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename(r.id);
                      if (e.key === "Escape") cancelRename();
                    }}
                    placeholder="Chat title…"
                    className="h-8 text-xs font-medium focus-visible:ring-1"
                  />
                  <button
                    type="button"
                    onClick={() => commitRename(r.id)}
                    title="Save title (Enter)"
                    aria-label="Save title"
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded text-primary hover:bg-primary/10 active:scale-90"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelRename}
                    title="Cancel (Esc)"
                    aria-label="Cancel rename"
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium transition-all",
                    isSelected
                      ? "bg-secondary text-secondary-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => openRecent(r.id)}
                    className="min-w-0 flex-1 truncate text-left cursor-pointer select-none"
                    title={r.label}
                  >
                    {r.label || DEFAULT_TITLE}
                  </button>

                  <div
                    className={cn(
                      "flex items-center gap-0.5 shrink-0 transition-opacity",
                      isMobile
                        ? "opacity-80"
                        : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                    )}
                  >
                    <button
                      type="button"
                      onClick={(e) => startRename(r, e)}
                      title="Rename conversation"
                      aria-label={`Rename ${r.label}`}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground hover:bg-background/80 hover:text-foreground active:scale-90"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => deleteRecent(r.id, e)}
                      title="Delete conversation"
                      aria-label={`Delete ${r.label}`}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-90"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] flex-col bg-background text-foreground overflow-hidden">
      {/* Top Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-card/60 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3 z-20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open navigation menu"
                className="md:hidden inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-sm p-4 sm:p-5 flex flex-col h-full">
              <SheetHeader className="pb-3 border-b border-border">
                <SheetTitle className="flex items-center gap-2 text-left">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-tr from-fuchsia-600 to-cyan-500 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-base">VisionGuide Menu</span>
                </SheetTitle>
              </SheetHeader>

              <nav className="mt-4 flex flex-col gap-1.5 shrink-0">
                {topActions.map((a) => {
                  const Icon = a.icon;
                  const isActive =
                    (a.id === "search" && panel === "search") ||
                    (a.id === "recents" && panel === "recents");
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        a.onClick();
                        if (a.id === "new") setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex min-h-[42px] cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all active:scale-[0.98]",
                        a.primary
                          ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                          : isActive
                            ? "bg-secondary text-secondary-foreground"
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="font-semibold">{a.name}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Panel Details */}
              {panel !== "none" && (
                <div className="mt-4 flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-card/60 p-2 shadow-xs">
                  <div className="mb-2 flex items-center justify-between px-2 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {panel === "search" ? "Search Conversations" : "Recent Chats"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPanel("none")}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-90"
                      aria-label="Close panel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {panel === "search" && (
                    <div className="relative mb-2 px-1">
                      <Input
                        ref={searchInputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search chats by title…"
                        className="h-9 pr-8 text-xs font-medium"
                      />
                      {query && (
                        <button
                          type="button"
                          onClick={() => setQuery("")}
                          aria-label="Clear search"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="min-h-0 flex-1 overflow-y-auto">{renderRecentList(true)}</div>

                  {panel === "recents" && recents.length > 0 && (
                    <div className="mt-2 border-t border-border pt-2 px-1">
                      <button
                        type="button"
                        onClick={clearRecents}
                        className="w-full cursor-pointer rounded py-1.5 text-center text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-colors"
                      >
                        Clear all recents
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Footer */}
              <div className="mt-auto border-t border-border pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <span className="text-xs text-muted-foreground">Appearance</span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 active:scale-95 transition-all"
                >
                  {signingOut ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5" />
                  )}
                  <span>Sign out</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo Branding */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-fuchsia-600 via-violet-600 to-cyan-500 text-white shadow-sm shrink-0">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight truncate text-foreground font-sans">
                  VisionGuide
                </h1>
                <span className="hidden sm:inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
                  Advisory
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden md:block truncate max-w-xs lg:max-w-md">
                Advisory pixel knowledge for AI image, video & digital insights.
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label="Sign out of account"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border/50 bg-background/50 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {signingOut ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/30 p-3 md:flex">
          <nav className="flex flex-col gap-1.5 shrink-0">
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
                  aria-expanded={isActive}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium tracking-wide transition-all active:scale-[0.98] select-none",
                    a.primary
                      ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 font-semibold"
                      : isActive
                        ? "bg-secondary text-secondary-foreground font-semibold"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{a.name}</span>
                </button>
              );
            })}
          </nav>

          {panel !== "none" && (
            <div className="mt-3 flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-card p-2 shadow-xs">
              <div className="mb-2 flex items-center justify-between px-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {panel === "search" ? "Search Chats" : "Recent Chats"}
                </span>
                <button
                  type="button"
                  onClick={() => setPanel("none")}
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-90"
                  aria-label="Close panel"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {panel === "search" && (
                <div className="relative mb-2 px-1">
                  <Input
                    ref={searchInputRef}
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by title…"
                    className="h-8 pr-7 text-xs font-medium"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Clear query"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}

              <div className="min-h-0 flex-1 overflow-y-auto">{renderRecentList(false)}</div>

              {panel === "recents" && recents.length > 0 && (
                <div className="mt-2 border-t border-border pt-1.5 px-1">
                  <button
                    type="button"
                    onClick={clearRecents}
                    className="w-full cursor-pointer rounded py-1 text-center text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Responsive Chatbot Embed Area */}
        <main className="relative min-w-0 flex-1 h-full w-full overflow-hidden bg-background">
          {openSessions.map((id) => (
            <iframe
              key={id}
              src={chatSrc}
              title={`VisionGuide Advisory Session ${id}`}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
              allow="microphone; camera; clipboard-write; autoplay"
              referrerPolicy="no-referrer"
              loading={id === sessionId ? "eager" : "lazy"}
              className={cn(
                "absolute inset-0 h-full w-full border-0 transition-opacity duration-150",
                id === sessionId
                  ? "visible opacity-100 z-10"
                  : "invisible opacity-0 pointer-events-none z-0",
              )}
            />
          ))}
        </main>
      </div>
    </div>
  );
}
