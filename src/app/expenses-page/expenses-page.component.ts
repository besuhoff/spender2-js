import { Component, OnInit, Injector, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {WizardService} from "../wizard.service";
import {Expense, ExpenseUpdateData} from "../expense.service";
import {ExpenseService} from "../expense.service";
import * as moment from 'moment';
import {ChartService} from "../chart.service";
import {PaymentMethod, PaymentMethodService} from "../payment-method.service";
import {Category, CategoryService} from "../category.service";
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'expenses-page',
  templateUrl: './expenses-page.component.html',
  styleUrls: ['./expenses-page.component.css']
})
export class ExpensesPageComponent implements OnInit {

  private loading: boolean = false;
  private expense: Expense;
  private editMode: boolean;
  private expenses: Expense[] = [];
  private lastMonthExpenses: Expense[] = [];
  private paymentMethods: PaymentMethod[] = [];
  private categories: Category[] = [];
  private startOfMonth: Date;
  private expensesChart = [];
  private expenseServiceListChangedAt: Subscription;

  private _initExpense() {
    this.expense = new Expense({
      createdAt: (this.expense ? this.moment(this.expense.createdAt).add(1, 'seconds') : this.moment()).format()
    }, this.injector);
  }

  private _initExpenses() {
    this.expenses = this.expenseService.getAll().filter((item) => !item._isRemoved);
    this.lastMonthExpenses = this.expenses.filter((item) => +item.createdAt >= +this.startOfMonth);

    let chart = this.chartService.buildTransactionsChart(this.lastMonthExpenses);
    this.expensesChart = Object.keys(chart).map((currency) => ({ currency, chartData: chart[currency] }));
  }

  constructor(
    private wizardService: WizardService,
    private expenseService: ExpenseService,
    private chartService: ChartService,
    private categoryService: CategoryService,
    private paymentMethodService: PaymentMethodService,
    private router: Router,
    private injector: Injector,
    @Inject('moment') private moment
  ) {

    this.startOfMonth = moment().startOf('month').toDate();
    this._initExpenses();
    if (!this.expense) {
      this._initExpense();
    } else {
      this.editMode = true;
    }

    this.expenseServiceListChangedAt = this.expenseService.getListChangedAt().subscribe(() => this._initExpenses());
    this.paymentMethods = this.paymentMethodService.getAll().filter((item) => !item._isRemoved);
    this.categories = this.categoryService.getAll().filter((item) => !item._isRemoved);
  }

  ngOnInit() {
  }

  save() {
    if (this.expense.category && this.expense.paymentMethod) {
      this.expenseService[!this.editMode ? 'add' : 'update'](this.expense.toUpdateData()).subscribe(() => {
        if (this.editMode) {
          this.router.navigate(['/history']);
        } else {
          this._initExpense();
          this._initExpenses();
        }
      });
    }
  }

  hasChart(): boolean {
    return this.expensesChart.length > 0;
  }

  getRequirements(): string {
    var requirements = [],
      validatedObject = this.expense;

    if (!validatedObject.amount) {
      requirements.push('сумму');
    }
    if (!validatedObject.category) {
      requirements.push('категорию');
    }
    if (!validatedObject.paymentMethod) {
      requirements.push('счёт');
    }

    if (!requirements.length) {
      return null;
    }

    var last = requirements.pop();

    return requirements.join(', ') + (requirements.length ? ' и ' : '') + last;
  }

  canSave(): boolean {
    return !this.getRequirements();
  }

  isHintVisible(): boolean {
    return this.wizardService.isExpenseHintVisible();
  }

  nextStep() {
    this.loading = true;

    return this.wizardService.nextStep().subscribe(() => this.loading = false);
  }

  close() {
    this.loading = true;

    return this.wizardService.close().subscribe(() => this.loading = false);
  }

  ngOnDestroy() {
    this.expenseServiceListChangedAt && this.expenseServiceListChangedAt.unsubscribe();
  }
}