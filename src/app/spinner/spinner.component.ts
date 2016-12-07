import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit, OnChanges {

  @Input() private isLoaded: Promise<any>;
  private isPending: boolean = false;
  private isSaved: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    let isLoaded = changes['isLoaded'].currentValue;

    if (isLoaded && isLoaded instanceof Promise) {
      this.isPending = true;
      isLoaded
        .then(() => {
          setTimeout(() => {
            this.isPending = false;
            this.isSaved = true;
            setTimeout(() => this.isSaved = false, 500);
          }, 500);
        }).catch(() => {
          this.isPending = false;
        });
    }

  }
}