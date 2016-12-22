import { Component, OnInit, Injector } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {WizardService} from "../wizard.service";
import {Expense, ExpenseService} from "../expense.service";
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

  private isWizardLoading: boolean = false;
  private isWizardNextStepLoading: boolean = false;
  private isWizardCloseLoading: boolean = false;

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
      createdAt: (this.expense ? moment(this.expense.createdAt).add(1, 'seconds') : moment()).format()
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
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.params
      .map(params => params['id'])
      .subscribe((id) => {
        this.startOfMonth = moment().startOf('month').toDate();
        this._initExpenses();
        if (!id) {
          this._initExpense();
        } else {
          this.editMode = true;
          this.expense = this.expenseService.getOne(+id);
        }

        this.expenseServiceListChangedAt = this.expenseService.getListChangedAt().subscribe(() => this._initExpenses());
        this.paymentMethods = this.paymentMethodService.getAll().filter((item) => !item._isRemoved);
        this.categories = this.categoryService.getAll().filter((item) => !item._isRemoved);
      });
  }

  save() {
    this.loading = true;

    if (this.expense.category && this.expense.paymentMethod) {
      let update = !this.editMode ? this.expenseService.add(this.expense.toUpdateData()) : this.expenseService.update(this.expense);

      update.subscribe(() => {
        if (this.editMode) {
          this.router.navigate(['/history']);
        } else {
          this._initExpense();
        }

        this.loading = false;
      });
    }
  }

  hasChart(): boolean {
    return this.expensesChart.length > 0;
  }

  getRequirements(): string {
    let requirements:string[] = [],
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
    this.isWizardLoading = true;
    this.isWizardNextStepLoading = true;

    return this.wizardService.nextStep().subscribe(() => { this.isWizardLoading = false; this.isWizardNextStepLoading = false });
  }

  close() {
    this.isWizardLoading = true;
    this.isWizardCloseLoading = true;

    return this.wizardService.close().subscribe(() => { this.isWizardLoading = false; this.isWizardCloseLoading = false; });
  }

  ngOnDestroy() {
    this.expenseServiceListChangedAt && this.expenseServiceListChangedAt.unsubscribe();
  }
}