import type { PdfcnTheme } from "@/types/pdf-themes";

import { defaultPrimitives } from "./primitives";

/**
 * Minimal theme preset.
 *
 * Character: Courier headings, zinc neutrals, maximum whitespace.
 * shadcn-inspired restrained palette. Ideal for clean documentation,
 * technical specs, and literary manuscripts.
 */
export const minimalTheme: PdfcnTheme = {
  colors: {
    accent: "#71717a",
    background: "#ffffff",
    border: "#e4e4e7",
    destructive: "#b91c1c",
    foreground: "#18181b",
    info: "#0369a1",
    muted: "#fafafa",
    mutedForeground: "#a1a1aa",
    primary: "#18181b",
    primaryForeground: "#ffffff",
    success: "#15803d",
    warning: "#a16207",
  },
  name: "minimal",
  page: {
    orientation: "portrait",
    size: "A4",
  },
  primitives: defaultPrimitives,
  spacing: {
    componentGap: 18,
    page: {
      marginBottom: 72,
      marginLeft: 56,
      marginRight: 56,
      marginTop: 72,
    },
    paragraphGap: 14,
    sectionGap: 36,
  },
  typography: {
    body: {
      fontFamily: "Helvetica",
      fontSize: 11,
      lineHeight: 1.65,
    },
    heading: {
      fontFamily: "Courier",
      fontSize: {
        h1: 24,
        h2: 20,
        h3: 16,
        h4: 14,
        h5: 12,
        h6: 10,
      },
      fontWeight: 600,
      lineHeight: 1.25,
    },
  },
};
