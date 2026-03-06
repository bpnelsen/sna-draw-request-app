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
    console.log('🔄 Starting Excel processing...');
    
    // Load input workbook
    const workbook = new ExcelJS.Workbook();
    // @ts-ignore - exceljs type definitions have issues with Buffer
    await workbook.xlsx.load(fileBuffer);
    console.log('✅ Workbook loaded');

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('No worksheet found in Excel file');
    }

    // Read headers (Row 1)
    const headers: any[] = [];
    const headerRow = worksheet.getRow(1);
    let maxCol = 0;
    
    headerRow.eachCell((cell, colNumber) => {
      if (cell.value) {
        headers[colNumber - 1] = cell.value;
        maxCol = Math.max(maxCol, colNumber);
      }
    });
    
    console.log(`✅ Found ${maxCol} columns`);

    // Group data by SN Loan # (Column G = 7)
    const dataByLot: Record<string, any[][]> = {};
    const startRow = 2;

    for (let rowNum = startRow; rowNum <= worksheet.rowCount; rowNum++) {
      const row = worksheet.getRow(rowNum);
      const cellG = row.getCell(7); // Column G

      if (cellG.value) {
        const lotName = String(cellG.value).trim();
        if (!dataByLot[lotName]) {
          dataByLot[lotName] = [];
        }

        // Read row data as values array
        const rowData: any[] = [];
        for (let col = 1; col <= maxCol; col++) {
          rowData.push(row.getCell(col).value);
        }
        dataByLot[lotName].push(rowData);
      }
    }

    console.log(`✅ Found ${Object.keys(dataByLot).length} lots`);

    // Create new workbook with separate tabs for each lot
    const outputWorkbook = new ExcelJS.Workbook();
    // Remove default sheet
    if (outputWorkbook.worksheets.length > 0) {
      outputWorkbook.removeWorksheet(outputWorkbook.worksheets[0].id);
    }

    // Define styles
    const headerFill = {
      type: 'pattern' as const,
      pattern: 'solid' as const,
      fgColor: { argb: 'FF0F3A7D' }, // Navy blue
    };
    const headerFont = { bold: true, color: { argb: 'FFFFFFFF' } };
    const subtotalFill = {
      type: 'pattern' as const,
      pattern: 'solid' as const,
      fgColor: { argb: 'FFE8F0FE' }, // Light blue
    };
    const subtotalFont = { bold: true };
    const border = {
      left: { style: 'thin' as const },
      right: { style: 'thin' as const },
      top: { style: 'thin' as const },
      bottom: { style: 'thin' as const },
    };

    // Create a sheet for each lot (sorted alphabetically)
    for (const lotName of Object.keys(dataByLot).sort()) {
      const lotData = dataByLot[lotName];
      let lotTotal = 0;

      console.log(`📝 Creating sheet for lot: ${lotName}`);

      // Create worksheet for this lot
      const outputWorksheet = outputWorkbook.addWorksheet(lotName);

      // Write headers
      for (let col = 1; col <= maxCol; col++) {
        const cell = outputWorksheet.getCell(1, col);
        cell.value = headers[col - 1] || '';
        // @ts-ignore
        cell.fill = headerFill;
        // @ts-ignore
        cell.font = headerFont;
        // @ts-ignore
        cell.alignment = { horizontal: 'middle', vertical: 'middle' };
        // @ts-ignore
        cell.border = border;
      }

      // Write data rows for this lot
      let currentRow = 2;
      for (const rowData of lotData) {
        for (let col = 1; col <= maxCol; col++) {
          const cell = outputWorksheet.getCell(currentRow, col);
          cell.value = rowData[col - 1] || null;

          // Track amounts for subtotals (Column H = 8)
          if (col === 8 && rowData[col - 1]) {
            try {
              const amount = parseFloat(String(rowData[col - 1]));
              if (!isNaN(amount)) {
                lotTotal += amount;
              }
            } catch (e) {
              // Skip non-numeric values
            }
          }

          // @ts-ignore
          cell.border = border;
        }
        currentRow++;
      }

      // Write subtotal row
      const subtotalRow = currentRow;
      outputWorksheet.getCell(subtotalRow, 7).value = `Subtotal (${lotName}):`;
      // @ts-ignore
      outputWorksheet.getCell(subtotalRow, 7).font = subtotalFont;
      // @ts-ignore
      outputWorksheet.getCell(subtotalRow, 7).fill = subtotalFill;

      outputWorksheet.getCell(subtotalRow, 8).value = lotTotal;
      // @ts-ignore
      outputWorksheet.getCell(subtotalRow, 8).font = subtotalFont;
      // @ts-ignore
      outputWorksheet.getCell(subtotalRow, 8).fill = subtotalFill;

      // Set column widths
      for (let i = 1; i <= maxCol; i++) {
        outputWorksheet.getColumn(i).width = 20;
      }
    }

    console.log('💾 Writing output buffer...');
    // Generate output buffer
    // @ts-ignore - exceljs type definitions have issues with Buffer
    const outputBuffer = await outputWorkbook.xlsx.writeBuffer();
    console.log('✅ Excel processing complete!');
    
    return Buffer.from(outputBuffer);
  } catch (error) {
    console.error('❌ Excel processing error:', error);
    throw new Error(`Failed to process Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
