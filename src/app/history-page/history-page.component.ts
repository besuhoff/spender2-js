import { Component, OnInit, Injector, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {Expense, ExpenseService} from "../expense.service";
import {Category} from "../category.service";
import {Income, IncomeService} from "../income.service";
import {IncomeCategory} from "../income-category.service";
import {WizardService} from "../wizard.service";
import * as moment from 'moment';
import {PaymentMethod} from '../payment-method.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/debounce';
import {DataEntity} from "../data.service";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export interface HistoryItem {
  id: number;
  createdAt: moment.Moment;
  expense?: Expense;
  income?: Income;
  type: string; // 'expense' | 'income' | 'transfer';
  category: Category|IncomeCategory;
  createdAtDate: string;
  createdAtYear: string;
  createdAtFormattedCompact: string;
  comment: string;
  amounts: {
    paymentMethod: PaymentMethod,
    value: number
  }[];
  isMarkedForRemoval?: boolean;
}

@Component({
  selector: 'history-page',
  templateUrl: './history-page.component.html',
  styleUrls: ['./history-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HistoryPageComponent implements OnInit {

  private isWizardLoading: boolean = false;
  private isWizardCloseLoading: boolean = false;
  private _search$$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public fromDate: moment.Moment;
  public toDate: moment.Moment;
  public range: string;
  public history: HistoryItem[] = [];
  public displayedHistory: HistoryItem[] = [];
  public fullHistorySize: number;

  public set search(value: string) {
    this._search$$.next(value);
  }

  public get search(): string {
    return this._search$$.value;
  }

  private _initHistory() {
    let history: HistoryItem[] = [];

    history = history.concat(this.incomeService.getAll()
      .filter((item) => !item._isRemoved)
      .map((income: Income): HistoryItem => {
        let createdAt = moment(income.createdAt);

        let entity: HistoryItem = {
          id: income.id,
          createdAt: createdAt,
          income: income,
          type: 'income',
          category: income.incomeCategory,
          createdAtDate: createdAt.format('DD/MM, dddd'),
          createdAtYear: createdAt.format('YYYY'),
          createdAtFormattedCompact: createdAt.format('HH:mm'),
          comment: income.comment,
          amounts: [{
            paymentMethod: income.paymentMethod,
            value: income.amount
          }]
        };

        if (income.sourceExpense) {
          entity.id = income.sourceExpense.id;
          entity.type = 'transfer';
          entity.expense = income.sourceExpense;

          entity.category = new Category({
            name: 'Перевод денег'
          }, this.injector);

          entity.amounts.unshift({
            paymentMethod: entity.expense.paymentMethod,
            value: entity.expense.amount * -1
          });
        }

        return entity;
      }));

    history = history.concat(this.expenseService.getAll()
      .filter((item) => !item._isRemoved && !item.targetIncome)
      .map((expense: Expense) => {
        let createdAt = moment(expense.createdAt);

        return {
          id: expense.id,
          createdAt: createdAt,
          expense: expense,
          type: 'expense',
          category: expense.category,
          createdAtDate: createdAt.format('DD/MM, dddd'),
          createdAtYear: createdAt.format('YYYY'),
          createdAtFormattedCompact: createdAt.format('HH:mm'),
          comment: expense.comment,
          amounts: [{
            paymentMethod: expense.paymentMethod,
            value: expense.amount * -1
          }]
        };
      }));

    this.fullHistorySize = history.length;

    this.history = history
      .filter((item) => (
        item.createdAt.isBetween(this.fromDate, this.toDate) &&
        (!this.search ||
          ((item.comment && this.search.split(/\s+/).some(term => item.comment.toLowerCase().includes(term.toLowerCase())))
            || (item.category && this.search.split(/\s+/).some(term => item.category.name.toLowerCase().includes(term.toLowerCase())))
            || (item.amounts.some(amount => this.search.split(/\s+/).some(term => amount.paymentMethod.name.toLowerCase().includes(term.toLowerCase()))))
          )
        )
      ))
      .sort((a, b) => {
        let diff = a.createdAt.diff(b.createdAt);
        return  diff < 0 ? 1 :
          diff > 0 ? -1 :
            0;
      });

    this.displayedHistory = this.history.slice(0, 50);
  }

  constructor(private expenseService: ExpenseService,
              private incomeService: IncomeService,
              private wizardService: WizardService,
              private router: Router,
              private injector: Injector,
              private route: ActivatedRoute) {
  }

  loadHistory() {
    if (this.displayedHistory.length < this.history.length) {
      this.displayedHistory = this.displayedHistory.concat(this.history.slice(this.displayedHistory.length, this.displayedHistory.length + 50));
    }
  }

  removeTransaction(transaction) {
    if (!transaction.isMarkedForRemoval) {
      transaction.isMarkedForRemoval = true;

      setTimeout(() => transaction.isMarkedForRemoval = false, 5000);
    } else {
      let loaded: Observable<boolean | DataEntity> = Observable.of(true);

      if (transaction.type === 'transfer') {
        loaded = loaded
          .mergeMap(() => this.expenseService.delete(transaction.expense, true))
          .mergeMap(() => this.incomeService.delete(transaction.income));
      }

      if (transaction.type === 'expense') {
        loaded = loaded.mergeMap(() => this.expenseService.delete(transaction.expense));
      }

      if (transaction.type === 'income') {
        loaded = loaded.mergeMap(() => this.incomeService.delete(transaction.income));
      }

      loaded.subscribe();

      this.history.splice(this.history.indexOf(transaction), 1);
    }
  }

  isHintVisible() {
    return this.wizardService.isHistoryHintVisible();
  }

  close() {
    this.isWizardLoading = true;
    this.isWizardCloseLoading = true;

    return this.wizardService.close().subscribe(() => { this.isWizardLoading = false; this.isWizardCloseLoading = false; });
  }

  goToRange() {
    if (this.fromDate && this.toDate) {
      this.router.navigate(['history', `${this.fromDate.format('YYYY-MM-DD')}...${this.toDate.format('YYYY-MM-DD')}`]);
    }
  }

  ngOnInit() {
    this._search$$.debounce(() => Observable.timer(300))
      .subscribe((value: string) => {
        this._initHistory();
      });

    this.route.params
      .pluck('range')
      .subscribe((range = '') => {
        this.range = range.toString();

        let [from, to] = this.range.split('...');

        if (!from) {
          this.fromDate = moment().startOf('month');
        } else {
          if (from.match(/^\d{4}-\d{2}$/)) {
            from += '-01';
          }

          this.fromDate = moment(from, 'YYYY-MM-DD');
        }


        if (!to) {
          this.toDate = this.fromDate.clone().endOf('month');
        } else {
          if (to.match(/^\d{4}-\d{2}$/)) {
            to += '-01';
          }

          this.toDate = moment(to, 'YYYY-MM-DD').endOf('day');
        }

        this._initHistory();
      });
  }
}
