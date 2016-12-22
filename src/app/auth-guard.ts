import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { GapiService } from './gapi.service';
import 'rxjs/add/operator/toPromise';
import { HttpClientService } from "./http-client.service";
import {CacheService} from "./cache.service";
import {Subscription} from "rxjs/Subscription";

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
  private cacheServiceIsLoaded: Subscription;

  constructor(
    private cacheService: CacheService,
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
            return this.authService.setProfile(currentUser.getBasicProfile()).toPromise().then(() => {
              return Promise.resolve(true);
            });
          }

          this.router.navigate(['/login']);
          return Promise.resolve(true);
        }
      );
  }

  canActivateChild(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.cacheService.hasData()) {
        return resolve(true);
      }

      this.cacheServiceIsLoaded = this.cacheService.isLoaded().subscribe((isLoaded) => {
        if (isLoaded) {
          this.cacheServiceIsLoaded.unsubscribe();
          return resolve(true);
        }
      });
    });
  }
}