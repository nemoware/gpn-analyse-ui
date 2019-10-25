import { HeaderModel } from '@app/models/header-model';

export interface Document {
  _id: string;
  auditId: string;
  filename: string;
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
    headers: [HeaderModel];
  };
  user: {
    attributes: Object;
    author: { _id: string; login: String };
    updateDate: Date;
  };
  parseError: string;
}
