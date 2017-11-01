import { Component, OnInit, Injector } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {WizardService} from "../wizard.service";
import {Income, IncomeService} from "../income.service";
import {Expense, ExpenseService} from "../expense.service";
import * as moment from 'moment';
import {ChartService} from "../chart.service";
import {PaymentMethod, PaymentMethodService} from "../payment-method.service";
import {IncomeCategory, IncomeCategoryService} from "../income-category.service";
import {Category, CategoryService} from "../category.service";
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'operations-page',
  templateUrl: './operations-page.component.html',
  styleUrls: ['./operations-page.component.css']
})
export class OperationsPageComponent implements OnInit {


  private isWizardLoading: boolean = false;
  private isWizardNextStepLoading: boolean = false;
  private isWizardCloseLoading: boolean = false;

  private editMode: boolean;

  private loading: boolean = false;
  private incomes: Income[] = [];
  private lastMonthIncomes: Income[] = [];

  private expenses: Expense[] = [];
  private lastMonthExpenses: Expense[] = [];

  private incomeServiceListChangedAt: Subscription;
  private expenseServiceListChangedAt: Subscription;

  public entityType: 'income'|'expense'|'transfer';

  public sourceIncomeCurrencyRate: number;
  public targetIncomeCurrencyRate: number;

  public incomesChart = [];
  public income: Income;

  public expensesChart = [];
  public expense: Expense;

  public transferExpense: Expense;
  public transferIncome: Income;

  public createdAt: Date;
  public comment: string = '';

  public paymentMethods: PaymentMethod[] = [];
  public incomeCategories: IncomeCategory[] = [];
  public categories: Category[] = [];

  public startOfMonth: Date;

  private _initIncome() {
    this.income = new Income({
      createdAt: (this.income ? moment(this.income.createdAt).add(1, 'seconds') : moment()).format()
    }, this.injector);
  }

  private _initIncomes() {
    this.incomes = this.incomeService.getAll().filter((item) => !item._isRemoved);
    this.lastMonthIncomes = this.incomes.filter((item) => +item.createdAt >= +this.startOfMonth);

    let chart = this.chartService.buildTransactionsChart(this.lastMonthIncomes);
    this.incomesChart = Object.keys(chart).map((currency) => ({ currency, chartData: chart[currency] }));
  }

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

  private _initTransfer() {
    this.transferExpense = new Expense({
      createdAt: (this.transferExpense ? moment(this.transferExpense.createdAt).add(1, 'seconds') : moment()).format()
    }, this.injector);

    this.transferIncome = new Income({}, this.injector);

    this.sourceIncomeCurrencyRate = 1;
    this.targetIncomeCurrencyRate = 1;
  }

  private _initModels() {
    switch (this.entityType) {
      case 'income':
        this.comment = this.income.comment;
        this.createdAt = this.income.createdAt;
        break;
      case 'expense':
        this.comment = this.expense.comment;
        this.createdAt = this.expense.createdAt;
        break;
      case 'transfer':
        this.comment = this.transferExpense.comment;
        this.createdAt = this.transferExpense.createdAt;
        break;
    }
  }

  constructor(
    private wizardService: WizardService,
    private incomeService: IncomeService,
    private expenseService: ExpenseService,
    private chartService: ChartService,
    private incomeCategoryService: IncomeCategoryService,
    private categoryService: CategoryService,
    private paymentMethodService: PaymentMethodService,
    private router: Router,
    private injector: Injector,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams
      .subscribe((params) => {
        this.entityType = params['type'];
        this.startOfMonth = moment().startOf('month').toDate();
        this._initIncomes();
        this._initExpenses();

        this._initIncome();
        this._initExpense();
        this._initTransfer();

        this._initModels();

        if (params['id']) {
          this.editMode = true;
          switch (this.entityType) {
            case 'income': this.income = this.incomeService.getOne(+params['id']); break;
            case 'expense': this.expense = this.expenseService.getOne(+params['id']); break;
            case 'transfer': 
              this.transferExpense = this.expenseService.getOne(+params['id']);
              this.transferIncome = this.transferExpense.targetIncome;

              this.sourceIncomeCurrencyRate = 1;
              this.targetIncomeCurrencyRate = this.transferIncome.amount / this.transferExpense.amount;

              if (this.targetIncomeCurrencyRate < 1) {
                this.sourceIncomeCurrencyRate /= this.targetIncomeCurrencyRate;
                this.targetIncomeCurrencyRate = 1;
              }

              break;
          }
        }

        this.incomeServiceListChangedAt = this.incomeService.getListChangedAt().subscribe(() => this._initIncomes());
        this.expenseServiceListChangedAt = this.expenseService.getListChangedAt().subscribe(() => this._initExpenses());
        this.paymentMethods = this.paymentMethodService.getAll().filter((item) => !item._isRemoved);
        this.incomeCategories = this.incomeCategoryService.getAll().filter((item) => !item._isRemoved);
        this.categories = this.categoryService.getAll().filter((item) => !item._isRemoved);
      });
  }

