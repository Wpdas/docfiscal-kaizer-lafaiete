import fs from "fs";
const CsvReadableStream = require("csv-reader");
import { saveFile } from "./saveFile";

export const processCSVFile = async (
  inputDir: string,
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

  // Seleciona as colunas escolhidas no input
  const processNewData = (row: string[], index: number) => {
    let newRowData: any[] = [];
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

  // Read doc
  const inputStream = fs.createReadStream(inputDir, "utf8");
  let index = 0;

  inputStream
    .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true }))
    .on("data", function (row: any) {
      let rowData: {
        data?: any[];
        siteDeOrigem?: any;
        numeroDoc?: any;
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

          rowData = processNewData(row, index);
        }
      } else {
        rowData = processNewData(row, index);
      }

      if (rowData?.data) {
        // Others file type (NFES, NFS, REC, RPA, etc)
        let fileKey = `${rowData?.numeroDoc}-siteOrigem-${rowData?.siteDeOrigem}.xlsx`;

        if (typeof rowData?.numeroDoc === "number") {
          // Base file type
          fileKey = `base-${rowData?.numeroDoc}-siteOrigem-${rowData?.siteDeOrigem}.xlsx`;
        }

        const keyExists = filesData[fileKey];
        if (!keyExists) {
          filesData[fileKey] = [rowData?.data];
        } else {
          filesData[fileKey].push(rowData?.data);
        }
      }

      index++;
    })
    .on("end", function () {
      // Salva os arquivos
      Object.keys(filesData).forEach(async (fileName) => {
        await saveFile(
          filesData[fileName],
          columsNames,
          `${folder}/${fileName}`
        );
      });
    });

  // GC
  watchDuplicates = null;
};
