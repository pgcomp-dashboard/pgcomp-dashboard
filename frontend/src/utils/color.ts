/**
 * Returns a consistent hex color from a given name.
 * Uses a simple hash + modulo over a curated palette.
 */
export function colorFromName(name: string): string {
  const PALETTE = [
    // — 900 shades (17)
    '#B71C1C', // red 900
    '#880E4F', // pink 900
    '#4A148C', // purple 900
    '#311B92', // deep-purple 900
    '#1A237E', // indigo 900
    '#0D47A1', // blue 900
    '#01579B', // light-blue 900
    '#006064', // cyan 900
    '#004D40', // teal 900
    '#1B5E20', // green 900
    '#33691E', // light-green 900
    '#827717', // lime 900
    '#E65100', // orange 900
    '#BF360C', // deep-orange 900
    '#3E2723', // brown 900
    '#212121', // grey 900
    '#263238', // blue-grey 900

    // — 800 shades (16)
    '#C62828', // red 800
    '#AD1457', // pink 800
    '#6A1B9A', // purple 800
    '#4527A0', // deep-purple 800
    '#283593', // indigo 800
    '#1565C0', // blue 800
    '#0277BD', // light-blue 800
    '#00838F', // cyan 800
    '#00695C', // teal 800
    '#2E7D32', // green 800
    '#558B2F', // light-green 800
    '#EF6C00', // orange 800
    '#D84315', // deep-orange 800
    '#4E342E', // brown 800
    '#424242', // grey 800
    '#37474F', // blue-grey 800

    // — 700 shades with ≥3:1 on white (15)
    '#D32F2F', // red 700
    '#C2185B', // pink 700
    '#7B1FA2', // purple 700
    '#512DA8', // deep-purple 700
    '#303F9F', // indigo 700
    '#1976D2', // blue 700
    '#0288D1', // light-blue 700
    '#0097A7', // cyan 700
    '#00796B', // teal 700
    '#388E3C', // green 700
    '#689F38', // light-green 700
    '#E64A19', // deep-orange 700
    '#5D4037', // brown 700
    '#616161', // grey 700
    '#455A64', // blue-grey 700
  ];

  // 1) djb2 string-to-int hash
  let h = 8700;
  for (let i = 0; i < name.length; i++) {
    h = (h * 33) ^ name.charCodeAt(i);
  }

  // 2) 32-bit unsigned avalanche (Thomas Wang / Jenkin’s mix)
  function avalanche32(x: number) {
    x = (x ^ 61) ^ (x >>> 16);
    x = x + (x << 3);
    x = x ^ (x >>> 4);
    // Math.imul ensures 32-bit multiplication
    x = Math.imul(x, 0x27d4eb2d);
    x = x ^ (x >>> 15);
    return x >>> 0;
  }

  const idx = avalanche32(h) % PALETTE.length;
  return PALETTE[idx];
}
