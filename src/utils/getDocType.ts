export const getDocType = (input: any[], indexToCheck: number) => {
  const field = input[indexToCheck];
  if (typeof field === "number") {
    return "Number";
  }

  if (String(field).toUpperCase() === "NFES") {
    return "NFES";
  }

  if (String(field).toUpperCase() === "NFS") {
    return "NFS";
  }

  if (String(field).toUpperCase() === "REC") {
    return "REC";
  }

  if (String(field).toUpperCase() === "RPA") {
    return "RPA";
  }
};
