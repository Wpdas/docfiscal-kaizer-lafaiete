import { multiProcess } from "./multiProcess";

multiProcess([
  {
    pasta: "principal", // com filtro de duplicatas
    numeroDasColunasParaIncluir: [17, 1, 15, 135, 13],
    colunaNumeroDoc: 17,
    colunaSiteDeOrigem: 13,
    filtro: {
      colunaDeConhecimentoDeFreteDaNF: 15,
      colunaCNPJcolumnNumber: 135,
    },
  },
  {
    pasta: "imposto", // com filtro de duplicatas
    numeroDasColunasParaIncluir: [17, 1, 15, 135, 13],
    colunaNumeroDoc: 17,
    colunaSiteDeOrigem: 13,
    filtro: {
      colunaDeConhecimentoDeFreteDaNF: 15,
      colunaCNPJcolumnNumber: 135,
    },
  },
  {
    pasta: "produto", // sem filtro de duplicatas
    numeroDasColunasParaIncluir: [17, 1, 15, 135, 13],
    colunaNumeroDoc: 17,
    colunaSiteDeOrigem: 13,
  },
]);
