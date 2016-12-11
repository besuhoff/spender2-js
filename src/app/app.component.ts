import { Component, Inject } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  constructor() {
    moment.locale('ru');
  }
}
