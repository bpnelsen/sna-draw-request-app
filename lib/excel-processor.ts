import ExcelJS from 'exceljs';

/**
 * Process SNA Draw Request Excel file
 * Creates separate tabs for each lot, alphabetically ordered
 */
export async function processSNAExcel(
  fileBuffer: Buffer,
  originalFileName: string
): Promise<Buffer> {
  try {
    // Load input workbook
    const workbook = new ExcelJS.Workbook();
    // @ts-ignore - exceljs type definitions have issues with Buffer
    await workbook.xlsx.load(fileBuffer);

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

    // Create new workbook with separate tabs for each lot
    const outputWorkbook = new ExcelJS.Workbook();
    // Remove default sheet
    outputWorkbook.removeWorksheet(outputWorkbook.worksheets[0].id);

    // Define styles
    const headerFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F3A7D' }, // Navy blue
    };
    const headerFont = { bold: true, color: { argb: 'FFFFFFFF' } };
    const subtotalFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE8F0FE' }, // Light blue
    };
    const subtotalFont = { bold: true };
    const border = {
      left: { style: 'thin' as const },
      right: { style: 'thin' as const },
      top: { style: 'thin' as const },
      bottom: { style: 'thin' as const },
    };

    const numHeaders = Object.keys(headers).length;

    // Create a sheet for each lot (sorted alphabetically)
    for (const lotName of Object.keys(dataByLot).sort()) {
      const lotData = dataByLot[lotName];
      let lotTotal = 0; // Reset for each lot

      // Create worksheet for this lot
      const outputWorksheet = outputWorkbook.addWorksheet(lotName);

      // Write headers
      let colNum = 1;
      for (const [colIdx, header] of Object.entries(headers)) {
        const cell = outputWorksheet.getCell(1, colNum);
        cell.value = header;
        // @ts-ignore
        cell.fill = headerFill;
        // @ts-ignore
        cell.font = headerFont;
        // @ts-ignore
        cell.alignment = { horizontal: 'middle', vertical: 'middle' };
        // @ts-ignore
        cell.border = border;
        colNum++;
      }

      // Write data rows for this lot
      let currentRow = 2;

      for (const dataRow of lotData) {
        let colIndex = 1;
        dataRow.eachCell((cell, colNumber) => {
          if (colIndex <= numHeaders) {
            const newCell = outputWorksheet.getCell(currentRow, colIndex);
            newCell.value = cell.value;

            // Track amounts for subtotals (Column H = 8)
            if (colIndex === 8 && cell.value) {
              try {
                const amount = parseFloat(String(cell.value));
                if (!isNaN(amount)) {
                  lotTotal += amount;
                }
              } catch (e) {
                // Skip non-numeric values
              }
            }

            newCell.numFmt = cell.numFmt;
            // @ts-ignore
            newCell.border = border;
          }
          colIndex++;
        });
        currentRow++;
      }

      // Write subtotal row
      const subtotalRow = outputWorksheet.getRow(currentRow);
      const subtotalCol = subtotalRow.getCell(7);
      subtotalCol.value = `Subtotal (${lotName}):`;
      // @ts-ignore
      subtotalCol.font = subtotalFont;
      // @ts-ignore
      subtotalCol.fill = subtotalFill;

      const subtotalAmountCol = subtotalRow.getCell(8);
      subtotalAmountCol.value = lotTotal;
      // @ts-ignore
      subtotalAmountCol.font = subtotalFont;
      // @ts-ignore
      subtotalAmountCol.fill = subtotalFill;

      // Set column widths
      for (let i = 1; i <= numHeaders; i++) {
        outputWorksheet.getColumn(i).width = 20;
      }
    }

    // Generate output buffer
    // @ts-ignore - exceljs type definitions have issues with Buffer
    const outputBuffer = await outputWorkbook.xlsx.writeBuffer();
    return Buffer.from(outputBuffer);
  } catch (error) {
    console.error('Excel processing error:', error);
    throw new Error(`Failed to process Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
