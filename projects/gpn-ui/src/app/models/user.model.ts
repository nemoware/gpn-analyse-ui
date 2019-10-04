export interface UserInfo {
  _id: string;
  login: string;
  name: string;
  roleString: string;
  roles: Array<{
    _id: string;
    name: string;
    description: string;
    appPage: string;
  }>;
}
