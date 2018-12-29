import * as base64 from 'base64-arraybuffer';
import pako from 'pako';

const arrayToString = (array: Uint8Array) =>
  array.reduce((data, byte) => data + String.fromCharCode(byte), '');

export const decompressJson = (compressedJson: string): string =>
  arrayToString(pako.inflate(base64.decode(compressedJson)));
