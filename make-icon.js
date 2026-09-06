import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, r, g, b, a) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdrChunk = createChunk('IHDR', ihdrData);

  const rawRowLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * rawRowLength);
  for (let y = 0; y < height; y++) {
    const rowStart = y * rawRowLength;
    rawData[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const pxStart = rowStart + 1 + x * 4;
      rawData[pxStart] = r;
      rawData[pxStart + 1] = g;
      rawData[pxStart + 2] = b;
      rawData[pxStart + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4);
  data.copy(buf, 8);

  const crcVal = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crcVal >>> 0, 8 + len);
  return buf;
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

// Terracotta color #DA7756
const pngBuf = createPng(512, 512, 218, 119, 86, 255);
fs.writeFileSync('app-icon.png', pngBuf);
console.log('Created app-icon.png successfully');
