export interface Audit {
  id: string;
  subsidiaryName: string;
  subsidiary: {
    _id: string;
    name: string;
  };
  ftpUrl: string;
  auditStart: Date;
  auditEnd: Date;
  checkedDocumentCount: number;
  statuses: [
    { date: Date; status: { _id: string; name: string }; comment: string }
  ];
  comments: [
    {
      date: Date;
      text: string;
      author: { _id: string; login: string; name: string };
    }
  ];
  createDate: Date;
  author: { _id: string; login: string; name: string };
}
