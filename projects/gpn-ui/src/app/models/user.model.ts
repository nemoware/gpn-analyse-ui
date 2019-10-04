export interface UserInfo {
  _id: string;
  login: string;
  name: string;
  rolesName: string;
  roles: Array<{
    _id: string;
    name: string;
    description: string;
    app_page: string;
  }>;
}
