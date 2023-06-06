import { program } from 'npm:commander';
import ExcelJS from 'npm:exceljs';
import { outputPath } from '../utils/config.ts';
import { getCurrentYear, getDatasetFiles, simplifyBusinessForm } from '../utils/helpers.ts';
import { parseDatasetFile } from '../utils/parse.ts';
import { BaseColumns, DatasetItem } from '../typed.ts';
import { DATASET_WORKSHEET_NAME } from '../utils/sheets.ts';

program
    .name('write-xlsx')
    .description('Format dataset to xlsx file')
    .option('-y, --year <full_year>', 'choose a year to work', getCurrentYear())
    .version('0.0.1');

program.parse();

const { year } = program.opts();
const currentDataset = await getDatasetFiles(year);
const workbook = new ExcelJS.Workbook();
let parsedDatasetItems: DatasetItem[] = [];

console.log(`Year: ${year}`);
console.log(`Current dataset: ${currentDataset.length} pages`);

// Parse dataset files
for (const datasetFile of currentDataset) {
  parsedDatasetItems.push(
    ...await parseDatasetFile(datasetFile)
  );

  console.log(`Parsed items: ${parsedDatasetItems.length} (${datasetFile.page} page)`);
}

// Sort dataset items
console.log(`Sorting items...`);
parsedDatasetItems = parsedDatasetItems.sort((left, right) => parseInt(left[BaseColumns.ID]) - parseInt(right[BaseColumns.ID]));

console.log(`Generating xlsx file...`);

// Meta
workbook.creator = `План проверок Роспотребнадзором на ${year} год`;
workbook.created = new Date();
workbook.modified = new Date();

// Dataset worksheet
const datasetSheet = workbook.addWorksheet(
  DATASET_WORKSHEET_NAME, {}
);

datasetSheet.addTable({
  name: 'Dataset',
  ref: 'A1',
  headerRow: true,
  style: {
    theme: 'TableStyleLight13',
    showRowStripes: true,
  },
  columns: [
    {name: 'ID', filterButton: true },
    {name: 'Форма', filterButton: true},
    {name: 'Наименование организации', filterButton: true},
    {name: 'ОГРН', filterButton: true},
    {name: 'ИНН', filterButton: true},
    {name: 'Места проведения', filterButton: true},
    {name: 'Дата начала проверки', filterButton: true},
    {name: 'Срок проведения проверки', filterButton: true},
    {name: 'Форма проведения проверки', filterButton: true},
    {name: 'Cтатус проверки', filterButton: true},
    {name: 'Цель проверки', filterButton: true},
    {name: 'Орган(ы) государственного контроля', filterButton: true},
  ],
  rows: parsedDatasetItems.map((item) => {
    return [
      item[BaseColumns.ID],
      simplifyBusinessForm(item[BaseColumns.BUSINESS_FORM]),
      item[BaseColumns.BUSINESS_FORM],
      item[BaseColumns.OGRN],
      item[BaseColumns.INN],
      item[BaseColumns.LOCATIONS],
      item[BaseColumns.AUDIT_START_DATE],
      item[BaseColumns.AUDIT_DURATION],
      item[BaseColumns.AUDIT_TYPE],
      item[BaseColumns.AUDIT_STATUS],
      item[BaseColumns.AUDIT_TARGET],
      item[BaseColumns.AUDIT_AUDITOR],
    ]
  }),
});

// ID column
const ID_COLUMN = datasetSheet.getColumn(1);
ID_COLUMN.width = 10;
ID_COLUMN.alignment = { horizontal: 'right', vertical: 'top' };

// BUSINESS_FORM column
const BUSINESS_FORM_COLUMN = datasetSheet.getColumn(2);
BUSINESS_FORM_COLUMN.width = 10;
BUSINESS_FORM_COLUMN.alignment = { horizontal: 'left', vertical: 'top' };

// BUSINESS_FORM (NAME) column
const BUSINESS_NAME_COLUMN = datasetSheet.getColumn(3);
BUSINESS_NAME_COLUMN.width = 100;
BUSINESS_NAME_COLUMN.alignment = { wrapText: true, horizontal: 'left', vertical: 'top' };

// OGRN
const OGRN_COLUMN = datasetSheet.getColumn(4);
OGRN_COLUMN.width = 18;
OGRN_COLUMN.alignment = { horizontal: 'center', vertical: 'top' };

// INN
const INN_COLUMN = datasetSheet.getColumn(5);
INN_COLUMN.width = 18;
INN_COLUMN.alignment = { horizontal: 'center', vertical: 'top' };

// LOCATIONS
const LOCATIONS_COLUMN = datasetSheet.getColumn(6);
LOCATIONS_COLUMN.width = 100;
LOCATIONS_COLUMN.alignment = { wrapText: true, horizontal: 'left', vertical: 'top' };

// AUDIT_START_DATE
const AUDIT_START_DATE_COLUMN = datasetSheet.getColumn(7);
AUDIT_START_DATE_COLUMN.width = 20;
AUDIT_START_DATE_COLUMN.alignment = { horizontal: 'right', vertical: 'top' };

// AUDIT_DURATION
const AUDIT_DURATION_COLUMN = datasetSheet.getColumn(8);
AUDIT_DURATION_COLUMN.width = 24;
AUDIT_DURATION_COLUMN.alignment = { horizontal: 'left', vertical: 'top' };

// AUDIT_TYPE
const AUDIT_TYPE_COLUMN = datasetSheet.getColumn(9);
AUDIT_TYPE_COLUMN.width = 26;
AUDIT_TYPE_COLUMN.alignment = { horizontal: 'left', vertical: 'top' };

// AUDIT_STATUS
const AUDIT_STATUS_COLUMN = datasetSheet.getColumn(10);
AUDIT_STATUS_COLUMN.width = 26;
AUDIT_STATUS_COLUMN.alignment = { horizontal: 'left', vertical: 'top' };

// AUDIT_TARGET
const AUDIT_TARGET_COLUMN = datasetSheet.getColumn(11);
AUDIT_TARGET_COLUMN.width = 26;
AUDIT_TARGET_COLUMN.alignment = { horizontal: 'left', vertical: 'top' };


// AUDIT_AUDITOR
const AUDIT_AUDITOR_COLUMN = datasetSheet.getColumn(12);
AUDIT_AUDITOR_COLUMN.width = 100;
AUDIT_AUDITOR_COLUMN.alignment = { wrapText: true, horizontal: 'left', vertical: 'top' };


// Save
const outputFormattedPath = outputPath.replace('{year}', year);
await workbook.xlsx.writeFile(outputFormattedPath);

console.log('-------------------');
console.log('Dataset saved to xlsx file');
console.log(outputFormattedPath);

self.close();
