/**
 * Returns a consistent hex color from a given name.
 * Uses a simple hash + modulo over a curated palette.
 */
export function colorFromName(name: string): string {
  // A palette of visually‑distinct, Material‑inspired colors
  const PALETTE = [
    '#D32F2F', // red
    //'#C2185B', // pink
    '#7B1FA2', // purple
    //'#512DA8', // deep purple
    '#303F9F', // indigo
    '#1976D2', // blue
    //'#0288D1', // light blue
    //'#0097A7', // teal
    '#00796B', // green
    //'#388E3C', // light green
    '#689F38', // lime
    //'#AFB42B', // yellow‑green
    '#FBC02D', // yellow
    //'#FFA000', // amber
    '#F57C00', // orange
    '#E64A19', // deep orange
    '#5D4037', // brown
    //'#616161', // grey
    '#455A64', // blue grey
  ];

  // djb2 string-to-int hash
  let hash = 5381;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 33) ^ name.charCodeAt(i);
  }

  // Ensure positive and map into palette
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}
