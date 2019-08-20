import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { User } from '@app/models/user.model';
import { DocumentInfo } from '@app/models/document-info';
import { Observable, throwError } from '@root/node_modules/rxjs';
import { catchError, map } from '@root/node_modules/rxjs/internal/operators';

const api = '/api';

@Injectable()
export class UserService {

  constructor(private http: HttpClient){ }

  getPermissions() : Observable<Array<{id: number, name: string, description: string}>> {
    return this.http.get<Array<{id: number, name: string, description: string}>>(`${api}/permissions`);
  }

  getPermissionsUser(id: number) : Observable<Array<number>> {
    const urlParams = new HttpParams().set('id', id.toString());
    return this.http.get<Array<number>>(`${api}/permissionsuserid`, { params: urlParams});
  }

  getUsers() : Observable<User[]> {
    return this.http.get<User[]>(`${api}/users`).pipe(map(data => {
        return (data as User[]).map(function(user : any) {
          return {id: user.id, login: user.login, name: user.name, description: user.description, roles: user.roles, arrayRoles: [] };
        })
      }),
      catchError(err => {
        return throwError(err);
      }));
  }

  createUser(user: User) {
    return this.http.post(`${api}/users`, user);
  }

  updateUser(id: number, user: User) {
    const urlParams = new HttpParams().set('id', id.toString());
    return this.http.put(`${api}/users`, user, { params: urlParams});
  }

  deleteUser(id: string){
    const urlParams = new HttpParams().set('id', id.toString());
    return this.http.delete(`${api}/users`, { params: urlParams });
  }
}
