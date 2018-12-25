import * as base64 from 'base64-arraybuffer';
import fs from 'mz/fs';
import pako from 'pako';
import { basename, dirname } from 'path';

import { parseWin1252 } from './parseWin1252';
import { parseZapfDingbatsOrSymbol } from './parseZapfDingbatsOrSymbol';

const compressJson = (json: string) => {
  const jsonBytes = json.split('').map((c) => c.charCodeAt(0));
  const base64DeflatedJson = JSON.stringify(
    base64.encode(pako.deflate(jsonBytes)),
  );
  return base64DeflatedJson;
};

const copyFileToSrc = async (src: string) => {
  const fileName = basename(src);
  const dest = dirname(dirname(__dirname)) + '/src/' + fileName;
  await (fs.copyFile as any)(src, dest);
};

const main = async () => {
  const parent = dirname(dirname(__dirname));

  for (const fontName of ['symbol', 'zapfdingbats', 'win1252']) {
    const file = `${parent}/encoding_metrics/${fontName}.txt`;
    console.log('Parsing:', file);
    const data = await fs.readFile(file);

    const parser =
      fontName === 'win1252' ? parseWin1252 : parseZapfDingbatsOrSymbol;
    const jsonMetrics = parser(String(data));

    const json = JSON.stringify(jsonMetrics);
    const compressedJson = compressJson(json);

    const jsonFile = `${parent}/encoding_metrics/${fontName}.json`;
    const compressedJsonFile = `${parent}/encoding_metrics/${fontName}.compressed.json`;

    await fs.writeFile(jsonFile, json);
    await fs.writeFile(compressedJsonFile, compressedJson);
    await copyFileToSrc(compressedJsonFile);
  }
};

main();
