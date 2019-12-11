export interface ViolationModel {
  document: {
    id: string;
    attribute: string;
    attributeValue: string;
    date: Date;
    number: string;
    type: string;
    name: string;
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
    attributeValue: string;
    date: string;
    type: string;
    name: string;
  };
  violation_type: string;
}
