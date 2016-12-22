import { Injectable } from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {LoginFormComponent} from './login-form/login-form.component';

@Injectable()
export class LoginService {

  private modalRef: NgbModalRef;

  constructor(private ngbModal: NgbModal) {

  }

  hasForm(): boolean {
    return !!this.modalRef;
  }

  showForm(): void {
    this.modalRef = this.ngbModal.open(LoginFormComponent, {
      windowClass: 'modal--wizard'
    });
  };

  hideForm(): void {
    this.modalRef.close();
    this.modalRef = null;
  };
}
