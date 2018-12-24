import fs from 'mz/fs';
import { dirname } from 'path';

type IMetricKey = 'C' | 'WX' | 'N' | 'B' | 'L';

interface ICharMetrics {
  C: number;
  WX: number;
  N: string;
  B: [number, number, number, number];
  L: Array<[string, string]>;
}

const byKey = (key: IMetricKey) => (obj) => obj.key === key;

const matchOrEmpty = (str: string, regex: RegExp): string[] | void[] =>
  str.match(regex) || [];

const numberOrUndefined = (val) => (val ? Number(val) : undefined);

const takeUntilFirstSpace = (str: string): string =>
  str.substring(0, str.indexOf(' '));

const takeAfterFirstSpace = (str: string): string =>
  str.substring(str.indexOf(' ') + 1);

const error = (msg: string) => {
  throw new Error(msg);
};

// prettier-ignore
const parseMetric = (metric: string) => {
  const key = takeUntilFirstSpace(metric) as IMetricKey;
  const rawValue = takeAfterFirstSpace(metric);
  return (
      key === 'C'  ? { key, value: Number(rawValue) }
    : key === 'WX' ? { key, value: Number(rawValue) }
    : key === 'N'  ? { key, value: String(rawValue) }
    : key === 'B'  ? { key, value: rawValue.split(' ').map(Number) }
    : key === 'L'  ? { key, value: rawValue.split(' ').map(String) }
    : error(`Unrecognized metric key: "${key}"`)
  );
};

/**
 * parseCharMetrics() takes a single line from the "CharMetrics" section in an
 * AFM file, and extracts the crucial metrics for that character. For example,
 * the line describing capital A in Times-Roman from Adobe's Core14 font set
 * is this:
 *
 *   C 65 ; WX 722 ; N A ; B 15 0 706 674 ;
 *
 * For which parseCharMetrics() would return a plain object:
 *
 *     { charCode: 65, width: 722, name: 'A' }
 *
 * From https://www.adobe.com/content/dam/acom/en/devnet/font/pdfs/5004.AFM_Spec.pdf :
 *
 * C integer:
 *   Decimal value of default character code (−1 if not encoded).
 *
 * WX number:
 *   Width of character.
 *
 * N name:
 *   (Optional.) PostScript language character name.
 *
 * B llx lly urx ury:
 *   (Optional.) Character bounding box where llx, lly, urx, and ury are all
 *   numbers. If a character makes no marks on the page (for example, the space
 *   character), this fi eld reads B 0 0 0 0 , and these values are not
 *   considered when computing the FontBBox.
 *
 * L successor ligature:
 *   (Optional.) Ligature sequence where successor and ligature are both names.
 *   The current character may join with the character named successor to form
 *   the character named ligature. Note that characters can have more than one
 *   such entry.
 *
 * Fallback link for AFM Spec:
 *   https://ia800603.us.archive.org/30/items/afm-format/afm-format.pdf
 */
const parseCharMetrics = (line: string): ICharMetrics => {
  const SEMICOLON_WITH_SURROUDING_WHITESPACE = /\s*;\s*/;
  const NON_EMPTY = (str) => str !== '';

  const metrics = line
    .split(SEMICOLON_WITH_SURROUDING_WHITESPACE)
    .filter(NON_EMPTY)
    .map(parseMetric);

  return {
    C: metrics.find(byKey('C')).value,
    WX: metrics.find(byKey('WX')).value,
    N: metrics.find(byKey('N')).value,
    B: metrics.find(byKey('B')).value,
    L: metrics.filter(byKey('L')).map((l) => l.value),
  } as ICharMetrics;

  /*
switch (section) {
 case 'FontMetrics':
   match = line.match(/(^\w+)\s+(.*)/);
   var key = match[1];
   var value = match[2];

   if (a = this.attributes[key]) {
     if (!Array.isArray(a)) { a = (this.attributes[key] = [a]); }
     a.push(value);
   } else {
     this.attributes[key] = value;
   }
   break;

 case 'CharMetrics':
   if (!/^CH?\s/.test(line)) { continue; }
   var name = line.match(/\bN\s+(\.?\w+)\s*;/)[1];
   this.glyphWidths[name] = +line.match(/\bWX\s+(\d+)\s*;/)[1];
   break;

 case 'KernPairs':
   match = line.match(/^KPX\s+(\.?\w+)\s+(\.?\w+)\s+(-?\d+)/);
   if (match) {
     this.kernPairs[match[1] + '\0' + match[2]] = parseInt(match[3]);
   }
  break;
 }
*/
};

const extractCharMetricsLines = (data: string) => {
  const startMatch = data.match(/^StartCharMetrics\s+(\d+)/m);
  const endMatch = data.match(/^EndCharMetrics/m);
  const charMetricsStart = startMatch.index + startMatch[0].length;
  const charMetricsData = data.slice(charMetricsStart, endMatch.index);
  const charMetricsLines = charMetricsData.trim().split(/\r\n|\r|\n|\t/);
  return charMetricsLines;
};

const parseCharMetricsSection = (data: string) => {
  return extractCharMetricsLines(data).map(parseCharMetrics);
};

/**
 * parseFontMetrics() takes an entire AFM file as a string, finds the
 * "CharMetrics" section, and parses all of the char metrics lines from that
 * section, returning an Array of those charmetrics.
 */
export function parseFontMetrics(data: string): ICharMetrics[] {
  return parseCharMetricsSection(data);
  // return charMetricsLines.map(parseCharMetrics);
}

const getAfmFilePaths = async () => {
  const parentDir = dirname(__dirname);
  const files = await fs.readdir(`${parentDir}/font_metrics`);
  const afmFiles = files.filter((name) => name.includes('.afm'));
  return afmFiles.map((name) => `${parentDir}/font_metrics/${name}`);
};

const main = async () => {
  const afmFiles = await getAfmFilePaths();
  for (const afmFile of afmFiles) {
    console.log('Parsing:', afmFile);
    const data = await fs.readFile(afmFile);
    const metrics = parseFontMetrics(String(data));
    const jsonMetrics = JSON.stringify(metrics);
    const jsonFile = afmFile.replace('.afm', '.json');
    await fs.writeFile(jsonFile, jsonMetrics);
  }
};

main();
