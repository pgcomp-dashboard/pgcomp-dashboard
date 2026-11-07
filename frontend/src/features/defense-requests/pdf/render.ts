import type { ReactElement } from "react";

/*
 * PDF no navegador com Forme (motor WASM, ~20 MB): carregado só no primeiro export.
 * Usa o build `pkg-web` (init explícito pela URL do .wasm) para o Vite não precisar de
 * plugin de WASM; o build "bundler" importa o .wasm como módulo ES.
 */
let engine: Promise<{
  renderPdf: (json: string) => Uint8Array;
  serialize: (el: ReactElement) => unknown;
}> | null = null;

function loadEngine() {
  engine ??= (async () => {
    const [wasm, wasmUrl, react] = await Promise.all([
      import("@formepdf/core/pkg-web/forme.js"),
      import("@formepdf/core/pkg-web/forme_bg.wasm?url"),
      import("@formepdf/react"),
    ]);
    await wasm.default({ module_or_path: wasmUrl.default });
    return {
      renderPdf: wasm.render_pdf,
      serialize: react.serialize as (el: ReactElement) => unknown,
    };
  })().catch((error) => {
    engine = null; // deixa tentar de novo
    throw error;
  });
  return engine;
}

export async function renderPdf(document: ReactElement): Promise<Blob> {
  const { renderPdf, serialize } = await loadEngine();
  const bytes = renderPdf(JSON.stringify(serialize(document)));
  return new Blob([bytes.slice().buffer], { type: "application/pdf" });
}

export async function downloadPdf(document: ReactElement, filename: string) {
  const url = URL.createObjectURL(await renderPdf(document));
  const link = Object.assign(window.document.createElement("a"), {
    href: url,
    download: filename,
  });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** "Qualificação de Mestrado - Fulano.pdf" sem caracteres que atrapalham o sistema de arquivos. */
export const pdfFilename = (...parts: string[]) =>
  `${parts
    .filter(Boolean)
    .join(" - ")
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()}.pdf`;
