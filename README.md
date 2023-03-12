# Sobre

Programa para processar dados de notas fiscais e retornar arquivos separados por Base-numero, NFES, NFS, REC, RPA

## Como Usar

Abra o arquivo src/index.ts e edite a forma que você quer processar o arquivo.

**pasta:** Nome da pasta onde os arquivos serão gerados </br>
**numeroDasColunasParaIncluir:** Lista dos números das colunas a serem incluídas no processo </br>
**filtro:** Se quiser filtrar, excluindo linhas na qual o "Número de Conhecimento de Frete da NF" e "CNPJ" se repetem, basta incluir o dado do filtro:

```js
filtro: {
  colunaDeConhecimentoDeFreteDaNF: 15,
  colunaCNPJcolumnNumber: 135,
},
```

Exemplo de multiplos processos:

```js
import { multiProcess } from "./multiProcess";

multiProcess([
  {
    pasta: "principal", // com filtro de duplicatas
    numeroDasColunasParaIncluir: [17, 1, 15, 135],
    filtro: {
      colunaDeConhecimentoDeFreteDaNF: 15,
      colunaCNPJcolumnNumber: 135,
    },
  },
  {
    pasta: "imposto", // com filtro de duplicatas
    numeroDasColunasParaIncluir: [17, 1, 15, 135],
    filtro: {
      colunaDeConhecimentoDeFreteDaNF: 15,
      colunaCNPJcolumnNumber: 135,
    },
  },
  {
    pasta: "produto", // sem filtro de duplicatas
    numeroDasColunasParaIncluir: [17, 1, 15, 135],
  },
]);
```
