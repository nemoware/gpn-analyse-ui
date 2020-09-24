import { HeaderModel } from '@app/models/header-model';

export interface Charter {
  _id: string;
  filename: string;
  fromDate: Date;
  toDate: Date;
  documentType: string;
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
    attributes: Object;
    headers: [HeaderModel];
    warnings: any[];
  };
  user: {
    attributes: Object;
    author: { _id: string; login: String };
    updateDate: Date;
  };
  parseError: string;
  state: number;
}
