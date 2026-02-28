"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, FileJson, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getShareRecord, type ShareRecord } from "@/lib/storage";

export default function SharePage() {
  const params = useParams<{ id: string }>();
  const [record, setRecord] = useState<ShareRecord | null>(null);
  const [ready, setReady] = useState(false);

  const shareId = useMemo(() => {
    const raw = params?.id;
    if (!raw) return "";
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  useEffect(() => {
    if (!shareId) return;
    setRecord(getShareRecord(shareId));
    setReady(true);
  }, [shareId]);

  const onCopyJson = async () => {
    if (!record) return;
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(
          {
            summary: record.output.summary,
            styleText: record.output.styleText,
            actionText: record.output.actionText,
            motionSpec: record.output.motionSpec,
          },
          null,
          2,
        ),
      );
      toast.success("Shared spec copied.");
    } catch {
      toast.error("Clipboard unavailable.");
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button asChild variant="secondary" size="sm">
          <Link href="/#demo">
            <ArrowLeft className="h-4 w-4" />
            back to demo
          </Link>
        </Button>
        <Badge variant="neon">
          <Share2 className="h-3.5 w-3.5" />
          share snapshot
        </Badge>
      </div>

      <Card className="rounded-[2rem] p-5 sm:p-7 md:p-8">
        {!ready ? (
          <div className="grid gap-3">
            <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-64 animate-pulse rounded bg-white/10" />
            <div className="h-48 animate-pulse rounded-2xl bg-white/10" />
          </div>
        ) : record ? (
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-white/60">shared generation</p>
              <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{record.output.actionText}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">{record.output.summary}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge>{record.output.motionSpec.engine}</Badge>
              <Badge>{record.output.motionSpec.export.retargeting}</Badge>
              <Badge variant="cyan">{record.output.motionSpec.confidence_score}% confidence</Badge>
              {record.output.motionSpec.quality_checks.slice(0, 4).map((item) => (
                <Badge key={item}>{item.replaceAll("_", " ")}</Badge>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.16em] text-white/55">motion spec JSON</p>
              <Button variant="secondary" size="sm" onClick={onCopyJson}>
                <Copy className="h-3.5 w-3.5" />
                copy JSON
              </Button>
            </div>

            <pre className="max-h-[420px] overflow-auto rounded-2xl border border-white/10 bg-black/40 p-3 font-mono text-xs leading-relaxed text-[#cde8ff] sm:p-4 sm:text-sm">
              {JSON.stringify(record.output.motionSpec, null, 2)}
            </pre>

            <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-xs text-white/60">
              <span className="inline-flex items-center gap-2">
                <FileJson className="h-3.5 w-3.5" />
                Local-only share: this link works on the device/browser where it was created.
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">Share not available on this device</h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/70">
              This link was created in local demo mode and stored in browser localStorage. It may have been created on
              another device or browser profile.
            </p>
            <Button asChild>
              <Link href="/#demo">return to demo</Link>
            </Button>
          </div>
        )}
      </Card>
    </main>
  );
}
