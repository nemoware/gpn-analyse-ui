import { ViolationModel } from '@app/models/violation-model';

export interface Audit {
  _id: string;
  subsidiaryName: string;
  subsidiary: {
    // _id: string;
    name: string;
  };
  ftpUrl: string;
  auditStart: Date;
  auditEnd: Date;
  checkedDocumentCount: number;
  status: string;
  createDate: Date;
  author: { _id: string; login: string; name: string };
  typeViewResult: number;
  bookValues: any[];
  selectedRows: ViolationModel[];
}

export interface DataSourceAudit {
  count: number;
  items: Audit[];
}
