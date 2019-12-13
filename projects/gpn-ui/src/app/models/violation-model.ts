export interface ViolationModel {
  document: {
    id: string;
    number: string;
    type: string;
  };
  founding_document: {
    id: string;
    date: Date;
  };
  reference: {
    id: string;
    attribute: string;
    text: string;
  };
  violation_type: any;
  violation_reason: {
    charters: [{ id: string; date: Date }];
    contract: {
      id: string;
      number: string;
      type: string;
      date: Date;
      org_type: string;
      org_name: string;
    };
    protocol: {
      org_structural_level: string;
      date: Date;
    };
  };
}
