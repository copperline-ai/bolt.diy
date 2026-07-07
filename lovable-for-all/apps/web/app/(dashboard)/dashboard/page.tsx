"use client";

import { useSession, authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="p-6">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Please sign in to view your dashboard.</p>
        <Link href="/login" className="text-primary underline">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Signed in as {session.user.email}</p>
      </div>

      <button
        onClick={async () => {
          await authClient.signOut();
          window.location.href = "/login";
        }}
        className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
      >
        Sign out
      </button>
    </div>
  );
}
