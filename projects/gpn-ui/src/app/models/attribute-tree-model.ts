export interface AttributeTreeModel {
  contract: {
    orgs: Object[];
    subject: {
      confidence: number;
      span: number[];
      span_map: string;
      value: string;
    };
    date: {
      confidence: number;
      span: number[];
      span_map: string;
      value: Date;
    };
    number: {
      confidence: number;
      span: number[];
      span_map: string;
      value: string;
    };
    price: Object;
  };
}
