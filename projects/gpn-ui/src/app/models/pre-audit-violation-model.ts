export interface PreAuditViolationModel {
  document_id: string;
  document_filename: string;
  orgs: Object;
  violations: [
    {
      type: string;
      text: string;
      reason: string;
      notes: [
        {
          note: string;
        }
      ];
    }
  ];
}
