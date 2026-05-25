import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Briefcase, FileText, Plus } from "lucide-react";
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
  { id: "study", name: "Study Material", icon: BookOpen, src: "https://udify.app/chatbot/9LyhwWFYwMVl2Fp1" },
  { id: "work", name: "Work Docs", icon: Briefcase, src: "https://udify.app/chatbot/2h7iEzcu9oMUfoYE" },
  { id: "project", name: "Project Specs", icon: FileText, src: "https://udify.app/chatbot/FjGPVGUb0TWjY9W5" },
];

function Index() {
  const [active, setActive] = useState(collections[0].id);
  const activeCollection = collections.find((c) => c.id === active) ?? collections[0];

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

        <main className="flex-1">
          <iframe
            key={activeCollection.id}
            src={activeCollection.src}
            style={{ width: "100%", height: "100%", minHeight: 700 }}
            frameBorder={0}
            allow="microphone"
            title={`${activeCollection.name} Chat`}
          />
        </main>
      </div>
    </div>
  );
}
