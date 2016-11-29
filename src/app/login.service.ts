import { Injectable } from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {LoginFormComponent} from './login-form/login-form.component';

@Injectable()
export class LoginService {

  private modalRef: NgbModalRef;

  constructor(private ngbModal: NgbModal) {

  }

  showForm() {
    this.modalRef = this.ngbModal.open(LoginFormComponent, {
      windowClass: 'modal--wizard'
    });
  };

  hideForm() {
    this.modalRef.close();
  };
}
