export interface Audit {
  _id: string;
  name: string;
  company: {
    name: string;
  };
  ftpUrl: string;
  auditStart: Date;
  auditEnd: Date;
  documentCount: number;
  endAudit: string;
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
}
