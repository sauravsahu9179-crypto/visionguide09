import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const message = error?.message ?? "";
  const isSsr =
    /ssr|hydrat|server|HTTPError|unhandled|chunk/i.test(message) ||
    /ssr|hydrat|server/i.test(error?.stack ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm px-4">
      <div
        role="alertdialog"
        aria-labelledby="app-error-title"
        aria-describedby="app-error-desc"
        className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <div className="min-w-0 flex-1">
            <h1 id="app-error-title" className="text-base font-semibold text-foreground">
              {isSsr ? "Page rendering failed" : "Something went wrong"}
            </h1>
            <p id="app-error-desc" className="mt-1 text-sm text-muted-foreground">
              {isSsr
                ? "We hit a server-side rendering error while preparing this page. This is usually temporary — refreshing reloads the latest build and clears stale chunks."
                : "An unexpected error occurred. You can refresh, retry, or head back home."}
            </p>
            {message ? (
              <pre className="mt-3 max-h-32 overflow-auto rounded-md border border-border bg-muted/50 p-2 text-xs text-muted-foreground whitespace-pre-wrap break-words">
                {message}
              </pre>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") window.location.reload();
                }}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Refresh page
              </button>
              <button
                onClick={() => {
                  router.invalidate();
                  reset();
                }}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Try again
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Ask questions about AI Image and Video Generation." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Ask questions about AI Image and Video Generation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Lovable App" },
      { name: "twitter:description", content: "Ask questions about AI Image and Video Generation." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7977c373-efcf-4560-b5ff-027756ffb196/id-preview-1f886397--c9804bd9-66df-40d2-9a5b-1e7cd431a8ab.lovable.app-1779699616999.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7977c373-efcf-4560-b5ff-027756ffb196/id-preview-1f886397--c9804bd9-66df-40d2-9a5b-1e7cd431a8ab.lovable.app-1779699616999.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
