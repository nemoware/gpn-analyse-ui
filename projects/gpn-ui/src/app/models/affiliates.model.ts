export interface Affiliates {
  name: string;
  shortName: string;
  reasons: [
    {
      text: string;
      date: Date;
    }
  ];
  share: number;
  company: string;
}

export interface DataSourceAffiliates {
  count: number;
  items: Affiliates[];
}
