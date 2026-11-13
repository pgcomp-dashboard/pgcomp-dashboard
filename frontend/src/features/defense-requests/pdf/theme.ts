import { minimalTheme } from "@/lib/pdf-themes/minimal";
import type { PdfcnTheme } from "@/types/pdf-themes";

/** Tema dos PDFs da banca: o "minimal" da pdfcn, com títulos em Helvetica e seções mais juntas. */
export const pgcompPdfTheme: PdfcnTheme = {
  ...minimalTheme,
  name: "pgcomp",
  spacing: { ...minimalTheme.spacing, sectionGap: 18, paragraphGap: 8 },
  typography: {
    ...minimalTheme.typography,
    heading: { ...minimalTheme.typography.heading, fontFamily: "Helvetica" },
  },
};
