import * as base64 from 'base64-arraybuffer';
import pako from 'pako';

const arrayToString = (array: Uint8Array) => {
  let str = '';
  for (let i = 0; i < array.length; i++) {
    str += String.fromCharCode(array[i]);
  }
  return str;
};

export const decompressJson = (compressedJson: string): string =>
  arrayToString(pako.inflate(base64.decode(compressedJson)));
