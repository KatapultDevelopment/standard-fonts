import fs from 'mz/fs';
import { dirname } from 'path';

import { ICharMetrics, parseCharMetricsSection } from './parseCharacterMetrics';
import { IFontMetrics, parseFontMetricsSection } from './parseFontMetrics';
import { IKernPair, parseKernPairsSection } from './parseKernPairs';

interface IMetrics extends IFontMetrics {
  CharMetrics: ICharMetrics[];
  KernPairs: IKernPair[];
}

export { IMetrics };

export const parseFontMetrics = (data: string): IMetrics => ({
  ...parseFontMetricsSection(data),
  CharMetrics: parseCharMetricsSection(data),
  KernPairs: parseKernPairsSection(data),
});

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
