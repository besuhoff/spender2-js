import { Injectable, Injector } from '@angular/core';

import {HttpClientService} from "./http-client.service";
import { DataEntity, DataService } from './data.service';
import { Expense } from './expense.service';
import { IncomeCategory, IncomeCategoryUpdateData, IncomeCategoryService } from './income-category.service';
import { PaymentMethod, PaymentMethodUpdateData, PaymentMethodService } from './payment-method.service';

export type IncomeUpdateData = {
  id: number,
  amount: number,
  comment: string,
  userId: number,
  createdAt: Date,
  updatedAt: Date,
  incomeCategory?: IncomeCategoryUpdateData,
  paymentMethod?: PaymentMethodUpdateData,
};

export class Income extends DataEntity {
  public paymentMethod: PaymentMethod;
  public incomeCategory: IncomeCategory;
  public sourceExpense: Expense;
  public amount: number;
  public comment: string;
  public userId: number;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data, injector: Injector) {
    super(data, injector);

    let incomeCategoryService = injector.get(IncomeCategoryService);
    let paymentMethodService = injector.get(PaymentMethodService);

    this.amount = +data.amount;
    this.comment = data.comment;
    this.userId = +data.userId;
    this.createdAt = new Date(data.createdAt);
    this.updatedAt = new Date(data.updatedAt);

    this.incomeCategory = incomeCategoryService.getOne(+data.incomeCategoryId);
    incomeCategoryService.getListChangedAt().subscribe(() => {
      this.incomeCategory = incomeCategoryService.getOne(+data.incomeCategoryId);
    });

    this.paymentMethod = paymentMethodService.getOne(+data.paymentMethodId);
    paymentMethodService.getListChangedAt().subscribe(() => {
      this.paymentMethod = paymentMethodService.getOne(+data.paymentMethodId);
    });
  }

  toUpdateData(): IncomeUpdateData {
    let data: IncomeUpdateData = {
      id: this.id,
      amount: this.amount,
      comment: this.comment,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };

    if (this.incomeCategory) {
      data.incomeCategory = this.incomeCategory.toUpdateData();
    }
    if (this.paymentMethod) {
      data.paymentMethod = this.paymentMethod.toUpdateData();
    }

    return data;
  }
}

@Injectable()
export class IncomeService extends DataService<Income> {
  constructor(
    protected _http: HttpClientService,
    protected injector: Injector
  ) {
    super(_http, injector);
  }

  protected _getPluralKey(): string {
    return 'incomes';
  }

  protected _getEntityClass() {
    return Income;
  }
}
