import { Component, OnInit, Injector } from '@angular/core';
import { Router } from '@angular/router';
import {Subscription} from "rxjs/Subscription";
import {WizardService} from "../wizard.service";
import {Expense, ExpenseService} from "../expense.service";
import {ChartService} from "../chart.service";
import {Category, CategoryService} from "../category.service";
import {PaymentMethod, PaymentMethodService} from "../payment-method.service";
import Timer = NodeJS.Timer;
import * as moment from 'moment';
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'categories-page',
  templateUrl: './categories-page.component.html',
  styleUrls: ['./categories-page.component.css']
})
export class CategoriesPageComponent implements OnInit {

  private loading = false;
  private isLoaded: { [propName: string]: Observable<Category> } = {};
  private category: Category;
  private expenses: Expense[] = [];
  private lastMonthExpenses: Expense[] = [];
  private paymentMethods: PaymentMethod[] = [];
  private categories: Category[] = [];
  private startOfMonth: Date;
  private categoriesChart = [];
  private expenseServiceListChangedAt: Subscription;
  private isNewLoaded: Observable<Category>;
  private selectedColors: string[];
  private _debounceTimeout: Timer;

  private _initCategories() {
    this.expenses = this.expenseService.getAll().filter(function(item) { return !item._isRemoved; });
    this.lastMonthExpenses = this.expenses.filter((item) => +item.createdAt >= +this.startOfMonth);

    this.categories = this.categoryService.getAll().filter(function(item) { return !item._isRemoved; });

    let chart = this.chartService.buildCategoriesChart(this.lastMonthExpenses, 'category');
    this.categoriesChart = Object.keys(chart).map((currency) => ({ currency, chartData: chart[currency] }));
  }

  private _initCategory() {
    this.category = new Category({}, this.injector);
    this.isNewLoaded = null;
  }

  public saveCategory(category) {
    if (category.name) {
      if (this._debounceTimeout) {
        clearTimeout(this._debounceTimeout);
      }

      this._debounceTimeout = setTimeout(() => {
        this.isLoaded[category.id] = this.categoryService.update(category);
        this.isLoaded[category.id].subscribe(() => {
          this._initCategories();
        });
      }, 300);
    }
  };

  public addCategory() {
    if (this.category.name) {
      this.isNewLoaded = this.categoryService.add(this.category);
      this.isNewLoaded.subscribe(() => {
        this._initCategories();
        this._initCategory();
      });

      return this.isNewLoaded;
    }
  };

  public deleteCategory(category) {
    this.isLoaded[category.id] = this.categoryService.delete(category);
    this.isLoaded[category.id].subscribe(() => {
      this._initCategories();
    });

    return this.isLoaded[category.id];
  }

  public updateSelectedColors() {
    this.selectedColors = this.categories.map((c) => c.color);
    if (this.category.color) {
      this.selectedColors.push(this.category.color);
    }
  };

  public hasChart() {
    return this.categoriesChart.length > 0;
  };


  constructor(
    private wizardService: WizardService,
    private expenseService: ExpenseService,
    private chartService: ChartService,
    private categoryService: CategoryService,
    private paymentMethodService: PaymentMethodService,
    private router: Router,
    private injector: Injector
  ) {

    this.startOfMonth = moment().startOf('month').toDate();

    this.expenseServiceListChangedAt = this.expenseService.getListChangedAt().subscribe(() => {
      this._initCategories();
    });

    this._initCategory();
    this._initCategories();

    this.isLoaded = {};
    this.updateSelectedColors();
  }

  ngOnInit() {
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
