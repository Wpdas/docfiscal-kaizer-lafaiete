import fs from "fs";
import { Cell, Row } from "read-excel-file/types";
import { getDocType } from "./utils/getDocType";
import { saveFile } from "./saveFile";

export const processFile = async (
  rows: Row[],
  folder: string,
  inputFields: number[],
  numeroDeConhecimentoDeFreteDaNF?: number,
  CNPJcolumnNumber?: number
) => {
  if (!folder || !inputFields) {
    throw new Error(
      "Você deve informar a pasta e as colunas que quer processar!"
    );
  }

  // Create output folders
  const outputFolder = `${__dirname}/output/${folder}`;
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  const columns = inputFields.map((field) => field - 1);
  const fixedNumeroDeConhecimentoDeFreteDaNF = numeroDeConhecimentoDeFreteDaNF
    ? numeroDeConhecimentoDeFreteDaNF - 1
    : null;
  const fixedCNPJcolumnNumber = CNPJcolumnNumber ? CNPJcolumnNumber - 1 : null;

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

  // Registra CNPJs + N Documento pra evitar duplicatas
  let watchDuplicates: any = {};

  // Read only the columns set on the input
  const processNewData = (row: Row, index: number) => {
    let newRowData: Cell[] = [];
    columns.forEach((columnId) => {
      // Generate autofilled FIXO field
      if (newRowData.length === 0) {
        newRowData.push(1000);
      }

      // set columns names and jump the first line which contains the columns names
      if (index === 0) {
        columsNames.push(row[columnId] as string);
      } else {
        // Checa duplicata
        newRowData.push(row[columnId]);
      }
    });

    return newRowData;
  };

  rows.forEach((row, index) => {
    let newRowData: Cell[] = [];

    // Deve filtrar e evitar duplicatas?
    if (fixedNumeroDeConhecimentoDeFreteDaNF && fixedCNPJcolumnNumber) {
      const currentNumeroDeConhecimentoDeFreteDaNF =
        row[fixedNumeroDeConhecimentoDeFreteDaNF];
      const currentCNPJ = row[fixedCNPJcolumnNumber];

      // Pula se houver duplicata (usando dois campos como filtro, se existir igual, deixa apenas um registro)
      if (
        !watchDuplicates[
          `${currentNumeroDeConhecimentoDeFreteDaNF}_${currentCNPJ}`
        ]
      ) {
        watchDuplicates[
          `${currentNumeroDeConhecimentoDeFreteDaNF}_${currentCNPJ}`
        ] = [index, numeroDeConhecimentoDeFreteDaNF]; // Linha, Coluna do primeiro registro

        newRowData = processNewData(row, index);
      } else {
        // LOG DE DUPLICATAS
        // const alreadyRegisteredSource =
        //   watchDuplicates[
        //     `${currentNumeroDeConhecimentoDeFreteDaNF}_${currentCNPJ}`
        //   ];
        // console.log(
        //   `\x1b[33m${folder.toUpperCase()} - DUPLICATA ENCONTRADA\x1b[0m`
        // );
        // console.log("Primeiro Registro (mantido) está na:");
        // console.table([
        //   {
        //     linha: alreadyRegisteredSource[0],
        //     ["Número de conhecimento de frete da NF"]:
        //       currentNumeroDeConhecimentoDeFreteDaNF,
        //     ["CNPJ"]: currentCNPJ,
        //   },
        // ]);
        // console.log("Duplicata encontrada e ignorada na:");
        // console.table([
        //   {
        //     linha: index,
        //     ["Número de conhecimento de frete da NF"]:
        //       currentNumeroDeConhecimentoDeFreteDaNF,
        //     ["CNPJ"]: currentCNPJ,
        //   },
        // ]);
      }
    } else {
      newRowData = processNewData(row, index);
    }

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

  // Cria separações dos arquivos Number por diferença de número
  const bases: any = {};
  numberTypeData.forEach((row) => {
    if (!bases[row[1]]) {
      bases[row[1]] = [row];
    } else {
      bases[row[1]].push(row);
    }
  });

  // Number
  // Salva cada base de número
  Object.keys(bases).forEach(async (baseKey) => {
    await saveFile(
      bases[baseKey],
      columsNames,
      `${folder}/base-${bases[baseKey][0][1]}.xlsx`
    );
  });

  // NFES
  await saveFile(NFEStypeData, columsNames, `${folder}/NFES.xlsx`);

  // NFS
  await saveFile(NFStypeData, columsNames, `${folder}/NFS.xlsx`);

  // REC
  await saveFile(RECtypeData, columsNames, `${folder}/REC.xlsx`);

  // RPA
  await saveFile(RPAtypeData, columsNames, `${folder}/RPA.xlsx`);

  // GC
  watchDuplicates = null;
};
