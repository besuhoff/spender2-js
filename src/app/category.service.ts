import { Injectable, Injector } from '@angular/core';
import { DataEntity, DataService } from './data.service';
import {HttpClientService} from "./http-client.service";

export type CategoryUpdateData = {
  id: number,
  name: string,
  color: string,
  userId: number,
  createdAt: Date,
  updatedAt: Date
};

export class Category extends DataEntity {
  public name: string;
  public color: string;
  public userId: number;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data, injector: Injector) {
    super(data, injector);

    this.name = data.name;
    this.color = data.color;
    this.userId = +data.userId;
    this.createdAt = new Date(data.createdAt);
    this.updatedAt = new Date(data.updatedAt);
  }

  toUpdateData(): CategoryUpdateData {
    let data: CategoryUpdateData = {
      id: this.id,
      name: this.name,
      color: this.color,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };

    return data;
  }
}

@Injectable()
export class CategoryService extends DataService<Category> {
  constructor(
    protected _http: HttpClientService,
    protected injector: Injector
  ) {
    super(_http, injector);
  }

  protected _getPluralKey(): string {
    return 'categories';
  }

  protected _getEntityClass() {
    return Category;
  }
}
