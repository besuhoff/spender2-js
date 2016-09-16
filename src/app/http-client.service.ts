import { Injectable } from '@angular/core';
import { Http, XHRBackend, RequestOptions } from '@angular/http';

@Injectable()
export class HttpClientService extends Http {
  protected static get _baseUrl(): string { return 'https://spender-api.pereborstudio.com' };

  constructor (backend: XHRBackend, options: RequestOptions) {
    super(backend, options);
  }

  public setAuthHeader(token: string) {
    this._defaultOptions.headers.set('X-Auth-Token', token);
  }

  public unsetAuthHeader() {
    this._defaultOptions.headers.delete('X-Auth-Token');
  }

  public getUrl(entityKey: string, id: number = undefined): string {
    let url = HttpClientService._baseUrl + '/' + entityKey;
    if (id !== undefined) {
      url += '/' + id;
    }

    return url;
  }

}
