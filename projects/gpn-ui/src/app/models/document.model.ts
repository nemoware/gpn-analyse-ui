export interface Document {
  _id: string;
  auditId: string;
  name: string;
  documentDate: Date;
  documentType: string;
  documentNumber: string;
  parentId: string;
  paragraphs: [{ paragraphHeader: Object; paragraphBody: Object }];
  analysis: {
    original_text: string;
    normal_text: string;
    import_timestamp: Date;
    analyze_timestamp: Date;
    tokenization_maps: {
      words: [[number, number]];
    };
    checksum: number;
    attributes: Object;
  };
}
