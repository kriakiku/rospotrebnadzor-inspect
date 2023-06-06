import { BaseColumns, DatasetFile, DatasetItem } from "../typed.ts";
import { parsingUri } from "./config.ts";
import { detectColumnName, detectColumnValue, formatDatasetFileName, parseDOMFromString, parseDatasetFileName } from "./helpers.ts";

/**
 * Fetch HTML page
 */
export async function fetchPage(year: string, page: number) {
  const uri = parsingUri
    .replace('{year}', year)
    .replace('{page}', page.toString())


  try {
    const textResponse = await fetch(uri);
    const textData = await textResponse.text();

    return textData;
  } catch (error) {
    console.info(`Failed to download page ${page}`);
    throw error;
  }
}

/**
 * Fetch pages count
 */
export async function fetchPagesCount(year: string): Promise<number> {
  const response = await fetchPage(year, 1);
  const document = parseDOMFromString(response);
  const aElement = document.querySelector('center > .scroller > a:last-of-type');
  const href = aElement?.getAttribute('href');

  if (!href) {
    throw new Error('Failed to find last page link');
  }

  const uri = new URL(href, parsingUri);
  const page = uri.searchParams.get('page');

  if (!page) {
    throw new Error('Failed to find page param in last page link');
  }

  return parseInt(page);
}

/**
 * Parse dataset file
 */
export async function parseDatasetFile(datasetFile: DatasetFile) {
  try {
    const text = await Deno.readTextFile(datasetFile.path);
    const document = parseDOMFromString(text);

    // Parse input lines
    const inputLines = document.querySelectorAll('table.tlist > tbody > tr');
    if (!inputLines || inputLines.length === 0) {
      throw new Error('Failed to find input lines');
    }

    // Chunk input lines
    const chunkedInputLines = [...inputLines].reduce((items, line) => {
      const [leftCell, rightCell] = [...line.childNodes].filter((node) => node.nodeName === 'TD');
      const contentName = detectColumnName(leftCell.textContent!);

      // Cant detect column name
      if (!contentName) {
        throw new Error(`Failed to detect column name for "${leftCell.textContent}"`);
      }

      // New item
      if (contentName === BaseColumns.ID) {
        items.push({} as DatasetItem);
      }

      // Get last item
      const item = items.at(-1)!;
      const contentValue = detectColumnValue(contentName!, leftCell.textContent!, rightCell?.textContent!);

      item[contentName] = contentValue!;

      return items;
    }, [] as Array<DatasetItem>);

    return chunkedInputLines;
  } catch (e) {
    console.log(`Failed to read dataset file ${datasetFile.name}`)
    throw e;
  }
}