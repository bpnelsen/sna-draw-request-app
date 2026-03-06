import ExcelJS from 'exceljs';

/**
 * Process SNA Draw Request Excel file
 * Reorganizes by SN Loan # (Column G) with subtotals per lot
 */
export async function processSNAExcel(
  fileBuffer: Buffer,
  originalFileName: string
): Promise<Buffer> {
  try {
    // Load input workbook
    const workbook = new ExcelJS.Workbook();
    const uint8Array = new Uint8Array(fileBuffer);
    await workbook.xlsx.load(uint8Array);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('No worksheet found in Excel file');
    }

    // Read headers (Row 1)
    const headers: Record<number, string> = {};
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      if (cell.value) {
        headers[colNumber] = String(cell.value);
      }
    });

    // Group data by SN Loan # (Column G = 7)
    const dataByLot: Record<string, ExcelJS.Row[]> = {};
    const startRow = 2;
    
    for (let rowNum = startRow; rowNum <= worksheet.rowCount; rowNum++) {
      const row = worksheet.getRow(rowNum);
      const cellG = row.getCell(7); // Column G
      
      if (cellG.value) {
        const lotName = String(cellG.value).trim();
        if (!dataByLot[lotName]) {
          dataByLot[lotName] = [];
        }
        dataByLot[lotName].push(row);
      }
    }

    // Create new workbook with reorganized data
    const outputWorkbook = new ExcelJS.Workbook();
    const outputWorksheet = outputWorkbook.addWorksheet('Reorganized');

    // Write headers
    const headerCells: any[] = [];
    Object.entries(headers).forEach(([colNum, header]) => {
      const cell = outputWorksheet.getCell(1, parseInt(colNum));
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F3A7D' }, // Navy blue
      };
      cell.alignment = { horizontal: 'center', vertical: 'center' };
    });

    // Write data grouped by lot
    let currentRow = 2;
    const sortedLots = Object.keys(dataByLot).sort();

    for (const lotName of sortedLots) {
      const rows = dataByLot[lotName];
      
      // Add lot header (optional)
      const lotHeaderRow = outputWorksheet.getRow(currentRow);
      lotHeaderRow.getCell(1).value = `Lot: ${lotName}`;
      lotHeaderRow.getCell(1).font = { bold: true };
      lotHeaderRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8F0FE' }, // Light blue
      };
      currentRow++;

      // Add data rows for this lot
      for (const dataRow of rows) {
        const newRow = outputWorksheet.getRow(currentRow);
        dataRow.eachCell((cell, colNumber) => {
          const newCell = newRow.getCell(colNumber);
          newCell.value = cell.value;
          newCell.numFmt = cell.numFmt;
          newCell.font = cell.font;
          newCell.fill = cell.fill;
          newCell.alignment = cell.alignment;
        });
        currentRow++;
      }

      // Add subtotal row
      const subtotalRow = outputWorksheet.getRow(currentRow);
      subtotalRow.getCell(1).value = `Subtotal for ${lotName}`;
      subtotalRow.getCell(1).font = { bold: true };
      subtotalRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8F0FE' }, // Light blue
      };
      currentRow++;
    }

    // Auto-fit columns
    const columnWidths: Record<number, number> = {};
    worksheet.eachRow((row) => {
      row.eachCell((cell, colNumber) => {
        const cellLength = String(cell.value || '').length + 2;
        columnWidths[colNumber] = Math.max(columnWidths[colNumber] || 10, cellLength);
      });
    });

    Object.entries(columnWidths).forEach(([colNum, width]) => {
      outputWorksheet.getColumn(parseInt(colNum)).width = Math.min(width, 50);
    });

    // Generate output buffer
    const outputBuffer = await outputWorkbook.xlsx.writeBuffer();
    return Buffer.from(outputBuffer as any);
  } catch (error) {
    console.error('Excel processing error:', error);
    throw new Error(`Failed to process Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
