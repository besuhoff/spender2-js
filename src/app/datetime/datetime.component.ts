import { Component, OnInit, Inject, Input, forwardRef, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgbInputDatepicker, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker.module';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap/timepicker/timepicker.module';

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatetimeComponent),
  multi: true
};

@Component({
  selector: 'datetime',
  templateUrl: './datetime.component.html',
  styleUrls: ['./datetime.component.scss'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None
})
export class DatetimeComponent implements OnInit, ControlValueAccessor {
  private _value: any = '';
  private date: NgbDateStruct;
  private time: NgbTimeStruct;
  private disabled: boolean;
  private ngbDatepicker: NgbInputDatepicker;

  get value(): any { return this._value; };

  set value(v: any) {
    if (v !== this._value) {
      // If date is correct, let's set value
      if (this.date) {
        let value = this.moment(this.moment(this.date).format('YYYY-MM-DD') + 'T' +
          this.moment(this.time || new Date(0, 0, 0, 0, 0, 0)).format('HH:mm:ss'), this.moment.ISO_8601);

        this._value = value.isValid() ? value.format() : null;
      } else if (this._value) {
        // If user started removing data and there was previously a valid date set, let's flush it
        this._value = null;
      }

      this.onChange(this._value);
    }
  }

  _momentToDateStruct(moment): NgbDateStruct {
    let momentObject = moment.toObject();
    return {
      day: momentObject.date,
      month: momentObject.months,
      year: momentObject.years
    };
  }

  _momentToTimeStruct(moment): NgbTimeStruct {
    let momentObject = moment.toObject();
    return {
      hour: momentObject.hours,
      minute: momentObject.minutes,
      second: momentObject.seconds
    };
  }

  setNow() {
    this.date = this._momentToDateStruct(this.moment());
    this.time = this._momentToTimeStruct(this.moment());
    this.value = this.moment().format();
  }

  writeValue(value: any) {
    let datetime = value;
    this.time = datetime ? this._momentToTimeStruct(this.moment(datetime)) : null;
    this.date = datetime ? this._momentToDateStruct(this.moment(datetime)) : null;

    this._value = value;
  }

  setDisabledState(isDisabled: boolean) : void {
    this.disabled = isDisabled;
  }

  onChange = (_) => {};
  onTouched = () => {};
  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  constructor(@Inject('moment') private moment) {
  }

  ngOnInit() {
    this.setNow();
  }
}
