import XLSX from "xlsx";

export const saveFile = async (
  rows: Array<any[]>,
  columnsNames: string[],
  fileName: string
) => {
  const data: any[] = [];

  rows.forEach((row, rowsIndex) => {
    const newColumn: any = {};
    row.forEach((fieldValue, fieldIndex) => {
      newColumn[columnsNames[fieldIndex]] = fieldValue;
    });
    data.push(newColumn);
  });

  console.log(data);

  const workSheet = XLSX.utils.json_to_sheet(data);
  const workBook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workBook, workSheet, "PRINCIPAL");
  const outputDir = `${__dirname}/output/${fileName}`;
  XLSX.writeFile(workBook, outputDir);

  return true;
  // return XLSX.writeFileAsync(outputDir, workBook, {});
};
