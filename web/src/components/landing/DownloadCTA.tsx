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

// TODO: Replace with actual URLs after EAS build / store submission
const DOWNLOAD_URLS = {
  android: "#android-download",
  ios: "#ios-download",
};

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
          Disponibile per iOS e Android. Gratuita, senza abbonamenti.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {/* iOS Button */}
          <a
            href={DOWNLOAD_URLS.ios}
            className={`inline-flex items-center gap-3 rounded-xl px-6 py-4 text-lg font-semibold transition ${
              platform === "ios"
                ? "bg-weva-primary text-white hover:bg-weva-primary-dark"
                : "border border-weva-border bg-weva-bg text-weva-text hover:border-weva-primary/40"
            }`}
          >
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div className="text-left">
              <div className="text-xs opacity-70">Scarica su</div>
              <div>App Store</div>
            </div>
          </a>

          {/* Android Button */}
          <a
            href={DOWNLOAD_URLS.android}
            className={`inline-flex items-center gap-3 rounded-xl px-6 py-4 text-lg font-semibold transition ${
              platform === "android"
                ? "bg-weva-primary text-white hover:bg-weva-primary-dark"
                : "border border-weva-border bg-weva-bg text-weva-text hover:border-weva-primary/40"
            }`}
          >
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.27-.86-.31-.16-.69-.04-.86.27l-1.87 3.23C14.89 8.35 13.49 8 12 8s-2.89.35-4.44.94L5.69 5.71c-.16-.31-.54-.43-.86-.27-.31.16-.43.55-.27.86L6.4 9.48C3.3 11.25 1.28 14.44 1 18h22c-.28-3.56-2.3-6.75-5.4-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
            </svg>
            <div className="text-left">
              <div className="text-xs opacity-70">Scarica su</div>
              <div>Google Play</div>
            </div>
          </a>
        </div>

        {platform !== "unknown" && (
          <p className="mt-6 text-sm text-weva-primary">
            {platform === "ios"
              ? "Rilevato iPhone — il download iOS e' in evidenza"
              : "Rilevato Android — il download Android e' in evidenza"}
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
