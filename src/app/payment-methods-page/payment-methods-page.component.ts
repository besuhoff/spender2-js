import { Component, OnInit, Injector } from '@angular/core';
import {WizardService} from "../wizard.service";
import {PaymentMethod, PaymentMethodService} from "../payment-method.service";
import {Currency, CurrencyService} from "../currency.service";
import Timer = NodeJS.Timer;

@Component({
  selector: 'payment-methods-page',
  templateUrl: './payment-methods-page.component.html',
  styleUrls: ['./payment-methods-page.component.css']
})
export class PaymentMethodsPageComponent implements OnInit {

  private paymentMethod: PaymentMethod;
  private paymentMethods: PaymentMethod[];
  private currencies: Currency[];
  private isNewLoaded: Promise<PaymentMethod>;
  private isLoaded: {};
  private selectedColors: string[];
  private loading: boolean = false;
  private _debounceTimeout: Timer;

  private _initMethods() {
    this.paymentMethods = this.paymentMethodService.getAll().filter(function(item) { return !item._isRemoved; });
  }

  private _initMethod() {
    this.paymentMethod = new PaymentMethod({
      initialAmount: 0
    }, this.injector);
    this.isNewLoaded = null;
  }

  constructor(private paymentMethodService: PaymentMethodService,
              private wizardService: WizardService,
              private currencyService: CurrencyService,
              private injector: Injector) {

    this._initMethod();
    this._initMethods();

    this.isLoaded = {};
    this.updateSelectedColors();

    this.currencies = this.currencyService.getAll();

  }

  ngOnInit() {
  }

  saveMethod(paymentMethod) {
    if (paymentMethod.name && paymentMethod.currency) {
      if (this._debounceTimeout) {
        clearTimeout(this._debounceTimeout);
      }

      this._debounceTimeout = setTimeout(() => {
        this.isLoaded[paymentMethod.id] = this.paymentMethodService.update(paymentMethod).toPromise().then(() => {
          this._initMethods();
        });
      }, 300);
    }
  }

  addMethod() {
    if (this.paymentMethod.name && this.paymentMethod.currency) {
      this.isNewLoaded = this.paymentMethodService.add(this.paymentMethod).toPromise().then((paymentMethod) => {
        this._initMethods();
        return this._initMethod();
      });

      return this.isNewLoaded;
    }
  }

  deleteMethod(paymentMethod) {
    this.isLoaded[paymentMethod.id] = this.paymentMethodService.delete(paymentMethod).toPromise().then(() => {
      this._initMethods();
    });

    return this.isLoaded[paymentMethod.id];
  }

  updateSelectedColors() {
    this.selectedColors = this.paymentMethods.map(function(p) { return p.color; });
    if (this.paymentMethod.color) {
      this.selectedColors.push(this.paymentMethod.color);
    }
  }

  isHintVisible(): boolean {
    return this.wizardService.isTransferHintVisible();
  }

  nextStep() {
    this.loading = true;

    return this.wizardService.nextStep().subscribe(() => this.loading = false);
  }

  close() {
    this.loading = true;

    return this.wizardService.close().subscribe(() => this.loading = false);
  }
}