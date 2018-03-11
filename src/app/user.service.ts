import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { HttpClientService } from './http-client.service';

export type User = {
  firstName : string
  lastName: string,
  wizardStep: number
}

@Injectable()
export class UserService {

  private _user: User;

  constructor(
    protected _http: HttpClientService
  ) {

  }

  create(): Observable<User> {
    return this._http.put(this._http.getUrl('user'), {}).map(response => {
      this._user = response.json();

      return this._user;
    });
  };

  update(data: {}): Observable<User> {
    return this._http.patch(this._http.getUrl('user'), data).map(response => {
      this._user = response.json();

      return this._user;
    });
  };

  get(): User {
    return this._user;
  };

  reset(): void {
    this._user = undefined;
  }
}
