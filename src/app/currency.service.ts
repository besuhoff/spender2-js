import { Injectable, Injector } from '@angular/core';
import { DataEntity, DataService } from './data.service';
import {HttpClientService} from "./http-client.service";

export type CurrencyUpdateData = {
  id: number,
  code: string,
  symbol: string,
  symbolNative: string,
  rounding: number,
  decimalDigits: number,
  createdAt: Date,
  updatedAt: Date
};

export class Currency extends DataEntity {
  public code: string;
  public symbol: string;
  public symbolNative: string;
  public rounding: number;
  public decimalDigits: number;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data, injector: Injector) {
    super(data, injector);

    this.code = data.code;
    this.symbol = data.symbol;
    this.symbolNative = data.symbolNative;
    this.rounding = +data.rounding;
    this.decimalDigits = +data.decimalDigits;

    this.createdAt = new Date(data.createdAt);
    this.updatedAt = new Date(data.updatedAt);
  }

  toUpdateData(): CurrencyUpdateData {
    let data: CurrencyUpdateData = {
      id: this.id,
      code: this.code,
      symbol: this.symbol,
      symbolNative: this.symbolNative,
      rounding: this.rounding,
      decimalDigits: this.decimalDigits,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };

    return data;
  }
}

@Injectable()
export class CurrencyService extends DataService<Currency> {
  constructor(
    protected _http: HttpClientService,
    protected injector: Injector
  ) {
    super(_http, injector);
  }

  protected _getPluralKey(): string {
    return 'currencies';
  }

  protected _getEntityClass() {
    return Currency;
  }
}