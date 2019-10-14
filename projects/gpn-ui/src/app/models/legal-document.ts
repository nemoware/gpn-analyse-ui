export interface LegalDocument {
  _id?: string;
  filename?: string;
  normal_text?: string;
  tags?: Array<Tag>;
  tokenization_maps: {};
}

export interface Tag {
  kind: string;
  value: string;
  span: Array<number>;
}
