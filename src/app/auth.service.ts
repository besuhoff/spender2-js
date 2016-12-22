import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Profile } from './gapi.service';
import { UserService } from './user.service';
import { CacheService } from './cache.service';

@Injectable()
export class AuthService {
  private _profile: Profile;

  constructor(
    private userService: UserService,
    private cacheService: CacheService
  ) { }

  getProfile(): Profile {
    return this._profile;
  };

  setProfile(profile: Profile): Observable<Profile> {
    return this.userService.create()
      .map(() => {
        this.cacheService.loadAll().subscribe();
        this._profile = profile;
        return profile;
      });
  };

  reset(): void {
    this._profile = undefined;
    this.cacheService.resetAll();
  }
}
