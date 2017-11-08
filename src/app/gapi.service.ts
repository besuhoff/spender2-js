import { Injectable, Inject } from '@angular/core';

export interface IGapi {
  load: (protocol: string, callback: ()=>any) => any,
  auth2: {
    init: (param: {})=>any,
    getAuthInstance: ()=>any
  }
}

declare var gapi: IGapi;

export type Profile = {
  getImageUrl(): string;
}

@Injectable()
export class GapiService {
  private _apiDeferred:Promise<IGapi>;

  constructor(@Inject('GAPI_CLIENT_ID') private GAPI_CLIENT_ID) {
    this._apiDeferred = new Promise((resolve) => {
      gapi.load('auth2', () => {
        gapi.auth2.init({
          client_id: this.GAPI_CLIENT_ID
        }).then(() => resolve(gapi));
      });
    });
  }

  load() {
    return this._apiDeferred;
  };

  get() {
    return gapi;
  }
}