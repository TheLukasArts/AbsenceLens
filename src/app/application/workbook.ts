export type WorkbookCell = string | number | boolean | Date | null;

export interface WorkbookSheet {
  readonly name: string;
  readonly rows: readonly (readonly WorkbookCell[])[];
}

export interface WorkbookData {
  readonly sheets: readonly WorkbookSheet[];
}

export interface WorkbookReader {
  read(file: File): Promise<WorkbookData>;
}
