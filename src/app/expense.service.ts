import { Injectable, Injector } from '@angular/core';

import {HttpClientService} from "./http-client.service";
import { DataEntity, DataService } from './data.service';
import { Income, IncomeUpdateData, IncomeService } from './income.service';
import { Category, CategoryUpdateData, CategoryService } from './category.service';
import { PaymentMethod, PaymentMethodUpdateData, PaymentMethodService } from './payment-method.service';

export type ExpenseUpdateData = {
  id: number,
  amount: number,
  comment: string,
  userId: number,
  createdAt: Date,
  updatedAt: Date,
  categoryId?: number,
  paymentMethodId?: number,
  targetIncomeId?: number,
};

export class Expense extends DataEntity {
  public paymentMethod: PaymentMethod;
  public category: Category;
  public targetIncome: Income;
  public amount: number;
  public comment: string;
  public userId: number;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data, injector: Injector) {
    super(data, injector);

    this.amount = +data.amount;
    this.comment = data.comment;
    this.userId = +data.userId;
    this.createdAt = new Date(data.createdAt);
    this.updatedAt = new Date(data.updatedAt);

    let categoryService = injector.get(CategoryService);
    let incomeService = injector.get(IncomeService);
    let paymentMethodService = injector.get(PaymentMethodService);

    this.category = categoryService.getOne(+data.categoryId);
    categoryService.getListChangedAt().subscribe(() => {
      this.category = categoryService.getOne(+data.categoryId);
    });

    this.paymentMethod = paymentMethodService.getOne(+data.paymentMethodId);
    paymentMethodService.getListChangedAt().subscribe(() => {
      this.paymentMethod = paymentMethodService.getOne(+data.paymentMethodId);
    });

    if (+data.targetIncomeId) {
      this.targetIncome = incomeService.getOne(+data.targetIncomeId);
      incomeService.getListChangedAt().subscribe(() => {
        this.targetIncome = incomeService.getOne(+data.targetIncomeId);
        if (this.targetIncome) {
          this.targetIncome.sourceExpense = this;
        }
      });
      if (this.targetIncome) {
        this.targetIncome.sourceExpense = this;
      }
    }
  }

  toUpdateData(): ExpenseUpdateData {
    let data: ExpenseUpdateData = {
      id: this.id,
      amount: this.amount,
      comment: this.comment,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      categoryId: null,
      paymentMethodId: null,
      targetIncomeId: null,
    };

    if (this.category) {
      data.categoryId = this.category.id;
    }
    if (this.paymentMethod) {
      data.paymentMethodId = this.paymentMethod.id;
    }
    if (this.targetIncome) {
      data.targetIncomeId = this.targetIncome.id;
    }

    return data;
  }
}

@Injectable()
export class ExpenseService extends DataService<Expense> {
  constructor(
    protected _http: HttpClientService,
    protected injector: Injector
  ) {
    super(_http, injector);
  }

  protected _getPluralKey(): string {
    return 'expenses';
  }

  protected _getEntityClass() {
    return Expense;
  }
}
