export interface DatasetFile {
    name: string;
    path: string;
    year: string;
    page: number;
}

export type DatasetItem = Record<BaseColumns, string>;

export enum BaseColumns {
  "ID" = "ID",
  "BUSINESS_FORM" = "BUSINESS_FORM",
  "OGRN" = "OGRN",
  "INN" = "INN",
  "LOCATIONS" = "LOCATIONS",
  "AUDIT_START_DATE" = "AUDIT_START_DATE",
  "AUDIT_DURATION" = "AUDIT_DURATION",
  "AUDIT_TYPE" = "AUDIT_TYPE",
  "AUDIT_AUDITOR" = "AUDIT_AUDITOR",
  "AUDIT_STATUS" = "AUDIT_STATUS",
  "AUDIT_TARGET" = "AUDIT_TARGET",
}