/* tslint:disable max-classes-per-file */
import { decompressJson } from './utils';

import AllEncodingsCompressed from './all-encodings.compressed.json';

const decompressedEncodings = decompressJson(AllEncodingsCompressed);

type EncodingCharCode = number;
type EncodingCharName = string;
interface UnicodeMappings {
  [unicodeCodePoint: number]: [EncodingCharCode, EncodingCharName];
}

const allUnicodeMappings: {
  symbol: UnicodeMappings;
  zapfdingbats: UnicodeMappings;
  win1252: UnicodeMappings;
} = JSON.parse(decompressedEncodings);

type EncodingNames = 'Symbol' | 'ZapfDingbats' | 'WinAnsi';

class EncodingClass {
  name: EncodingNames;
  supportedCodePoints: number[];
  private unicodeMappings: UnicodeMappings;

  constructor(name: EncodingNames, unicodeMappings: UnicodeMappings) {
    this.name = name;
    this.supportedCodePoints = Object.keys(unicodeMappings)
      .map(Number)
      .sort((a, b) => a - b);
    this.unicodeMappings = unicodeMappings;
  }

  canEncodeUnicodeCodePoint = (codePoint: number) =>
    codePoint in this.unicodeMappings;

  encodeUnicodeCodePoint = (codePoint: number) => {
    const mapped = this.unicodeMappings[codePoint];
    if (!mapped) {
      const str = String.fromCharCode(codePoint);
      const msg = `${this.name} cannot encode "${str}"`;
      throw new Error(msg);
    }
    return { code: mapped[0], name: mapped[1] };
  };
}

export type Encoding = EncodingClass;

export const Encodings = {
  Symbol: new EncodingClass('Symbol', allUnicodeMappings.symbol),
  ZapfDingbats: new EncodingClass(
    'ZapfDingbats',
    allUnicodeMappings.zapfdingbats,
  ),
  WinAnsi: new EncodingClass('WinAnsi', allUnicodeMappings.win1252),
};
