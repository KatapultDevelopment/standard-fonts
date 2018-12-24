import * as base64 from 'base64-arraybuffer';
import pako from 'pako';

import CourierBoldCompressed from './Courier-Bold.compressed.json';
import CourierBoldObliqueCompressed from './Courier-BoldOblique.compressed.json';
import CourierObliqueCompressed from './Courier-Oblique.compressed.json';
import CourierCompressed from './Courier.compressed.json';

import HelveticaBoldCompressed from './Helvetica-Bold.compressed.json';
import HelveticaBoldObliqueCompressed from './Helvetica-BoldOblique.compressed.json';
import HelveticaObliqueCompressed from './Helvetica-Oblique.compressed.json';
import HelveticaCompressed from './Helvetica.compressed.json';

import TimesBoldCompressed from './Times-Bold.compressed.json';
import TimesBoldItalicCompressed from './Times-BoldItalic.compressed.json';
import TimesItalicCompressed from './Times-Italic.compressed.json';
import TimesRomanCompressed from './Times-Roman.compressed.json';

import SymbolCompressed from './Symbol.compressed.json';
import ZapfDingbatsCompressed from './ZapfDingbats.compressed.json';

const compressedJsonForFontName = {
  'Courier-Bold': CourierBoldCompressed,
  'Courier-BoldOblique': CourierBoldObliqueCompressed,
  'Courier-Oblique': CourierObliqueCompressed,
  Courier: CourierCompressed,

  'Helvetica-Bold': HelveticaBoldCompressed,
  'Helvetica-BoldOblique': HelveticaBoldObliqueCompressed,
  'Helvetica-Oblique': HelveticaObliqueCompressed,
  Helvetica: HelveticaCompressed,

  'Times-Bold': TimesBoldCompressed,
  'Times-BoldItalic': TimesBoldItalicCompressed,
  'Times-Italic': TimesItalicCompressed,
  'Times-Roman': TimesRomanCompressed,

  Symbol: SymbolCompressed,

  ZapfDingbats: ZapfDingbatsCompressed,
};

// prettier-ignore
const fontCache: {
  'Courier-Bold'?: Font;
  'Courier-BoldOblique'?: Font;
  'Courier-Oblique'?: Font;
  'Courier'?: Font;

  'Helvetica-Bold'?: Font;
  'Helvetica-BoldOblique'?: Font;
  'Helvetica-Oblique'?: Font;
  'Helvetica'?: Font;

  'Times-Bold'?: Font;
  'Times-BoldItalic'?: Font;
  'Times-Italic'?: Font;
  'Times-Roman'?: Font;

  'Symbol'?: Font;

  'ZapfDingbats'?: Font;
} = {};

const decompressJson = (compressedJson: string) => {
  const json = String.fromCharCode.apply(
    String,
    pako.inflate(base64.decode(compressedJson)),
  );
  return json;
};

export interface ICharMetrics {
  C: number;
  WX: number;
  N: string;
  B: [number, number, number, number];
  L: Array<[string, string]>;
}

export type IKernPair = [string, string, number];

class Font {
  static load = (fontName: keyof typeof fontCache): Font => {
    const cachedFont = fontCache[fontName];
    if (cachedFont) return cachedFont;

    const json = decompressJson(compressedJsonForFontName[fontName]);
    const font = Object.assign(new Font(), JSON.parse(json));
    fontCache[fontName] = font;

    return font;
  };

  Comment: string;
  FontName: string;
  FullName: string;
  FamilyName: string;
  Weight: string;
  CharacterSet: string;
  Version: string;
  Notice: string;
  EncodingScheme: string;
  ItalicAngle: number;
  UnderlinePosition: number;
  UnderlineThickness: number;
  CapHeight: number | void;
  XHeight: number | void;
  Ascender: number | void;
  Descender: number | void;
  StdHW: number;
  StdVW: number;
  IsFixedPitch: boolean;
  FontBBox: [number, number, number, number];

  CharMetrics: ICharMetrics[];
  KernPairs: IKernPair[];

  private constructor() {}
}
