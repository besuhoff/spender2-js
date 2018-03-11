import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Profile } from './gapi.service';
import { UserService } from './user.service';
import { CacheService } from './cache.service';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class AuthService {
  private _profile$$: ReplaySubject<Profile> = new ReplaySubject<Profile>(1);

  constructor(
    private userService: UserService,
    private cacheService: CacheService
  ) { }

  get profile$(): Observable<Profile> {
    return this._profile$$.asObservable();
  };

  setProfile(profile: Profile): Observable<Profile> {
    return this.userService.create()
      .map(() => {
        this.cacheService.loadAll().subscribe();
        this._profile$$.next(profile);
        return profile;
      });
  };

  reset(): void {
    this._profile$$.next(null);
    this.cacheService.resetAll();
  }
}
