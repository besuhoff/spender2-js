import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit, OnChanges {

  @Input() private isLoaded: Observable<any>;

  public isPending: boolean = false;
  public isSaved: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    let isLoaded = changes['isLoaded'].currentValue;

    if (isLoaded && isLoaded instanceof Observable) {
      this.isPending = true;
      isLoaded
        .subscribe(
          () => {
            setTimeout(() => {
              this.isPending = false;
              this.isSaved = true;
              setTimeout(() => this.isSaved = false, 500);
            }, 500);
          },

          () => {
            this.isPending = false;
          }
        );
    }

  }
}