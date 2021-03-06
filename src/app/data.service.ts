import { Injector } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/operator/map';
import 'rxjs/add/operator/share';
import { HttpClientService } from "./http-client.service";

export abstract class DataEntity {
  public id: number;
  public _isRemoved: boolean;

  constructor(data: { id: number, _isRemoved?: boolean|string }, injector: Injector) {
    this.id = data.id;
    this._isRemoved = !!+(data._isRemoved || 0);
  }

  abstract toUpdateData(): {};
}

export abstract class DataService<T extends DataEntity> {

  protected _entities: T[] = [];
  protected _entitiesDeferred: Observable<T[]>;
  protected _listChangedAt: Subject<number> = new Subject<number>();

  protected abstract _getPluralKey() : string;

  protected abstract _getEntityClass();

  protected _getEntityUrl(id: number = null): string {
    return this._http.getUrl(this._getPluralKey(), id);
  }

  constructor(
    protected _http: HttpClientService,
    protected injector: Injector
  ) {

  }

  getAll(): T[] {
    return this._entities;
  };

  getOne(id: number): T {
    return this._entities.filter(entity => entity.id === id)[0];
  };

  getListChangedAt(): Observable<number> {
    return this._listChangedAt.asObservable().share();
  }

  recordListChange(): void {
    this._listChangedAt.next(+new Date());
  };

  resetAll(): this {
    this._entities = [];
    this._entitiesDeferred = null;
    return this;
  };

  loadAll(): Observable<T[]> {
    if (!this._entitiesDeferred) {
      this._entitiesDeferred = this._http.get(this._getEntityUrl())
        .map((response: Response) => {
          this._entities = response.json().map(data => new (this._getEntityClass())(data, this.injector));

          return this._entities;
        }).share();
    }

    return this._entitiesDeferred;
  };

  add(data: {}, suppressListChange: boolean = false): Observable<T> {
    return this._http.post(this._getEntityUrl(), data)
      .map(data => {
        let entity = new (this._getEntityClass())(data.json(), this.injector);
        this._entities.push(entity);
        if (!suppressListChange) {
          this.recordListChange();
        }

        return entity;
      }).share();
  };

  update(entity: T, suppressListChange: boolean = false): Observable<T> {
    return this._http.patch(this._getEntityUrl(entity.id), entity.toUpdateData()).map(() => {
      if (!suppressListChange) {
        this.recordListChange();
      }

      return entity;
    }).share();
  };

  delete(entity: T, suppressListChange: boolean = false): Observable<T> {
    return this._http.delete(this._getEntityUrl(entity.id)).map(() => {
      this._entities.splice(this._entities.indexOf(entity), 1);
      if (!suppressListChange) {
        this.recordListChange();
      }

      return entity;
    }).share();
  };
}
