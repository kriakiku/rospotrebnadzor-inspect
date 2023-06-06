import { join } from "https://deno.land/std/path/mod.ts";
import { BaseColumns, DatasetFile } from "../typed.ts";
import { datasetFileFormatRegex, datasetPath } from "./config.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { AUDIT_AUDITOR_REGEXP, AUDIT_DURATION_REGEXP, AUDIT_START_DATE_REGEXP, AUDIT_STATUS_REGEXP, AUDIT_TARGET_REGEXP, AUDIT_TYPE_REGEXP, BUSINESS_FORM_REGEXP, ID_COLUMN_REGEXP, INN_REGEXP, LOCATIONS_REGEXP, BUSINESS_FORMS, OGRN_REGEXP, UNAVALABLE_LOCATION_REGEX } from "./regexp.ts";

/** Get current year */
export function getCurrentYear() {
  return new Date().getFullYear().toString();
}

/** Parse dataset file name */
export function parseDatasetFileName(name: string): DatasetFile | null {
    const execArray = datasetFileFormatRegex.exec(name);

    if (execArray === null) {
        return null
    }

    const [, year, page] = execArray;

    return {
        name: name,
        path: join(datasetPath, name),
        year,
        page: parseInt(page)
    }
}

/** Get current dataset files */
export async function getDatasetFiles(year: string): Promise<DatasetFile[]> {
  const datasetFiles: DatasetFile[] = [];

  for await (const dirEntry of Deno.readDir(datasetPath)) {
    const parsedFile = parseDatasetFileName(dirEntry.name);

    if (
      dirEntry.isFile &&
      parsedFile &&
      parsedFile.year === year
    ) {
      datasetFiles.push(
        parsedFile
      );
    }
  }

  return datasetFiles
}

/** Parse DOM from string */
export function parseDOMFromString(html: string) {
  return new DOMParser().parseFromString(html, 'text/html')!;
}

/** Format dataset filename */
export function formatDatasetFileName(year: string, page: number): string {
  return `${year}.${page}.dat`;
}

/** Store dataset file */
export async function storeDatasetFile(datasetFile: DatasetFile, data: string): Promise<void> {
  await Deno.writeTextFile(datasetFile.path, data);
}

/** Detect column name */
export function detectColumnName(leftColumnContent: string): BaseColumns | null {
  const content = leftColumnContent.toLowerCase().trim();

  // ID
  if (ID_COLUMN_REGEXP.test(content)) {
    return BaseColumns.ID;
  }

  // BUSINESS_FORM
  if (BUSINESS_FORM_REGEXP.test(content)) {
    return BaseColumns.BUSINESS_FORM;
  }

  // OGRN
  if (OGRN_REGEXP.test(content)) {
    return BaseColumns.OGRN;
  }

  // INN
  if (INN_REGEXP.test(content)) {
    return BaseColumns.INN;
  }

  // LOCATIONS
  if (LOCATIONS_REGEXP.test(content)) {
    return BaseColumns.LOCATIONS;
  }

  // AUDIT_START_DATE
  if (AUDIT_START_DATE_REGEXP.test(content)) {
    return BaseColumns.AUDIT_START_DATE;
  }

  // AUDIT_DURATION
  if (AUDIT_DURATION_REGEXP.test(content)) {
    return BaseColumns.AUDIT_DURATION;
  }

  // AUDIT_TYPE
  if (AUDIT_TYPE_REGEXP.test(content)) {
    return BaseColumns.AUDIT_TYPE;
  }

  // AUDIT_AUDITOR
  if (AUDIT_AUDITOR_REGEXP.test(content)) {
    return BaseColumns.AUDIT_AUDITOR;
  }

  // AUDIT_STATUS
  if (AUDIT_STATUS_REGEXP.test(content)) {
    return BaseColumns.AUDIT_STATUS;
  }

  // AUDIT_TARGET
  if (AUDIT_TARGET_REGEXP.test(content)) {
    return BaseColumns.AUDIT_TARGET;
  }

  return null;
}

/** Detect and format column value */
export function detectColumnValue(
  column: BaseColumns,
  leftColumnContent: string,
  rightColumnContent: string
): string | null {

  // ID
  if (column === BaseColumns.ID) {
    return ID_COLUMN_REGEXP.exec(leftColumnContent.trim())![1];
  }

  // Locations
  if (column === BaseColumns.LOCATIONS) {
    let locations = rightColumnContent
      .replaceAll(';', '\n')
      .split('\n').map((location) => location.trim())
      .map((location) => {
        if (UNAVALABLE_LOCATION_REGEX.test(location)) {
          return '❌ Локация скрыта';
        }

        return location;
      })
      .join('\n');

    return locations;
  }

  // Duration
  if (column === BaseColumns.AUDIT_DURATION) {
    return rightColumnContent.replaceAll('\n', ' ').trim();
  }

  // Simple text
  return rightColumnContent.trim();
}

/** Simplify business form */
export function simplifyBusinessForm(businessForm: string): string {

  for (const [slug, text] of BUSINESS_FORMS) {
    if (businessForm.toLowerCase().replaceAll('-', ' ').includes(text)) {
      return slug;
    }
  }

  // console.log(`Business form alias for "${businessForm}" implemented`);
  return '???'
}