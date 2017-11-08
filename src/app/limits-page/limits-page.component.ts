import { Component, OnInit, Injector } from '@angular/core';
import {WizardService} from "../wizard.service";
import {Limit, LimitService} from "../limit.service";
import {PaymentMethod, PaymentMethodService} from "../payment-method.service";
import {Category, CategoryService} from "../category.service";
import { Currency } from '../currency.service';
import Timer = NodeJS.Timer;
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'limits-page',
  templateUrl: './limits-page.component.html',
  styleUrls: ['./limits-page.component.css']
})
export class LimitsPageComponent implements OnInit {

  private isWizardLoading: boolean = false;
  private isWizardNextStepLoading: boolean = false;
  private isWizardCloseLoading: boolean = false;
  private _debounceTimeout: Timer;
  private isLoaded: { [propName: string]: Observable<Limit> } = {};

  public isNewLoaded: Observable<Limit>;
  public limit: Limit;
  public limits: Limit[];
  public paymentMethods: PaymentMethod[];
  public categories: Category[];
  public selectedColors: string[];

  private _initLimits() {
    this.limits = this.limitService.getAll().filter(function(item) { return !item._isRemoved; });
  }

  private _initLimit() {
    this.limit = new Limit({
      value: 0,
      categoryIds: [],
      paymentMethodIds: []
    }, this.injector);
    this.isNewLoaded = null;
  }

  constructor(private limitService: LimitService,
              private wizardService: WizardService,
              private paymentMethodService: PaymentMethodService,
              private categoryService: CategoryService,
              private injector: Injector) {

    this._initLimit();
    this._initLimits();

    this.isLoaded = {};
    this.updateSelectedColors();

    this.paymentMethods = this.paymentMethodService.getAll().filter(function(item) { return !item._isRemoved; });
    this.categories = this.categoryService.getAll().filter(function(item) { return !item._isRemoved; });

  }

  ngOnInit() {
  }

  saveLimit(limit: Limit) {
    if (limit.name && limit.categories.length && limit.paymentMethods.length) {
      if (this._debounceTimeout) {
        clearTimeout(this._debounceTimeout);
      }

      this._debounceTimeout = setTimeout(() => {
        this.isLoaded[limit.id] = this.limitService.update(limit);
        this.isLoaded[limit.id].subscribe(() => {
          this._initLimits();
        });
      }, 300);
    }
  }

  addLimit() {
    if (this.limit.name && this.limit.categories.length && this.limit.paymentMethods.length) {
      this.isNewLoaded = this.limitService.add(this.limit);
      this.isNewLoaded.subscribe((limit: Limit) => {
        this._initLimits();
        return this._initLimit();
      });

      return this.isNewLoaded;
    }
  }

  deleteLimit(limit: Limit) {
    this.isLoaded[limit.id] = this.limitService.delete(limit);
    this.isLoaded[limit.id].subscribe((limit: Limit) => {
      this._initLimits();
    });

    return this.isLoaded[limit.id];
  }

  updateSelectedColors() {
    this.selectedColors = this.limits.map(function(p) { return p.color; });
    if (this.limit.color) {
      this.selectedColors.push(this.limit.color);
    }
  }

  isHintVisible(): boolean {
    return this.wizardService.isLimitHintVisible();
  }

  nextStep() {
    this.isWizardLoading = true;
    this.isWizardNextStepLoading = true;

    return this.wizardService.nextStep().subscribe(() => { this.isWizardLoading = false; this.isWizardNextStepLoading = false });
  }

  close() {
    this.isWizardLoading = true;
    this.isWizardCloseLoading = true;

    return this.wizardService.close().subscribe(() => { this.isWizardLoading = false; this.isWizardCloseLoading = false; });
  }

}
