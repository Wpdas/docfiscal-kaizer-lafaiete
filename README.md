# Sobre

Programa para processar dados de notas fiscais e retornar arquivos separados por Base-numero, NFES, NFS, REC, RPA, outros

## Como Usar

Para rodar essa aplicação, você precisa instalar o **Node v16.0.0** e depois a dependência **Yarn**.

Antes da primeira utilização, no terminal (CMD) vá para a pasta raíz do projeto e rode o comando:

```st
yarn install
```

1 - Arquivos suportados: `.xlsx` e `.csv`; </br>
2 - Coloque o arquivo de entrada na pasta `src/input/entrada.xlsx`; </br>
3 - Os arquivos finais vão ser gerados na pasta `src/output/`; </br>
4 - Abra o arquivo `src/index.ts` e edite a forma que você quer processar o arquivo; </br>
5 - No terminal (CMD), vá para o diretório raíz do projeto e rode o seguinte comando:

```sh
yarn execute
```

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
import { multiProcessXLSX, multiProcessCSV } from "./multiProcess";

multiProcessCSV([
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
```
