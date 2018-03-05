import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output,
  ViewEncapsulation
} from '@angular/core';
import { HistoryItem } from '../history-page.component';

@Component({
  selector: 'history-row',
  templateUrl: './history-row.component.html',
  styleUrls: ['./history-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HistoryRowComponent implements OnInit {

  @Input() record: HistoryItem;
  @Input() search: string;

  @Output() remove: EventEmitter<HistoryItem> = new EventEmitter<HistoryItem>();

  constructor() {
  }

  ngOnInit() {
  }

}
