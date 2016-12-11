import { Component, OnInit, Injector } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {WizardService} from "../wizard.service";
import {Expense, ExpenseService} from "../expense.service";
import * as moment from 'moment';
import {PaymentMethod, PaymentMethodService} from "../payment-method.service";
import {Income, IncomeService} from "../income.service";
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'transfers-page',
  templateUrl: './transfers-page.component.html',
  styleUrls: ['./transfers-page.component.css']
})
export class TransfersPageComponent implements OnInit {

  private loading: boolean = false;
  private expense: Expense;
  private income: Income;
  private editMode: boolean;
  private paymentMethods: PaymentMethod[] = [];
  private sourceIncomeCurrencyRate: number;
  private targetIncomeCurrencyRate: number;

  private _initTransfer() {
    this.expense = new Expense({
      createdAt: (this.expense ? moment(this.expense.createdAt).add(1, 'seconds') : moment()).format()
    }, this.injector);

    this.income = new Income({}, this.injector);

    this.sourceIncomeCurrencyRate = 1;
    this.targetIncomeCurrencyRate = 1;
  }

  constructor(
    private wizardService: WizardService,
    private expenseService: ExpenseService,
    private incomeService: IncomeService,
    private paymentMethodService: PaymentMethodService,
    private router: Router,
    private injector: Injector,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.params
      .map(params => params['id'])
      .subscribe((id) => {
        this.paymentMethods = this.paymentMethodService.getAll().filter((item) => !item._isRemoved);
        if (!id) {
          this._initTransfer();
        } else {
          this.expense = this.expenseService.getOne(+id);
          this.income = this.expense.targetIncome;

          this.sourceIncomeCurrencyRate = 1;
          this.targetIncomeCurrencyRate = this.income.amount / this.expense.amount;

          if (this.targetIncomeCurrencyRate < 1) {
            this.sourceIncomeCurrencyRate /= this.targetIncomeCurrencyRate;
            this.targetIncomeCurrencyRate = 1;
          }

          this.editMode = true;
        }
      });
  }

  getTargetAmount(): number {
    if (this.expense.paymentMethod && this.income.paymentMethod) {
      if (this.expense.paymentMethod.currency.id === this.income.paymentMethod.currency.id) {
        return (this.expense.amount || 0);
      } else if (this.targetIncomeCurrencyRate && this.sourceIncomeCurrencyRate) {
        return (this.expense.amount || 0) * (this.targetIncomeCurrencyRate / this.sourceIncomeCurrencyRate);
      }
    }
    return null;
  }

  save() {
    if (this.getTargetAmount() !== undefined) {
      this.loading = true;

      this.income.amount = this.getTargetAmount();
      this.income.comment = this.expense.comment;
      this.income.createdAt = this.expense.createdAt;

      let update = !this.editMode ? this.incomeService.add(this.income.toUpdateData()) : this.incomeService.update(this.income);

      update.subscribe((income) => {
        this.expense.targetIncome = income;

        let update = !this.editMode ? this.expenseService.add(this.expense.toUpdateData()) : this.expenseService.update(this.expense);
        update.subscribe(() => {
          if (this.editMode) {
            this.router.navigate(['/history']);
          } else {
            this._initTransfer();
          }
          this.loading = false;
        });
      });
    }
  }

  getRequirements(): string {
    let requirements:string[] = [];

    if (!this.expense.paymentMethod) {
      requirements.push('счёт');
    }
    if (!this.income.paymentMethod) {
      requirements.push('целевой счёт');
    }

    if (!this.expense.amount) {
      requirements.push('сумму');
    }

    if (this.expense.paymentMethod && this.income.paymentMethod &&
      this.expense.paymentMethod.currency.id !== this.income.paymentMethod.currency.id &&
      (!this.sourceIncomeCurrencyRate || !this.targetIncomeCurrencyRate)) {

      requirements.push('курс обмена');
    }

    if (!requirements.length) {
      return null;
    }

    let last = requirements.pop();

    return requirements.join(', ') + (requirements.length ? ' и ' : '') + last;
  }

  canSave(): boolean {
    return !this.getRequirements();
  }

  isHintVisible(): boolean {
    return this.wizardService.isTransferHintVisible();
  }

  nextStep() {
    this.loading = true;

    return this.wizardService.nextStep().subscribe(() => this.loading = false);
  }

  close() {
    this.loading = true;

    return this.wizardService.close().subscribe(() => this.loading = false);
  }
}
