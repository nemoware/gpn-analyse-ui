export interface EventApp {
  _id: string;
  login: string;
  eventType: {
    _id: string;
    name: string;
  };
  date: Date;
}

export interface DataSourceEvent {
  count: number;
  items: EventApp[];
}
