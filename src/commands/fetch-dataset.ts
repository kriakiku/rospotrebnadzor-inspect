import { sleep } from "https://deno.land/x/sleep/mod.ts";
import { program } from 'npm:commander';
import { formatDatasetFileName, getCurrentYear, getDatasetFiles, parseDatasetFileName, storeDatasetFile } from '../utils/helpers.ts';
import { fetchPage, fetchPagesCount } from '../utils/parse.ts';
import { intervalBetweenRequests } from "../utils/config.ts";

program
    .name('fetch-dataset')
    .description('Fetch dataset from inspect.rospotrebnadzor.ru')
    .option('-y, --year <full_year>', 'set year for parsing', getCurrentYear())
    .option('-a, --attempts <number>', 'how many attempts to refetch dataset', '4')
    .version('0.0.1');

program.parse();

const { year, attempts: attemptsRaw } = program.opts();
const attempts = parseInt(attemptsRaw) || 1;
const currentDataset = await getDatasetFiles(year);

console.log(`Year: ${year}`);
console.log(`Current dataset: ${currentDataset.length} pages`);

// Get count of pages
const pagesCount = await fetchPagesCount(year);
console.log(`Total pages: ${pagesCount}`);

// Download dataset
let hasError = false;
for (let attempt = 1; attempt <= attempts; attempt++) {
  hasError = false;
  for (let page = 1; page <= pagesCount; page++) {
    const fileName = formatDatasetFileName(year, page);
    const datasetFile = parseDatasetFileName(fileName)!;

    // Already exists
    if (currentDataset.find((file) => file.name === datasetFile.name)) {
      if (attempt === 1) {
        console.log(`Page ${page} already downloaded`);
      }
      continue;
    }

    // Download
    try {
      await sleep(intervalBetweenRequests);
      const data = await fetchPage(year, page);
      await storeDatasetFile(datasetFile, data)

      currentDataset.push(datasetFile);

      console.log(`Page ${page} of ${pagesCount} downloaded`);
    } catch (error) {
      hasError = true;
      console.log(`Failed to download page ${page}`);
      console.error(error);
    }
  }
}

console.log('-------------------');

if (!hasError) {
  console.info(`Dataset downloaded successfully`);
} else  {
  console.info(`Dataset downloaded with errors`);
}

console.log(`Updated dataset: ${currentDataset.length} pages`);
self.close();
