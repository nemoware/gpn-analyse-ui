import { KindAttributeModel } from '@app/models/kind-attribute-model';

export interface DocumentTypeModel {
  _id: string;
  attributes: KindAttributeModel[];
}
