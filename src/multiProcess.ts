import readXlsxFile from "read-excel-file/node";
import { processFile } from "./processFile";

type Input = {
  pasta: string;
  numeroDasColunasParaIncluir: number[];
  filtro?: {
    colunaDeConhecimentoDeFreteDaNF?: number;
    colunaCNPJcolumnNumber?: number;
  };
};

export const multiProcess = (input: Input[]) => {
  // Entrada do arquivo
  const inputDir = `${__dirname}/input/entrada.xlsx`;
  readXlsxFile(inputDir).then(async (rows) => {
    let processCount = 0;

    input.forEach(async (currentInput) => {
      await processFile(
        rows,
        currentInput.pasta,
        currentInput.numeroDasColunasParaIncluir,
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
