"use client";

import { useEffect } from "react";

interface PreviewPanelProps {
  projectId: string;
  previewUrl: string | null;
  onPreviewUrl: (url: string) => void;
}

export function PreviewPanel({ projectId, previewUrl, onPreviewUrl }: PreviewPanelProps) {
  useEffect(() => {
    const fetchPreview = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/sandbox/preview`,
        { credentials: "include" },
      );

      if (!res.ok) return;

      const data = await res.json();
      onPreviewUrl(data.previewUrl);
    };

    fetchPreview();
  }, [projectId, onPreviewUrl]);

  return (
    <div className="flex flex-col rounded-lg border">
      <div className="border-b px-3 py-2 text-sm font-medium">Preview</div>
      <div className="flex-1 bg-muted">
        {previewUrl ? (
          <iframe src={previewUrl} className="h-full w-full border-0" title="Preview" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Start a sandbox to see a preview
          </div>
        )}
      </div>
    </div>
  );
}
