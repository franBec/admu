export enum DocumentType {
  DNI = "dni",
  Passport = "passport",
  Other = "other",
}

export const DOCUMENT_TYPES = [
  { code: DocumentType.DNI, name: "National Identity Document" },
  { code: DocumentType.Passport, name: "Passport" },
  { code: DocumentType.Other, name: "Other" },
];
