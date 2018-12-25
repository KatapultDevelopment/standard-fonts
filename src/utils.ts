import * as base64 from 'base64-arraybuffer';
import pako from 'pako';

export const decompressJson = (compressedJson: string): string => {
  const json = String.fromCharCode.apply(
    String,
    pako.inflate(base64.decode(compressedJson)),
  );
  return json;
};
