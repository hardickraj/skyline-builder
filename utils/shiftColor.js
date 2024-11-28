function shiftColor(hex, degree, darkenFactor = 0, saturationFactor = 0) {
  const hsl = hexToHsl(hex);

  // Shift the hue
  hsl.h = (hsl.h + degree) % 360;

  // Darken by reducing the lightness
  hsl.l = Math.max(0.3, Math.min(1, hsl.l - darkenFactor)); // Ensure lightness stays between 0 and 1

  // Adjust saturation
  hsl.s = Math.max(0.3, Math.min(0.7, hsl.s + saturationFactor)); // Ensure saturation stays between 0 and 1

  return hslToHex(hsl);
}

// Function to convert hex to HSL
function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const h =
    d === 0
      ? 0
      : max === r
      ? ((g - b) / d + (g < b ? 6 : 0)) * 60
      : max === g
      ? ((b - r) / d + 2) * 60
      : ((r - g) / d + 4) * 60;

  return { h: Math.round(h), s: s, l: l };
}

// Function to convert HSL back to hex
function hslToHex({ h, s, l }) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r, g, b;
  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (value) =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default shiftColor;
