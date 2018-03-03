import { Injectable, Injector } from '@angular/core';

import { HttpClientService } from "./http-client.service";
import { DataEntity, DataService } from './data.service';
import { Currency, CurrencyUpdateData, CurrencyService } from './currency.service';


export type PaymentMethodUpdateData = {
  id: number,
  name: string,
  color: string,
  userId: number,
  incomes: number,
  expenses: number,
  initialAmount: number,
  _isRemoved?: boolean,
  currencyId?: number,
  createdAt: Date,
  updatedAt: Date
};

export class PaymentMethod extends DataEntity {
  public name: string;
  public color: string;
  public userId: number;
  public incomes: number;
  public expenses: number;
  public initialAmount: number;
  public currency: Currency;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data, injector: Injector) {
    super(data, injector);

    let currencyService = injector.get(CurrencyService);

    this.name = data.name;
    this.color = data.color;
    this.userId = +data.userId;
    this.initialAmount = +data.initialAmount;
    this.expenses = +data.expenses;
    this.incomes = +data.incomes;
    this.createdAt = new Date(data.createdAt);
    this.updatedAt = new Date(data.updatedAt);

    this.currency = currencyService.getOne(+data.currencyId);
    currencyService.getListChangedAt().subscribe(() => {
      this.currency = currencyService.getOne(+data.currencyId);
    });
  }

  toUpdateData(): PaymentMethodUpdateData {
    let data: PaymentMethodUpdateData = {
      id: this.id,
      name: this.name,
      color: this.color,
      userId: this.userId,
      initialAmount: this.initialAmount,
      expenses: this.expenses,
      incomes: this.incomes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      _isRemoved: this._isRemoved,
      currencyId: null,
    };

    if (this.currency) {
      data.currencyId = this.currency.id;
    }

    return data;
  }
}

@Injectable()
export class PaymentMethodService extends DataService<PaymentMethod> {
  constructor(
    protected _http: HttpClientService,
    protected injector: Injector
  ) {
    super(_http, injector);
  }

  protected _getPluralKey(): string {
    return 'payment-methods';
  };

  protected _getEntityClass() {
    return PaymentMethod;
  }
}
