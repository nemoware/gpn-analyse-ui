export interface DocumentParser {
  _id: string;
  idAudit: string;
  name: string;
  documentDate: Date;
  documentType: string;
  documentNumber: string;
  paragraphs: Array<{ paragraphHeader: Object; paragraphBody: Object }>;
}
