export class User{
  constructor(
    public id: number,
    public login: string,
    public name: string,
    public description: string,
    public roles: Array<number>
  ) {
  }

}
