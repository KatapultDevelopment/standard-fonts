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

// prettier-ignore
const compressedJsonForFontName = {
  'Courier': CourierCompressed,
  'Courier-Bold': CourierBoldCompressed,
  'Courier-Oblique': CourierObliqueCompressed,
  'Courier-BoldOblique': CourierBoldObliqueCompressed,

  'Helvetica': HelveticaCompressed,
  'Helvetica-Bold': HelveticaBoldCompressed,
  'Helvetica-Oblique': HelveticaObliqueCompressed,
  'Helvetica-BoldOblique': HelveticaBoldObliqueCompressed,

  'Times-Roman': TimesRomanCompressed,
  'Times-Bold': TimesBoldCompressed,
  'Times-Italic': TimesItalicCompressed,
  'Times-BoldItalic': TimesBoldItalicCompressed,

  'Symbol': SymbolCompressed,
  'ZapfDingbats': ZapfDingbatsCompressed,
};

export enum FontNames {
  Courier = 'Courier',
  CourierBold = 'Courier-Bold',
  CourierOblique = 'Courier-Oblique',
  CourierBoldOblique = 'Courier-BoldOblique',

  Helvetica = 'Helvetica',
  HelveticaBold = 'HelveticaBold',
  HelveticaOblique = 'Helvetica-Oblique',
  HelveticaBoldOblique = 'Helvetica-BoldOblique',

  TimesRoman = 'Times-Roman',
  TimesRomanBold = 'Times-Bold',
  TimesRomanItalic = 'Times-Italic',
  TimesRomanBoldItalic = 'Times-BoldItalic',

  Symbol = 'Symbol',
  ZapfDingbats = 'ZapfDingbats',
}

export type IFontNames = FontNames | keyof typeof compressedJsonForFontName;

const fontCache: { [name in FontNames]?: Font } = {};

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

export default class Font {
  static readonly Names = FontNames;

  static load = (fontName: IFontNames): Font => {
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
