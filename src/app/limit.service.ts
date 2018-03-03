import { Injectable, Injector } from '@angular/core';

import { HttpClientService } from "./http-client.service";
import { DataEntity, DataService } from './data.service';
import { Category, CategoryUpdateData, CategoryService } from './category.service';
import { PaymentMethod, PaymentMethodUpdateData, PaymentMethodService } from './payment-method.service';

export type LimitUpdateData = {
  id: number,
  name: string,
  color: string,
  userId: number,
  _isRemoved?: boolean,
  paymentMethodIds?: number[],
  categoryIds: number[],
  value: number,
  period: 'month'|'year',
  createdAt: Date,
  updatedAt: Date,
};

export class Limit extends DataEntity {
  public name: string;
  public color: string;
  public userId: number;
  public paymentMethods: PaymentMethod[];
  public categories: Category[];
  public value: number;
  public period: 'month'|'year';
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data, injector: Injector) {
    super(data, injector);

    let paymentMethodService = injector.get(PaymentMethodService);
    let categoryService = injector.get(CategoryService);

    this.name = data.name;
    this.color = data.color;
    this.userId = +data.userId;
    this.createdAt = new Date(data.createdAt);
    this.updatedAt = new Date(data.updatedAt);
    this.value = +data.value;
    this.period = data.period;

    this.paymentMethods = data.paymentMethodIds.map(paymentMethodId => paymentMethodService.getOne(+paymentMethodId));
    paymentMethodService.getListChangedAt().subscribe(() => {
      this.paymentMethods = data.paymentMethodIds.map(paymentMethodId => paymentMethodService.getOne(+paymentMethodId));
    });
    this.categories = data.categoryIds.map(categoryId => categoryService.getOne(+categoryId));
    categoryService.getListChangedAt().subscribe(() => {
      this.categories = data.categoryIds.map(categoryId => categoryService.getOne(+categoryId));
    });
  }

  toUpdateData(): LimitUpdateData {
    let data: LimitUpdateData = {
      id: this.id,
      name: this.name,
      color: this.color,
      userId: this.userId,
      value: this.value,
      period: this.period,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      _isRemoved: this._isRemoved,
      categoryIds: [],
      paymentMethodIds: [],
    };

    if (this.categories) {
      data.categoryIds = this.categories.map(category => category.id);
    }

    if (this.paymentMethods) {
      data.paymentMethodIds = this.paymentMethods.map(paymentMethod => paymentMethod.id);
    }

    return data;
  }
}

@Injectable()
export class LimitService extends DataService<Limit> {
  constructor(
    protected _http: HttpClientService,
    protected injector: Injector
  ) {
    super(_http, injector);
  }

  protected _getPluralKey(): string {
    return 'limits';
  };

  protected _getEntityClass() {
    return Limit;
  }
}
