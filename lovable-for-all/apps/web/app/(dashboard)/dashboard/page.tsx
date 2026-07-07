"use client";

import { useSession, authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

async function fetchProjects() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export default function DashboardPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    enabled: !!session,
  });

  if (sessionLoading) {
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
      <div className="flex items-center justify-between">
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

      <div className="rounded-lg border p-4">
        <h2 className="font-semibold">Projects</h2>
        {projectsLoading ? (
          <p className="text-muted-foreground">Loading projects...</p>
        ) : projectsData?.projects?.length ? (
          <ul className="mt-2 space-y-2">
            {projectsData.projects.map((project: any) => (
              <li key={project.id} className="rounded-md border p-3">
                {project.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No projects yet.</p>
        )}
      </div>
    </div>
  );
}
