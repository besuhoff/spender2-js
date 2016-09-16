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

@Injectable()
export class CacheService {

  constructor(
    private incomeCategoryService: IncomeCategoryService,
    private incomeService: IncomeService,
    private categoryService: CategoryService,
    private expenseService: ExpenseService,
    private paymentMethodService: PaymentMethodService,
    private currencyService: CurrencyService
  ) {

  }

  refreshPaymentMethods() {
    this.paymentMethodService.loadAll(true)
      .subscribe((paymentMethods) => {
        this.paymentMethodService.recordListChange();
      });
  }

  loadAll(reload: boolean): Observable<{}> {
    return Observable.forkJoin([
      this.incomeCategoryService.loadAll(reload),
      this.categoryService.loadAll(reload),
      this.expenseService.loadAll(reload),
      this.incomeService.loadAll(reload),
      this.currencyService.loadAll(reload),
      this.paymentMethodService.loadAll(reload)
    ]).map(results => {
      [
        this.incomeService,
        this.expenseService,
        this.paymentMethodService,
        this.incomeCategoryService,
        this.categoryService,
        this.currencyService
      ].forEach(function(service) {
        service.recordListChange();
      });

      this.initPaymentMethodDependencies();
      return results;
    });
  }

  initPaymentMethodDependencies(): void {
    this.incomeService.getListChangedAt().subscribe(() => this.refreshPaymentMethods());
    this.expenseService.getListChangedAt().subscribe(() => this.refreshPaymentMethods());
  };
}
