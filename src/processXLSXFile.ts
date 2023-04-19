import fs from "fs";
import { Cell, Row } from "read-excel-file/types";
import { saveFile } from "./saveFile";

export const processXLSXFile = async (
  rows: Row[],
  folder: string,
  inputFields: number[],
  numeroDocColumnNumber: number,
  siteDeOrigemColumnNumber: number,
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
  const fixedNumeroDocColumnNumber = numeroDocColumnNumber - 1;
  const fixedSiteDeOrigemColumnNumber = siteDeOrigemColumnNumber - 1;

  // Monta/Guarda conteudo de cada arquivo
  const filesData: any = {};

  // Columns Names
  let columsNames: string[] = ["FIXO"];

  // Registra CNPJs + N Documento pra evitar duplicatas
  let watchDuplicates: any = {};

  // Read only the columns set on the input
  const processNewData = (row: Row, index: number) => {
    let newRowData: Cell[] = [];
    // row = linha [de uma coluna]
    // columnId = numero da coluna
    columns.forEach((columnId) => {
      // Generate autofilled FIXO field
      if (newRowData.length === 0) {
        newRowData.push(1000);
      }

      // set columns names and jump the first line which contains the columns names
      if (index === 0) {
        // ou seja: linha[da coluna]
        columsNames.push(row[columnId] as string);
      } else {
        // ou seja: linha[da coluna]
        newRowData.push(row[columnId]);
      }
    });

    // Se for a linha de nome das colunas, ignora
    if (index === 0) {
      return {};
    }

    // Se for valores (apos o nome da coluna), registra
    return {
      data: newRowData,
      siteDeOrigem: row[fixedSiteDeOrigemColumnNumber],
      numeroDoc: row[fixedNumeroDocColumnNumber],
    };
  };

  // Linhas das colunas escolhidas no input
  rows.forEach((row, index) => {
    // let newRowData: Cell[] = [];
    let newRowData: {
      data?: Cell[];
      siteDeOrigem?: Cell;
      numeroDoc?: Cell;
    } | null = null;

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
      }
    } else {
      newRowData = processNewData(row, index);
    }

    if (newRowData?.data) {
      // Others file type (NFES, NFS, REC, RPA, etc)
      let fileKey = `${newRowData?.numeroDoc}-siteOrigem-${newRowData?.siteDeOrigem}.xlsx`;

      if (typeof newRowData?.numeroDoc === "number") {
        // Base file type
        fileKey = `base-${newRowData?.numeroDoc}-siteOrigem-${newRowData?.siteDeOrigem}.xlsx`;
      }

      const keyExists = filesData[fileKey];
      if (!keyExists) {
        filesData[fileKey] = [newRowData?.data];
      } else {
        filesData[fileKey].push(newRowData?.data);
      }
    }
  });

  Object.keys(filesData).forEach(async (fileName) => {
    await saveFile(filesData[fileName], columsNames, `${folder}/${fileName}`);
  });

  // GC
  watchDuplicates = null;
};
