"use client";

import { useEffect, useState } from "react";

type Platform = "ios" | "android" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "unknown";
}

// TODO: Replace with actual APK URL after EAS build
const APK_DOWNLOAD_URL = "#apk-download";

export function DownloadCTA() {
  const [platform, setPlatform] = useState<Platform>("unknown");

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  return (
    <section id="download" className="px-6 py-20">
      <div className="mx-auto max-w-2xl rounded-2xl border border-weva-border bg-weva-surface p-8 text-center sm:p-12">
        <h2 className="mb-4 text-3xl font-bold">Scarica Weva</h2>
        <p className="mb-8 text-weva-text-secondary">
          Scarica direttamente dal browser. Gratuita, senza abbonamenti.
        </p>

        <a
          href={APK_DOWNLOAD_URL}
          download
          className="inline-flex items-center gap-3 rounded-xl bg-weva-primary px-8 py-4 text-lg font-semibold text-white transition hover:bg-weva-primary-dark"
        >
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <div className="text-left">
            <div className="text-xs opacity-70">Download diretto</div>
            <div>Scarica APK (Android)</div>
          </div>
        </a>

        {platform === "ios" && (
          <p className="mt-6 text-sm text-weva-text-secondary">
            Stai usando un iPhone? Al momento Weva e' disponibile solo per Android.
            <br />
            La versione iOS arrivera' presto.
          </p>
        )}

        {platform === "android" && (
          <p className="mt-6 text-sm text-weva-primary">
            Rilevato Android — clicca per scaricare e installare direttamente.
          </p>
        )}

        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-weva-text-secondary">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Privacy totale
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Gratuita
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI on-device
          </span>
        </div>
      </div>
    </section>
  );
}
