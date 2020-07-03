import { decompressJson } from './utils';

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
  HelveticaBold = 'Helvetica-Bold',
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

export interface ICharMetrics {
  /** Decimal value of default character code (-1 if not encoded) */
  // C: number;
  /** Width of character */
  WX: number;
  /** Character name (aka Glyph name) */
  N: string;
  /**
   * [llx lly urx ury]:
   *   Character bounding box where llx, lly, urx, and ury are all numbers.
   */
  B: [number, number, number, number];
  /**
   * Array<[successor ligature]>:
   *   Ligature sequence where successor and ligature are both character names.
   *   The current character may join with the character named successor to form
   *   the character named ligature.
   */
  // L: Array<[string, string]>;
}

/**
 * [name_1 name_2 number_x]:
 *   Name of the first character in the kerning pair followed by the name of the
 *   second character followed by the kerning amount in the x direction
 *   (y is zero). The kerning amount is specified in the units of the character
 *   coordinate system.
 */
export type IKernPair = [string, string, number];

/**
 * A glyph's bounding box, i.e. the rectangle that encloses the glyph
 * outline as tightly as possible.
 */
export interface IBoundingBox {
  x: number /** The minimum X position in the bounding box */;
  y: number /** The minimum Y position in the bounding box */;
  width: number /** The width of the bounding box */;
  height: number /** The height of the bounding box */;
}

export class Font {
  static load = (fontName: IFontNames): Font => {
    const cachedFont = fontCache[fontName];
    if (cachedFont) return cachedFont;

    const json = decompressJson(compressedJsonForFontName[fontName]);
    const font: Font = Object.assign(new Font(), JSON.parse(json));

    font.CharWidths = font.CharMetrics.reduce((acc, metric) => {
      acc[metric.N] = metric.WX;
      return acc;
    }, {});

    font.BoundingBoxes = font.CharMetrics.reduce((acc, metric) => {
      const [llx, lly, urx, ury] = metric.B;
      const rect = { x: llx, y: lly, width: urx - llx, height: ury - lly };
      acc[metric.N] = rect;
      return acc;
    }, {});

    font.KernPairXAmounts = font.KernPairs.reduce(
      (acc, [name1, name2, width]) => {
        if (!acc[name1]) acc[name1] = {};
        acc[name1][name2] = width;
        return acc;
      },
      {},
    );

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

  /**
   * [llx lly urx ury]:
   *   Font bounding box where llx, lly, urx, and ury are all numbers.
   */
  FontBBox: [number, number, number, number];

  CharMetrics: ICharMetrics[];
  KernPairs: IKernPair[];

  private CharWidths: { [charName: string]: number };
  private BoundingBoxes: { [charName: string]: IBoundingBox };
  private KernPairXAmounts: { [name1: string]: { [name2: string]: number } };

  private constructor() {}

  getWidthOfGlyph = (glyphName: string): number | undefined =>
    this.CharWidths[glyphName];

  getBoundingBoxOfGlyph = (glyphName: string): IBoundingBox | undefined =>
    this.BoundingBoxes[glyphName];

  getXAxisKerningForPair = (
    leftGlyphName: string,
    rightGlyphName: string,
  ): number | void =>
    (this.KernPairXAmounts[leftGlyphName] || {})[rightGlyphName];
}
