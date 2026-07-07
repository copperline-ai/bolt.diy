"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { TerminalPanel } from "@/components/workbench/terminal-panel";
import { PreviewPanel } from "@/components/workbench/preview-panel";

export default function ProjectPage() {
  const { projectId } = useParams();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Project: {projectId}</h1>
        <button
          onClick={async () => {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/sandbox`, {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ projectId }),
            });
          }}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          Start Sandbox
        </button>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-4">
        <TerminalPanel projectId={projectId as string} />
        <PreviewPanel projectId={projectId as string} onPreviewUrl={setPreviewUrl} previewUrl={previewUrl} />
      </div>
    </div>
  );
}
