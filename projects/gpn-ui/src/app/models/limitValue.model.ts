export interface LimitValue {
  _id?: string;
  startDate: Date;
  limits: SubLimit[];
}

export interface SubLimit {
  lowerLimit: number;
  upperLimit: number;
  limitValue: number;
}
