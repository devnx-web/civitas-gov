"use client";

import { QRCodeSVG } from "qrcode.react";

export function QrCodeAssinatura({ url }: { url: string }) {
  return (
    <div className="rounded-lg border border-ink-200 p-3 bg-white">
      <QRCodeSVG value={url} size={160} level="M" />
    </div>
  );
}
