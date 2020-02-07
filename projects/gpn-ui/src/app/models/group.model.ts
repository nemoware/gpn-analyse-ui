export interface GroupInfo {
  _id: string;
  cn: string;
  roleString: string;
  roles: Array<{
    _id: string;
    name: string;
    description: string;
    appPage: string;
  }>;
}
