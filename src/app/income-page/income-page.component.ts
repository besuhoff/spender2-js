import { Component, OnInit, Injector, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {WizardService} from "../wizard.service";
import {Income, IncomeService} from "../income.service";
import * as moment from 'moment';
import {ChartService} from "../chart.service";
import {PaymentMethod, PaymentMethodService} from "../payment-method.service";
import {IncomeCategory, IncomeCategoryService} from "../income-category.service";
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'income-page',
  templateUrl: './income-page.component.html',
  styleUrls: ['./income-page.component.css']
})
export class IncomePageComponent implements OnInit {

  private loading: boolean = false;
  private income: Income;
  private editMode: boolean;
  private incomes: Income[] = [];
  private lastMonthIncomes: Income[] = [];
  private paymentMethods: PaymentMethod[] = [];
  private categories: IncomeCategory[] = [];
  private startOfMonth: Date;
  private incomesChart = [];
  private incomeServiceListChangedAt: Subscription;

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

  constructor(
    private wizardService: WizardService,
    private incomeService: IncomeService,
    private chartService: ChartService,
    private incomeCategoryService: IncomeCategoryService,
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
        this._initIncomes();
        if (!id) {
          this._initIncome();
        } else {
          this.editMode = true;
          this.income = this.incomeService.getOne(+id);
        }

        this.incomeServiceListChangedAt = this.incomeService.getListChangedAt().subscribe(() => this._initIncomes());
        this.paymentMethods = this.paymentMethodService.getAll().filter((item) => !item._isRemoved);
        this.categories = this.incomeCategoryService.getAll().filter((item) => !item._isRemoved);
      });
  }

  save() {
    this.loading = true;

    if (this.income.incomeCategory && this.income.paymentMethod) {
      let update = !this.editMode ? this.incomeService.add(this.income.toUpdateData()) : this.incomeService.update(this.income);

      update.subscribe(() => {
        if (this.editMode) {
          this.router.navigate(['/history']);
        } else {
          this._initIncome();
        }

        this.loading = false;
      });
    }
  }

  hasChart(): boolean {
    return this.incomesChart.length > 0;
  }

  getRequirements(): string {
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
    this.incomeServiceListChangedAt && this.incomeServiceListChangedAt.unsubscribe();
  }
}