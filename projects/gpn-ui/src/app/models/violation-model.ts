export interface ViolationModel {
  document: {
    id: string;
    number: string;
    date: Date;
    type: string;
  };
  founding_document: {
    id: string;
    date: Date;
    type: string;
    name: string;
  };
  reference: {
    id: string;
    attribute: string;
  };
  violation_type: any;
  violation_reason: {
    id: string;
    number: string;
    type: string;
    date: Date;
    charters: [{ id: string; date: Date }];
    contract: {
      number: string;
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
