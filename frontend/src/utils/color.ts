/**
 * Returns a consistent hex color from a given name.
 * For known Qualis (A1–C), returns specific predefined colors.
 * Otherwise, uses a simple hash + modulo over a curated palette.
 */
export function colorFromName(name: string): string {
  const QUALIS_COLORS: Record<string, string> = {
    A1: '#003f5c', // Azul escuro profundo
    A2: '#2f4b7c', // Azul médio
    A3: '#665191', // Roxo
    A4: '#a05195', // Magenta
    B1: '#d45087', // Rosa escuro
    B2: '#f95d6a', // Coral
    B3: '#ff7c43', // Laranja vibrante
    B4: '#ffa600', // Amarelo forte
    '-': '#ffcc00', // Amarelo-limão
  };

  // Prioridade: se for Qualis conhecido, retorna cor específica
  if (name in QUALIS_COLORS) {
    return QUALIS_COLORS[name];
  }

  const PALETTE = [
    // — 900 shades (17)
    '#B71C1C', '#880E4F', '#4A148C', '#311B92', '#1A237E', '#0D47A1', '#01579B',
    '#006064', '#004D40', '#1B5E20', '#33691E', '#827717', '#E65100', '#BF360C',
    '#3E2723', '#212121', '#263238',
    // — 800 shades (16)
    '#C62828', '#AD1457', '#6A1B9A', '#4527A0', '#283593', '#1565C0', '#0277BD',
    '#00838F', '#00695C', '#2E7D32', '#558B2F', '#EF6C00', '#D84315', '#4E342E',
    '#424242', '#37474F',
    // — 700 shades with ≥3:1 on white (15)
    '#D32F2F', '#C2185B', '#7B1FA2', '#512DA8', '#303F9F', '#1976D2', '#0288D1',
    '#0097A7', '#00796B', '#388E3C', '#689F38', '#E64A19', '#5D4037', '#616161',
    '#455A64',
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
    x = Math.imul(x, 0x27d4eb2d);
    x = x ^ (x >>> 15);
    return x >>> 0;
  }

  const idx = avalanche32(h) % PALETTE.length;
  return PALETTE[idx];
}
