import { Component, OnInit, Injector } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {Expense, ExpenseService} from "../expense.service";
import {Category} from "../category.service";
import {Income, IncomeService} from "../income.service";
import {IncomeCategory} from "../income-category.service";
import {WizardService} from "../wizard.service";
import * as moment from 'moment';
import {PaymentMethod} from "../payment-method.service";
import {Observable} from "rxjs/Observable";
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/mergeMap';
import {DataEntity} from "../data.service";

interface HistoryItem {
  id: number;
  createdAt: moment.Moment;
  expense?: Expense;
  income?: Income;
  type: string; // 'expense' | 'income' | 'transfer';
  routeName: string; // 'expenses' | 'income' | 'transfers';
  category: Category|IncomeCategory;
  createdAtDate: string;
  createdAtMonthId: string;
  createdAtFormattedCompact: string;
  comment: string;
  amounts: {
    paymentMethod: PaymentMethod,
    value: number
  }[];
}

interface MonthStruct {
  id: string;
  name: string;
}

@Component({
  selector: 'history-page',
  templateUrl: './history-page.component.html',
  styleUrls: ['./history-page.component.css']
})
export class HistoryPageComponent implements OnInit {

  private isWizardLoading: boolean = false;
  private isWizardCloseLoading: boolean = false;

  private history: HistoryItem[];
  private months: MonthStruct[];
  private currentMonth: string;
  private monthsMap: {};

  private _initHistory() {
    let history: HistoryItem[] = [];

    this.monthsMap = {};

    history = history.concat(this.incomeService.getAll()
      .filter((item) => !item._isRemoved)
      .map((income: Income): HistoryItem => {
        let createdAt = moment(income.createdAt);

        let entity: HistoryItem = {
          id: income.id,
          createdAt: createdAt,
          income: income,
          type: 'income',
          routeName: 'income',
          category: income.incomeCategory,
          createdAtDate: createdAt.format('DD/MM, dddd'),
          createdAtMonthId: createdAt.format('YYYY-MM'),
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
          entity.routeName = 'transfers';
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
          routeName: 'expenses',
          category: expense.category,
          createdAtDate: createdAt.format('DD/MM, dddd'),
          createdAtMonthId: createdAt.format('YYYY-MM'),
          createdAtFormattedCompact: createdAt.format('HH:mm'),
          comment: expense.comment,
          amounts: [{
            paymentMethod: expense.paymentMethod,
            value: expense.amount * -1
          }]
        };
      }));

    history.forEach((item) => {
      if (!this.monthsMap[item.createdAtMonthId]) {
        this.monthsMap[item.createdAtMonthId] = item.createdAt.format('MMM');
      }
    });

    this.months = Object.keys(this.monthsMap).sort().reverse().map((monthId) => ({ id: monthId, name: this.monthsMap[monthId] }));

    this.currentMonth = this.currentMonth || (this.months[0] && this.months[0].id);

    this.history = history
      .filter((item) => item.createdAtMonthId === this.currentMonth)
      .sort((a, b) => {
        let diff = a.createdAt.diff(b.createdAt);
        return  diff < 0 ? 1 :
          diff > 0 ? -1 :
            0;
      });
  }

  constructor(private expenseService: ExpenseService,
              private incomeService: IncomeService,
              private wizardService: WizardService,
              private router: Router,
              private injector: Injector,
              private route: ActivatedRoute) {
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

  gotoMonth(month) {
    if (month.id !== this.currentMonth) {
      this.router.navigate(['/history', month.id]);
    }
  }

  isFirstMonth() {
    return this.months[0].id === this.currentMonth;
  }

  isLastMonth() {
    return this.months[this.months.length - 1].id === this.currentMonth;
  }

  gotoPrevMonth() {
    if (!this.isFirstMonth()) {
      this.gotoMonth(this.months[this.months.map((month) => month.id).indexOf(this.currentMonth) - 1]);
    }
  }

  gotoNextMonth() {
    if (!this.isLastMonth()) {
      this.gotoMonth(this.months[this.months.map((month) => month.id).indexOf(this.currentMonth) + 1]);
    }
  }

  ngOnInit() {
    this.route.params
      .map(params => params['month'])
      .subscribe((month) => {
        this.currentMonth = month;
        this._initHistory();
      });
  }

}
