import { HeaderModel } from '@app/models/header-model';
import { AttributeModel } from '@app/models/attribute-model';

export interface Document {
  _id: string;
  auditId: string;
  filename: string;
  documentDate: Date; //TODO: deprecated, moved to attributes
  documentEndDate: Date;
  documentType: string;
  documentNumber: string; //TODO: deprecated, moved to attributes
  parentId: string;
  isActive: boolean;
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
    attributes: [AttributeModel];
    headers: [HeaderModel];
    warnings: any[];
  };
  user: {
    attributes: [AttributeModel];
    author: { _id: string; login: String };
    updateDate: Date;
  };
  parseError: string;
  audit: {
    subsidiaryName: string;
    auditStart: Date;
    auditEnd: Date;
    status: string;
    ftpUrl: string;
  };
  statusAudit: string;
  starred: boolean;
  state?: number;
  primary_subject?: string;
}
