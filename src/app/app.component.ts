import { Component, Inject } from '@angular/core';

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  constructor(@Inject('moment') moment) {
    moment.locale('ru');
  }
}
