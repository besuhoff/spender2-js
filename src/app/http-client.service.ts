import { Injectable } from '@angular/core';
import { Request, Response, RequestOptionsArgs, Http, Headers, XHRBackend, RequestOptions } from '@angular/http';
import {GapiService} from "./gapi.service";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/from";
import "rxjs/add/operator/mergeMap";

@Injectable()
export class HttpClientService extends Http {
  //protected static get _baseUrl(): string { return 'https://spender-api.pereborstudio.com' };
  protected static get _baseUrl(): string { return 'http://spender-api.pereborstudio.develop:8090' };

  constructor (backend: XHRBackend, options: RequestOptions, private gapiService: GapiService) {
    super(backend, options);
  }

  public getUrl(entityKey: string, id: number = null): string {
    let url = HttpClientService._baseUrl + '/' + entityKey;
    if (id !== null) {
      url += '/' + id;
    }

    return url;
  }

  public request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    let headerContainer: Request | RequestOptionsArgs;

    return Observable.from(this.gapiService.load()
      .then(
        (gapi) => {
          let currentUser = gapi.auth2.getAuthInstance().currentUser.get();

          if (currentUser && currentUser.isSignedIn()) {
            let token = currentUser.getAuthResponse().id_token;
            if (url instanceof Request) {
              headerContainer = url;
            } else {
              if (!options) {
                options = {};
              }

              headerContainer = options;
            }

            if (!headerContainer.headers) {
              headerContainer.headers = new Headers();
            }

            headerContainer.headers.set('X-Auth-Token', token);
          }

          return true;
        }
      )).mergeMap(() => super.request(url, options));
  }
}
