import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { GapiService } from './gapi.service';
import 'rxjs/add/operator/toPromise';
import { HttpClientService } from "./http-client.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private gapiService: GapiService,
    private router:Router,
    private httpClientService: HttpClientService
  ) {

  }

  canActivate(): Promise<boolean> {
    return this.gapiService.load()
      .then(
        (gapi) => {
          let currentUser = gapi.auth2.getAuthInstance().currentUser.get();

          if (currentUser && currentUser.isSignedIn()) {
            this.httpClientService.setAuthHeader(currentUser.getAuthResponse().id_token);

            return this.authService.setProfile(currentUser.getBasicProfile()).toPromise().then(() => {
              return Promise.resolve(true);
            });
          }

          this.router.navigate(['/login']);
          return Promise.resolve(true);
        }
      );
  }
}
