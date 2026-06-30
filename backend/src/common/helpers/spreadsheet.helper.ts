import * as XLSX from 'xlsx';

export type SheetRow = Record<string, string | number | null | undefined>;

/**
 * Parse an uploaded file buffer (CSV or Excel) into an array of row objects.
 * The first row is treated as the header.
 */
export function parseSpreadsheet(buffer: Buffer, mimetype: string): SheetRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', raw: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json<SheetRow>(sheet, { defval: null });
}

/**
 * Build a downloadable buffer from an array of row objects.
 * format: 'csv' → text/csv; 'xlsx' → application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 */
export function buildSpreadsheet(
  rows: SheetRow[],
  format: 'csv' | 'xlsx',
): { buffer: Buffer; contentType: string; extension: string } {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');

  if (format === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(sheet);
    return {
      buffer: Buffer.from(csv, 'utf-8'),
      contentType: 'text/csv',
      extension: 'csv',
    };
  }

  const xlsxBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  return {
    buffer: xlsxBuffer,
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: 'xlsx',
  };
}
