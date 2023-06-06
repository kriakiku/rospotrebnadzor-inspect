import { join, fromFileUrl, dirname } from "https://deno.land/std/path/mod.ts";

export const basePath = join(dirname(fromFileUrl(import.meta.url)), '../../');

export const datasetPath = join(basePath, 'dataset');
export const datasetFileFormatRegex = /^(\d{4})\.(\d+)\.dat$/;

export const parsingUri = `https://inspect.rospotrebnadzor.ru/{year}/?page={page}`;

/* Interval between requests in seconds. At the time of writing this code, i have not encountered RPM locks */
export const intervalBetweenRequests = 0.01;

/** Output filename */
export const outputXLSXFileName = 'inspect.rospotrebnadzor.{year}.xlsx';
export const outputPath = join(basePath, 'output', outputXLSXFileName);
