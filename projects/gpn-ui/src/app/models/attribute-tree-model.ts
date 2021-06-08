export interface AttributeTreeModel {
  contract: {
    orgs: [
      {
        type: {
          confidence: number;
          span: number[];
          span_map: string;
          value: string;
        };
        name: {
          confidence: number;
          span: number[];
          span_map: string;
          value: string;
        };
        alias: {
          confidence: number;
          span: number[];
          span_map: string;
          value: string;
        };
        alt_name: {
          confidence: number;
          span: number[];
          span_map: string;
          value: string;
        };
      }
    ];
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
    price: {
      confidence: number;
      amount: {
        confidence: number;
        span: number[];
        span_map: string;
        value: number;
      };
      currency: {
        confidence: number;
        span: number[];
        span_map: string;
        value: string;
      };
      span: number[];
      span_map: string;
    };
  };
}
