import fs from "fs";
import readXlsxFile from "read-excel-file/node";
import { Cell } from "read-excel-file/types";
import { getDocType } from "./utils/getDocType";
import { saveFile } from "./saveFile";

export const readFile = (inputFields: number[]) => {
  // Create output folders
  const principalFolder = `${__dirname}/output/principal`;
  if (!fs.existsSync(principalFolder)) {
    fs.mkdirSync(principalFolder, { recursive: true });
  }

  const columns = inputFields.map((field) => field - 1);
  const inputDir = `${__dirname}/input/entrada.xlsx`;
  console.log(inputDir);

  readXlsxFile(inputDir).then(async (rows) => {
    // By Number
    let numberTypeData: Array<any[]> = [];
    // By NFES
    let NFEStypeData: Array<any[]> = [];
    // By NFS
    let NFStypeData: Array<any[]> = [];
    // By REC
    let RECtypeData: Array<any[]> = [];
    // By RPA
    let RPAtypeData: Array<any[]> = [];

    // Columns Names
    let columsNames: string[] = ["FIXO"];

    rows.forEach((row, index) => {
      let newRowData: Cell[] = [];

      // Read only the columns set on the input
      columns.forEach((columnId) => {
        // Generate autofilled FIXO field
        if (newRowData.length === 0) {
          newRowData.push(1000);
        }

        // set columns names and jump the first line which contains the columns names
        if (index === 0) {
          columsNames.push(row[columnId] as string);
        } else {
          newRowData.push(row[columnId]);
        }
      });

      // TODO: Filtrar e remover duplicatas

      // Filter
      const getType = getDocType(newRowData, 1); // Check column B because A is using the fixed 1000 value

      switch (getType) {
        case "Number":
          numberTypeData.push(newRowData);
          break;
        case "NFS":
          NFStypeData.push(newRowData);
          break;
        case "NFES":
          NFEStypeData.push(newRowData);
          break;
        case "REC":
          RECtypeData.push(newRowData);
          break;
        case "RPA":
          RPAtypeData.push(newRowData);
          break;
      }
    });

    console.log("Number:", numberTypeData);
    console.log("NFES:", NFEStypeData);
    console.log("REC:", RECtypeData);
    console.log("RPA:", RPAtypeData);

    console.log("columns names:", columsNames);

    // TODO: Criar separações dos arquivos Number por diferença de número

    // Number
    await saveFile(
      numberTypeData,
      columsNames,
      `principal/base-${numberTypeData[0][1]}.xlsx`
    );

    // NFES
    await saveFile(NFEStypeData, columsNames, `principal/NFES.xlsx`);

    // NFS
    await saveFile(NFStypeData, columsNames, `principal/NFS.xlsx`);

    // REC
    await saveFile(RECtypeData, columsNames, `principal/REC.xlsx`);

    // RPA
    await saveFile(RPAtypeData, columsNames, `principal/RPA.xlsx`);
  });
};
