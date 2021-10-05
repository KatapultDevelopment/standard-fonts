import { decompressJson } from './utils.js';
import CourierBoldCompressed from './Courier-Bold.compressed.js';
import CourierBoldObliqueCompressed from './Courier-BoldOblique.compressed.js';
import CourierObliqueCompressed from './Courier-Oblique.compressed.js';
import CourierCompressed from './Courier.compressed.js';
import HelveticaBoldCompressed from './Helvetica-Bold.compressed.js';
import HelveticaBoldObliqueCompressed from './Helvetica-BoldOblique.compressed.js';
import HelveticaObliqueCompressed from './Helvetica-Oblique.compressed.js';
import HelveticaCompressed from './Helvetica.compressed.js';
import TimesBoldCompressed from './Times-Bold.compressed.js';
import TimesBoldItalicCompressed from './Times-BoldItalic.compressed.js';
import TimesItalicCompressed from './Times-Italic.compressed.js';
import TimesRomanCompressed from './Times-Roman.compressed.js';
import SymbolCompressed from './Symbol.compressed.js';
import ZapfDingbatsCompressed from './ZapfDingbats.compressed.js';
// prettier-ignore
var compressedJsonForFontName = {
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
export var FontNames;
(function (FontNames) {
    FontNames["Courier"] = "Courier";
    FontNames["CourierBold"] = "Courier-Bold";
    FontNames["CourierOblique"] = "Courier-Oblique";
    FontNames["CourierBoldOblique"] = "Courier-BoldOblique";
    FontNames["Helvetica"] = "Helvetica";
    FontNames["HelveticaBold"] = "Helvetica-Bold";
    FontNames["HelveticaOblique"] = "Helvetica-Oblique";
    FontNames["HelveticaBoldOblique"] = "Helvetica-BoldOblique";
    FontNames["TimesRoman"] = "Times-Roman";
    FontNames["TimesRomanBold"] = "Times-Bold";
    FontNames["TimesRomanItalic"] = "Times-Italic";
    FontNames["TimesRomanBoldItalic"] = "Times-BoldItalic";
    FontNames["Symbol"] = "Symbol";
    FontNames["ZapfDingbats"] = "ZapfDingbats";
})(FontNames || (FontNames = {}));
var fontCache = {};
var Font = /** @class */ (function () {
    function Font() {
        var _this = this;
        this.getWidthOfGlyph = function (glyphName) {
            return _this.CharWidths[glyphName];
        };
        this.getXAxisKerningForPair = function (leftGlyphName, rightGlyphName) {
            return (_this.KernPairXAmounts[leftGlyphName] || {})[rightGlyphName];
        };
    }
    Font.load = function (fontName) {
        var cachedFont = fontCache[fontName];
        if (cachedFont)
            return cachedFont;
        var json = decompressJson(compressedJsonForFontName[fontName]);
        var font = Object.assign(new Font(), JSON.parse(json));
        font.CharWidths = font.CharMetrics.reduce(function (acc, metric) {
            acc[metric.N] = metric.WX;
            return acc;
        }, {});
        font.KernPairXAmounts = font.KernPairs.reduce(function (acc, _a) {
            var name1 = _a[0], name2 = _a[1], width = _a[2];
            if (!acc[name1])
                acc[name1] = {};
            acc[name1][name2] = width;
            return acc;
        }, {});
        fontCache[fontName] = font;
        return font;
    };
    return Font;
}());
export { Font };
