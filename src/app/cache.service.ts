import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkJoin';

import { Expense, ExpenseService } from './expense.service';
import { Income, IncomeService } from './income.service';
import { Category, CategoryService } from './category.service';
import { IncomeCategory, IncomeCategoryService } from './income-category.service';
import { PaymentMethod, PaymentMethodService } from './payment-method.service';
import { Currency, CurrencyService } from './currency.service';
import {Subject} from "rxjs/Subject";
import {DataEntity} from "./data.service";
import {Subscription} from "rxjs/Subscription";

@Injectable()
export class CacheService {

  private _isLoaded: Subject<boolean> = new Subject();
  private _hasData: boolean = false;

  private incomeServiceListChangedAt: Subscription;
  private expenseServiceListChangedAt: Subscription;

  private isPartLoaded: {
    incomeCategories: Subject<boolean>,
    categories: Subject<boolean>,
    expenses: Subject<boolean>,
    incomes: Subject<boolean>,
    currencies: Subject<boolean>,
    paymentMethods: Subject<boolean>
  } = {
    incomeCategories: new Subject(),
    categories: new Subject(),
    expenses: new Subject(),
    incomes: new Subject(),
    currencies: new Subject(),
    paymentMethods: new Subject()
  };

  constructor(
    private incomeCategoryService: IncomeCategoryService,
    private incomeService: IncomeService,
    private categoryService: CategoryService,
    private expenseService: ExpenseService,
    private paymentMethodService: PaymentMethodService,
    private currencyService: CurrencyService
  ) {

  }

  isLoaded() {
    return this._isLoaded;
  }

  isIncomeCategoriesLoaded() {
    return this.isPartLoaded.incomeCategories;
  }

  isIncomesLoaded() {
    return this.isPartLoaded.incomes;
  }

  isCategoriesLoaded() {
    return this.isPartLoaded.categories;
  }

  isExpensesLoaded() {
    return this.isPartLoaded.expenses;
  }

  isCurrenciesLoaded() {
    return this.isPartLoaded.currencies;
  }

  isPaymentMethodsLoaded() {
    return this.isPartLoaded.paymentMethods;
  }

  refreshPaymentMethods() {
    this.paymentMethodService.resetAll().loadAll()
      .subscribe((paymentMethods) => {
        this.paymentMethodService.recordListChange();
      });
  }

  resetAll() {
    this._hasData = false;

    [
      this.incomeService,
      this.expenseService,
      this.incomeCategoryService,
      this.categoryService,
      this.paymentMethodService,
      this.currencyService
    ].forEach(function(service) {
      service.resetAll();
    });

    for (let part in this.isPartLoaded) {
      this.isPartLoaded[part].next(false);
    }

    this.incomeServiceListChangedAt.unsubscribe();
    this.expenseServiceListChangedAt.unsubscribe();
  }

  hasData(): boolean {
    return this._hasData;
  }

  loadAll(): Observable<DataEntity[][]> {
    if (!this.hasData()) {
      this._isLoaded.next(false);
    }

    return Observable.forkJoin([
      this.incomeCategoryService.loadAll()
        .map((data) => { if (!this.hasData()) { this.isPartLoaded.incomeCategories.next(true); } return data }),
      this.categoryService.loadAll()
        .map((data) => { if (!this.hasData()) { this.isPartLoaded.categories.next(true); } return data }),
      this.expenseService.loadAll()
        .map((data) => { if (!this.hasData()) { this.isPartLoaded.expenses.next(true); } return data }),
      this.incomeService.loadAll()
        .map((data) => { if (!this.hasData()) { this.isPartLoaded.incomes.next(true); } return data }),
      this.currencyService.loadAll()
        .map((data) => { if (!this.hasData()) { this.isPartLoaded.currencies.next(true); } return data }),
      this.paymentMethodService.loadAll()
        .map((data) => { if (!this.hasData()) { this.isPartLoaded.paymentMethods.next(true); } return data }),
    ]).map(results => {
      if (!this.hasData()) {

        [
          this.incomeService,
          this.expenseService,
          this.incomeCategoryService,
          this.categoryService,
          this.paymentMethodService,
          this.currencyService
        ].forEach(function(service) {
          service.recordListChange();
        });

        this._isLoaded.next(true);
        this._hasData = true;
        this.initPaymentMethodDependencies();
      }
      return results;
    });
  }

  initPaymentMethodDependencies(): void {
    this.incomeServiceListChangedAt = this.incomeService.getListChangedAt().subscribe(() => this.refreshPaymentMethods());
    this.expenseServiceListChangedAt = this.expenseService.getListChangedAt().subscribe(() => this.refreshPaymentMethods());
  };
}
