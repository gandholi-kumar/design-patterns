/**
 * Pure client-side binary ZIP creation and trigger download utilities
 */

export function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function zipStore(files: [string, string][]): Blob {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  const put = (arr: Uint8Array, pos: number, val: number) => {
    arr[pos] = val & 255;
    arr[pos + 1] = (val >>> 8) & 255;
    arr[pos + 2] = (val >>> 16) & 255;
    arr[pos + 3] = (val >>> 24) & 255;
  };

  const crc32 = (data: Uint8Array) => {
    let crc = 0xffffffff;
    for (const byte of data) {
      crc ^= byte;
      for (let k = 0; k < 8; k++) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  };

  for (const [name, body] of files) {
    const n = enc.encode(name);
    const d = enc.encode(body);
    const crc = crc32(d);
    const local = new Uint8Array(30 + n.length + d.length);
    put(local, 0, 0x04034b50);
    local[4] = 20;
    put(local, 14, crc);
    put(local, 18, d.length);
    put(local, 22, d.length);
    local[26] = n.length;
    local.set(n, 30);
    local.set(d, 30 + n.length);
    chunks.push(local);

    const c = new Uint8Array(46 + n.length);
    put(c, 0, 0x02014b50);
    c[4] = 20;
    c[6] = 20;
    put(c, 16, crc);
    put(c, 20, d.length);
    put(c, 24, d.length);
    c[28] = n.length;
    put(c, 42, offset);
    c.set(n, 46);
    central.push(c);
    offset += local.length;
  }

  const start = offset;
  const centralSize = central.reduce((a, x) => a + x.length, 0);
  const end = new Uint8Array(22);
  put(end, 0, 0x06054b50);
  end[8] = files.length;
  end[10] = files.length;
  put(end, 12, centralSize);
  put(end, 16, start);

  const parts = [...chunks, ...central, end].map(
    (part) => new Uint8Array(part).buffer as ArrayBuffer
  );
  return new Blob(parts, { type: 'application/zip' });
}
