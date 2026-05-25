import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "My Doc Expert — Ask questions about your documents" },
      { name: "description", content: "Chat with your document collections. Ask questions and get instant answers from My Doc Expert." },
    ],
  }),
});

const collections = [
  { id: "general", name: "General Knowledge", icon: FolderOpen },
  { id: "research", name: "Research Papers", icon: FileText },
  { id: "contracts", name: "Contracts", icon: FileText },
  { id: "manuals", name: "Product Manuals", icon: FileText },
];

function Index() {
  const [active, setActive] = useState(collections[0].id);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-8 py-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">My Doc Expert</h1>
          <p className="text-sm text-muted-foreground">Ask questions about your documents.</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-border p-4 md:block">
          <div className="mb-3 flex items-center justify-between px-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Collections
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="New collection">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex flex-col gap-1">
            {collections.map((c) => {
              const Icon = c.icon;
              const isActive = active === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
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

        <main className="flex flex-1 items-center justify-center p-8">
          <div className="flex h-full min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <h2 className="text-lg font-medium">Chat window</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Embed your chat interface here. Selected collection:{" "}
              <span className="font-medium text-foreground">
                {collections.find((c) => c.id === active)?.name}
              </span>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
