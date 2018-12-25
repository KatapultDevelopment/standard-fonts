import { decompressJson } from './utils';

import AllEncodingsCompressed from './all-encodings.compressed.json';

const decompressedEncodings = decompressJson(AllEncodingsCompressed);

type EncodingCharCode = number;
type EncodingCharName = string;
interface IUnicodeMappings {
  [unicodeCodePoint: number]: [EncodingCharCode, EncodingCharName];
}

const allUnicodeMappings: {
  symbol: IUnicodeMappings;
  zapfdingbats: IUnicodeMappings;
  win1252: IUnicodeMappings;
} = JSON.parse(decompressedEncodings);

export type EncodingNames = 'Symbol' | 'ZapfDingbats' | 'WinAnsi';

export class Encoding {
  static Symbol = new Encoding('Symbol', allUnicodeMappings.symbol);
  static ZapfDingbats = new Encoding(
    'ZapfDingbats',
    allUnicodeMappings.zapfdingbats,
  );
  static WinAnsi = new Encoding('WinAnsi', allUnicodeMappings.win1252);

  name: EncodingNames;
  private unicodeMappings: IUnicodeMappings;

  private constructor(name: EncodingNames, unicodeMappings: IUnicodeMappings) {
    this.name = name;
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
