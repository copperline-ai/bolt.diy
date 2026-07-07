"use client";

import { authClient } from "@/lib/auth-client";
import { Github } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 rounded-lg border p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Welcome to Hatchery Studio</h1>
          <p className="text-muted-foreground">Sign in to start building.</p>
        </div>
        <button
          onClick={async () => {
            await authClient.signIn.social({ provider: "github" });
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Github className="h-5 w-5" />
          Continue with GitHub
        </button>
      </div>
    </main>
  );
}
