"use client";

import {useIsPresentationTool} from "next-sanity/hooks";

export function DisableDraftMode() {
  const isPresentationTool = useIsPresentationTool();
  if (isPresentationTool) return null;

  return (
    <a
      href="/api/draft-mode/disable"
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 1000,
        borderRadius: 999,
        padding: "10px 16px",
        color: "#fcf7ee",
        background: "#08522b",
        fontSize: 14,
        fontWeight: 700,
        textDecoration: "none",
        boxShadow: "0 3px 12px rgb(0 0 0 / 18%)",
      }}
    >
      Vorschau beenden
    </a>
  );
}
