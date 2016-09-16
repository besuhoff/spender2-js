import { Injectable } from '@angular/core';

@Injectable()
export class LoginService {
  protected _isFormVisible: boolean = false;

  isFormVisible() {
    return this._isFormVisible;
  };

  showForm() {
    this._isFormVisible = true;
  };

  hideForm() {
    this._isFormVisible = false;
  };
}
