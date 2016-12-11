import { Component } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor() {
    moment.locale('ru');
  }
}
