import readXlsxFile from "read-excel-file/node";
import { processXLSXFile } from "./processXLSXFile";
import { processCSVFile } from "./processCSVFile";

type Input = {
  pasta: string;
  numeroDasColunasParaIncluir: number[];
  colunaNumeroDoc: number;
  colunaSiteDeOrigem: number;
  filtro?: {
    colunaDeConhecimentoDeFreteDaNF?: number;
    colunaCNPJcolumnNumber?: number;
  };
};

// .CSV File
export const multiProcessCSV = (input: Input[]) => {
  // Entrada do arquivo
  const inputDir = `${__dirname}/input/entrada.csv`;

  let processCount = 0;

  input.forEach(async (currentInput) => {
    await processCSVFile(
      inputDir,
      currentInput.pasta,
      currentInput.numeroDasColunasParaIncluir,
      currentInput.colunaNumeroDoc,
      currentInput.colunaSiteDeOrigem,
      currentInput.filtro?.colunaDeConhecimentoDeFreteDaNF,
      currentInput.filtro?.colunaCNPJcolumnNumber
    );

    processCount++;
    if (processCount === input.length) {
      console.log("Processo finalizado!");
    }
  });
};

// .XLSX File
export const multiProcessXLSX = (input: Input[]) => {
  // Entrada do arquivo
  const inputDir = `${__dirname}/input/entrada.xlsx`;

  readXlsxFile(inputDir).then(async (rows) => {
    let processCount = 0;

    input.forEach(async (currentInput) => {
      await processXLSXFile(
        rows,
        currentInput.pasta,
        currentInput.numeroDasColunasParaIncluir,
        currentInput.colunaNumeroDoc,
        currentInput.colunaSiteDeOrigem,
        currentInput.filtro?.colunaDeConhecimentoDeFreteDaNF,
        currentInput.filtro?.colunaCNPJcolumnNumber
      );

      processCount++;
      if (processCount === input.length) {
        console.log("Processo finalizado!");
      }
    });
  });
};
