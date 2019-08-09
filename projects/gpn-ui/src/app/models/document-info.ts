 export interface DocumentInfo {
   id: number;
   json_name_new: string;
   json_value: string;
   json_path: number;
   dtc: number;
   id_type: number;
   createdAt: Date;
   updatedAt: Date;
 }

 export interface KindTag {
   id: number;
   name: string;
   name_color: string;
   createdAt: Date;
   updatedAt: Date;
   name_class: string;
 }
