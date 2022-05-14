const path = require('path');
const xlsx = require('xlsx');


exports.generateExcelFile = (data, options) => {
  const { workSheetColumnNames, workSheetName, filePath } = options;

  try {
    const workBook = xlsx.utils.book_new();

    const workSheetData = [
      workSheetColumnNames,
      ...data
    ];

    const workSheet = xlsx.utils.aoa_to_sheet(workSheetData);
    xlsx.utils.book_append_sheet(workBook, workSheet, workSheetName);

    xlsx.writeFile(workBook, path.resolve(filePath));

    return {
      success: true,
      filePath
    };
  } catch (err) {
    console.log('generateExcelFile ERROR: ', err);
    return {
      success: false,
      filePath,
      error: err
    }
  }
};