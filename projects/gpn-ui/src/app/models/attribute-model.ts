export interface AttributeModel {
  confidence: number;
  kind: string;
  value: string;
  span: number[];
  span_map: string;
  parent: string;
  num: number;
  key: string;
  changed?: boolean;
}
