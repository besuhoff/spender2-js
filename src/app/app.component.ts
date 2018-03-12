import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment-timezone';
import {Subscription} from "rxjs/Subscription";
import {CacheService} from "./cache.service";
import {UserService, User} from './user.service';

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  private isLoaded: boolean = false;
  private isLoadedChanged: Subscription;

  constructor(private cacheService: CacheService,
              private userService: UserService) {
    moment.locale('ru');
  }

  ngOnInit() {
    this.isLoadedChanged = this.cacheService.isLoaded().subscribe((isLoaded) => this.isLoaded = isLoaded);
  }

  getUser(): User {
    return this.userService.get();
  }

  ngOnDestroy() {
    this.isLoadedChanged && this.isLoadedChanged.unsubscribe();
  }
}
