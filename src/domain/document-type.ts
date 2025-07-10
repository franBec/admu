export enum DocumentType {
  DNI = "DNI",
  PASSPORT = "PASSPORT",
  OTHER = "OTHER",
}

export const DOCUMENT_TYPES = [
  { code: DocumentType.DNI, name: "National Identity Document" },
  { code: DocumentType.PASSPORT, name: "Passport" },
  { code: DocumentType.OTHER, name: "Other" },
];
