import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgbDatepicker, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;

@Component({
  selector: 'datetimerange',
  templateUrl: './datetimerange.component.html',
  styleUrls: ['./datetimerange.component.scss']
})
export class DatetimerangeComponent {

  hoveredDate: NgbDateStruct;

  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;

  public calendarOpen: boolean = false;
  public get range(): string {
    if (!this.fromDate) {
      return '';
    }

    const fromMoment = this._prepareDate(this.fromDate);
    const from: string = fromMoment.format('LL');

    if (!this.toDate) {
      return from;
    }

    return `${from} — ${this._prepareDate(this.toDate).format('LL')}`;
  };

  @ViewChild(NgbDatepicker) dp: NgbDatepicker;

  @Input('fromDate') set setFromDate(date: moment.Moment) {
    this.fromDate = this._parseDate(date);
    setTimeout(() => this.dp.navigateTo(this.fromDate));
  }

  @Input('toDate') set setToDate(date: moment.Moment) {
    this.toDate = this._parseDate(date);
  }

  @Output() fromDateChange: EventEmitter<moment.Moment> = new EventEmitter<moment.Moment>();
  @Output() toDateChange: EventEmitter<moment.Moment> = new EventEmitter<moment.Moment>();

  constructor() {}

  private _parseDate(date: moment.Moment): NgbDateStruct {
    if (!date || !date.isValid()) {
      return null;
    }

    return {
      day: date.date(),
      month: date.month() + 1,
      year: date.year()
    };
  }

  private _prepareDate(ngbDate: NgbDateStruct): moment.Moment {
    let date = {
      day: ngbDate.day,
      month: ngbDate.month - 1,
      year: ngbDate.year
    };

    let value = moment(date);
    return value.isValid() ? value : null;
  }

  onDateChange(date: NgbDateStruct) {
    const preparedDate: moment.Moment = this._prepareDate(date);

    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
      this.fromDateChange.emit(preparedDate);
    } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
      this.toDate = date;
      this.toDateChange.emit(preparedDate.endOf('day'));
      this.calendarOpen = false;
    } else {
      this.toDate = null;
      this.fromDate = date;
      this.toDateChange.emit(null);
      this.fromDateChange.emit(preparedDate);
    }
  }

  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);
}