export interface KindAttributeModel {
  kind: string;
  type: string;
  dictionaryName?: string;
  children?: KindAttributeModel[];
  show?: boolean;
  once?: boolean;
  hideValue?: boolean;
}
