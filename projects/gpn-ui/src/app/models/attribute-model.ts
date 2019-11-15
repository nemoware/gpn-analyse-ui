export interface AttributeModel {
  confidence: number;
  display_value: string;
  kind: string;
  value: string;
  span: number[];
  span_map: string;
  parent: string;
}
