/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Generate SVG Icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.4" />
    </filter>
  </defs>
  <!-- Background with rounded squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  
  <!-- Subtle Grid Lines (Gridline theme) -->
  <g stroke="rgba(255, 255, 255, 0.07)" stroke-width="2">
    <line x1="128" y1="40" x2="128" y2="472" />
    <line x1="256" y1="40" x2="256" y2="472" />
    <line x1="384" y1="40" x2="384" y2="472" />
    <line x1="40" y1="128" x2="472" y2="128" />
    <line x1="40" y1="256" x2="472" y2="256" />
    <line x1="40" y1="384" x2="472" y2="384" />
  </g>
  
  <!-- Outer glowing accent ring -->
  <rect x="48" y="48" width="416" height="416" rx="88" fill="none" stroke="url(#cyanGrad)" stroke-width="4" stroke-opacity="0.35" />

  <!-- Center Symbol: Stylized Tool / Field Service Emblem -->
  <g filter="url(#shadow)" transform="translate(136, 136) scale(10)">
    <path
      d="M14.7 10.7 L19.7 15.7 A1.4 1.4 0 0 1 17.7 17.7 L12.7 12.7"
      stroke="url(#cyanGrad)"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
    <path
      d="M14.7 10.7 A4 4 0 0 0 11.2 5 A4 4 0 0 0 6.7 6.5 L9.3 9.1 A1 1 0 0 1 9.3 10.5 L7.9 11.9 A1 1 0 0 1 6.5 11.9 L3.9 9.3 A4 4 0 0 0 5.4 13.8 A4 4 0 0 0 11.1 14.8"
      stroke="#38bdf8"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
  </g>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);
console.log('Generated public/icons/icon.svg');

// 2. Generate valid PNG icons (192x192, 512x512, apple-touch-icon 180x180)
const crc32 = (buf) => {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
};

function generatePng(size) {
  const width = size;
  const height = size;
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // RGB
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrCrc = Buffer.alloc(4);
  ihdrCrc.writeUInt32BE(crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData])), 0);
  const ihdrChunk = Buffer.concat([Buffer.from([0, 0, 0, 13]), Buffer.from('IHDR'), ihdrData, ihdrCrc]);

  const rawData = Buffer.alloc((width * 3 + 1) * height);
  const center = size / 2;
  const radius = size * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 3 + 1);
    rawData[rowOffset] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const pOffset = rowOffset + 1 + x * 3;
      const dx = Math.abs(x - center);
      const dy = Math.abs(y - center);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Squircle background (#0f172a to #1e293b)
      if (dist <= radius) {
        // Gradient from top-left to bottom-right
        const factor = (x + y) / (size * 2);
        let r = Math.round(15 + factor * 15);
        let g = Math.round(23 + factor * 20);
        let b = Math.round(42 + factor * 30);

        // Center tool emblem highlight in cyan (#38bdf8)
        if (Math.abs(x - y) < size * 0.08 && dist < radius * 0.55 && dist > radius * 0.12) {
          r = 56;
          g = 189;
          b = 248;
        } else if (dist < radius * 0.22 && dist > radius * 0.08) {
          r = 37;
          g = 99;
          b = 235;
        }

        rawData[pOffset] = r;
        rawData[pOffset + 1] = g;
        rawData[pOffset + 2] = b;
      } else {
        // Deep background
        rawData[pOffset] = 15;
        rawData[pOffset + 1] = 23;
        rawData[pOffset + 2] = 42;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatLen = Buffer.alloc(4);
  idatLen.writeUInt32BE(compressed.length, 0);
  const idatCrc = Buffer.alloc(4);
  idatCrc.writeUInt32BE(crc32(Buffer.concat([Buffer.from('IDAT'), compressed])), 0);
  const idatChunk = Buffer.concat([idatLen, Buffer.from('IDAT'), compressed, idatCrc]);

  const iendChunk = Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);
  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), generatePng(192));
console.log('Generated public/icons/icon-192.png');

fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), generatePng(512));
console.log('Generated public/icons/icon-512.png');

fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), generatePng(180));
console.log('Generated public/icons/apple-touch-icon.png');
