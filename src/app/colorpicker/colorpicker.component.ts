import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ColorpickerComponent),
  multi: true
};

@Component({
  selector: 'colorpicker',
  templateUrl: './colorpicker.component.html',
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR],
  styleUrls: ['./colorpicker.component.scss']
})
export class ColorpickerComponent implements OnInit, ControlValueAccessor {
  @Input()
  private disabledOptions: string[] = [];

  private _value: string;

  public isOpen: boolean = false;
  public disabled: boolean;
  public colors: string[] = [
    "#67B4D2",
    "#73CF76",
    "#A5DCF2",
    "#FFAF6B",
    "#FF837C",
    "#93AFF8",
    "#FFEDAE",
    "#7CBCE4",
    "#7FE7E8",
    "#D2FB97",
    "#B0B9EC",
    "#A4FDC6",
    "#A4E28B",
    "#FFD9B7",
    "#E7A6C9",
    "#74C9CD",
    "#FFB0AE",
    "#D29CFC",
    "#9DF7F2",
    "#C1C2D1"
  ];

  setDisabledState(isDisabled: boolean) : void {
    this.disabled = isDisabled;
  }

  get value(): string { return this._value; };

  set value(v: string) {
    if (v !== this._value && !this.isOptionsDisabled(v)) {
      this._value = v;
      this.onChange(v);
    }
  }

  constructor() { }

  ngOnInit() {
  }

  writeValue(value: string) {
    this._value = value;
  }

  isOptionsDisabled(color: string): boolean {
    return this.disabledOptions.indexOf(color) !== -1;
  }

  onChange = (_) => {};
  onTouched = () => {};
  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