  getTargetAmount(): number | null {
    if (this.transferExpense.paymentMethod && this.transferIncome.paymentMethod) {
      if (this.transferExpense.paymentMethod.currency.id === this.transferIncome.paymentMethod.currency.id) {
        return (this.transferExpense.amount || 0);
      } else if (this.targetIncomeCurrencyRate && this.sourceIncomeCurrencyRate) {
        return (this.transferExpense.amount || 0) * (this.targetIncomeCurrencyRate / this.sourceIncomeCurrencyRate);
      }
    }
    return null;
  }

  saveIncome() {
    this.loading = true;

    if (this.canSave()) {
      this.income.createdAt = this.createdAt;
      this.income.comment = this.comment;

      let update = !this.editMode ? this.incomeService.add(this.income.toUpdateData()) : this.incomeService.update(this.income);

      update.subscribe(() => {
        if (this.editMode) {
          this.router.navigate(['/history']);
        } else {
          this._initIncome();
          this._initModels();
        }

        this.loading = false;
      });
    }
  }

  saveExpense() {
    this.loading = true;

    if (this.canSave()) {
      this.expense.createdAt = this.createdAt;
      this.expense.comment = this.comment;

      let update = !this.editMode ? this.expenseService.add(this.expense.toUpdateData()) : this.expenseService.update(this.expense);

      update.subscribe(() => {
        if (this.editMode) {
          this.router.navigate(['/history']);
        } else {
          this._initExpense();
          this._initModels();
        }

        this.loading = false;
      });
    }
  }

  saveTransfer() {
    if (this.getTargetAmount() !== undefined) {
      this.loading = true;

      this.transferExpense.createdAt = this.createdAt;
      this.transferExpense.comment = this.comment;

      this.transferIncome.amount = this.getTargetAmount();
      this.transferIncome.comment = this.transferExpense.comment;
      this.transferIncome.createdAt = this.transferExpense.createdAt;

      let update = !this.editMode ? this.incomeService.add(this.transferIncome.toUpdateData()) : this.incomeService.update(this.transferIncome);

      update.subscribe((income) => {
        this.transferExpense.targetIncome = income;

        let update = !this.editMode ? this.expenseService.add(this.transferExpense.toUpdateData()) : this.expenseService.update(this.transferExpense);
        update.subscribe(() => {
          if (this.editMode) {
            this.router.navigate(['/history']);
          } else {
            this._initTransfer();
            this._initModels();
          }
          this.loading = false;
        });
      });
    }
  }

  hasIncomeChart(): boolean {
    return this.incomesChart.length > 0;
  }

  hasExpenseChart(): boolean {
    return this.expensesChart.length > 0;
  }

  getIncomeRequirements(): string {
    let requirements:string[] = [],
      validatedObject = this.income;

    if (!validatedObject.amount) {
      requirements.push('сумму');
    }
    if (!validatedObject.incomeCategory) {
      requirements.push('платёжное средство');
    }
    if (!validatedObject.paymentMethod) {
      requirements.push('счёт');
    }

    if (!requirements.length) {
      return null;
    }

    const last = requirements.pop();

    return requirements.join(', ') + (requirements.length ? ' и ' : '') + last;
  }

  getExpenseRequirements(): string {
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

    const last = requirements.pop();

    return requirements.join(', ') + (requirements.length ? ' и ' : '') + last;
  }

  getTransferRequirements(): string {
    let requirements:string[] = [];

    if (!this.transferExpense.paymentMethod) {
      requirements.push('счёт');
    }
    if (!this.transferIncome.paymentMethod) {
      requirements.push('целевой счёт');
    }

    if (!this.transferExpense.amount) {
      requirements.push('сумму');
    }

    if (this.transferExpense.paymentMethod && this.transferIncome.paymentMethod &&
      this.transferExpense.paymentMethod.currency.id !== this.transferIncome.paymentMethod.currency.id &&
      (!this.sourceIncomeCurrencyRate || !this.targetIncomeCurrencyRate)) {

      requirements.push('курс обмена');
    }

    if (!requirements.length) {
      return null;
    }

    const last = requirements.pop();

    return requirements.join(', ') + (requirements.length ? ' и ' : '') + last;
  }

  getRequirements(): string {
    switch (this.entityType) {
      case 'income': return this.getIncomeRequirements();
      case 'expense': return this.getExpenseRequirements();
      case 'transfer': return this.getTransferRequirements();
    }
  }

  canSave(): boolean {
    return this.getRequirements() === null;
  }

  save() {
    switch (this.entityType) {
      case 'income': return this.saveIncome();
      case 'expense': return this.saveExpense();
      case 'transfer': return this.saveTransfer();
    }
  }

  isIncomeHintVisible(): boolean {
    return this.wizardService.isIncomeHintVisible();
  }

  isTransferHintVisible(): boolean {
    return this.wizardService.isTransferHintVisible();
  }

  isExpenseHintVisible(): boolean {
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
    this.incomeServiceListChangedAt && this.incomeServiceListChangedAt.unsubscribe();
    this.expenseServiceListChangedAt && this.expenseServiceListChangedAt.unsubscribe();
  }
}