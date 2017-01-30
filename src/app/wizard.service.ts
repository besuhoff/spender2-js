import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import { UserService } from './user.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {WizardComponent} from './wizard/wizard.component';

@Injectable()
export class WizardService {

  private _isHelpHintShown: boolean = false;
  private modalRef: NgbModalRef;

  private _openModal() {
    this.modalRef = this.ngbModal.open(WizardComponent, {
      windowClass: 'modal--wizard'
    });

    this.modalRef.componentInstance.init(this);
  }

  constructor(
    private userService: UserService,
    private router: Router,
    private ngbModal: NgbModal
  ) {
    if (this.hasModal()) {
      this._openModal();
    }
  }

  step(): number {
    return this.userService.get() && this.userService.get().wizardStep || -1;
  }

  isActive(): boolean {
    return this.step() !== -1;
  }

  hasModal(): boolean {
    return this.step() === 1;
  }

  isHelpHintVisible(): boolean {
    return this._isHelpHintShown;
  }

  isCategoryHintVisible(): boolean {
    return this.step() === 2;
  }

  isPaymentMethodHintVisible(): boolean {
    return this.step() === 3;
  }

  isLimitHintVisible(): boolean {
    return this.step() === 4;
  }

  isIncomeCategoryHintVisible(): boolean {
    return this.step() === 5;
  }

  isExpenseHintVisible(): boolean {
    return this.step() === 6;
  }

  isIncomeHintVisible(): boolean {
    return this.step() === 7;
  }

  isTransferHintVisible(): boolean {
    return this.step() === 8;
  }

  isHistoryHintVisible(): boolean {
    return this.step() === 9;
  }

  goToCurrentHint() {
    if (this.isCategoryHintVisible()) {
      this.router.navigate(['/categories']);
    }

    if (this.isPaymentMethodHintVisible()) {
      this.router.navigate(['/payment-methods']);
    }

    if (this.isLimitHintVisible()) {
      this.router.navigate(['/limits']);
    }

    if (this.isIncomeCategoryHintVisible()) {
      this.router.navigate(['/income-categories']);
    }

    if (this.isExpenseHintVisible()) {
      this.router.navigate(['/expenses']);
    }

    if (this.isIncomeHintVisible()) {
      this.router.navigate(['/income']);
    }

    if (this.isTransferHintVisible()) {
      this.router.navigate(['/transfers']);
    }

    if (this.isHistoryHintVisible()) {
      this.router.navigate(['/history']);
    }
  }

  nextStep() {
    return this.userService.update({ wizardStep: this.step() + 1 }).map((data) => {
      this.modalRef && this.modalRef.close();
      this.goToCurrentHint();
      return data;
    });
  }

  reset() {
    this._openModal();
    return this.userService.update({ wizardStep: 1 });
  }

  close() {
    return this.userService.update({ wizardStep: -1 }).map((data) => {
      this.modalRef && this.modalRef.close();
      this._isHelpHintShown = true;

      setTimeout(() => {
        this._isHelpHintShown = false;
      }, 5000);

      return data;
    });
  }
}
