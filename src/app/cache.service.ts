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

@Injectable()
export class CacheService {

  protected _isLoaded: Subject<boolean> = new Subject();

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
    this.paymentMethodService.loadAll(true)
      .subscribe((paymentMethods) => {
        this.paymentMethodService.recordListChange();
      });
  }

  loadAll(reload: boolean): Observable<{}> {
    this._isLoaded.next(false);

    for (let part in this.isPartLoaded) {
      this.isPartLoaded[part].next(false);
    }

    return Observable.forkJoin([
      this.incomeCategoryService.loadAll(reload).map((data) => { this.isPartLoaded.incomeCategories.next(true); return data }),
      this.categoryService.loadAll(reload).map((data) => { this.isPartLoaded.categories.next(true); return data }),
      this.expenseService.loadAll(reload).map((data) => { this.isPartLoaded.expenses.next(true); return data }),
      this.incomeService.loadAll(reload).map((data) => { this.isPartLoaded.incomes.next(true); return data }),
      this.currencyService.loadAll(reload).map((data) => { this.isPartLoaded.currencies.next(true); return data }),
      this.paymentMethodService.loadAll(reload).map((data) => { this.isPartLoaded.paymentMethods.next(true); return data }),
    ]).map(results => {
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
      this.initPaymentMethodDependencies();
      return results;
    });
  }

  initPaymentMethodDependencies(): void {
    this.incomeService.getListChangedAt().subscribe(() => this.refreshPaymentMethods());
    this.expenseService.getListChangedAt().subscribe(() => this.refreshPaymentMethods());
  };
}