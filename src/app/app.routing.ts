import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginPageComponent } from './login-page/login-page.component';
import { LayoutComponent } from './layout/layout.component';
import { CategoriesPageComponent } from './categories-page/categories-page.component';
import { ExpensesPageComponent } from './expenses-page/expenses-page.component';
import { HistoryPageComponent } from './history-page/history-page.component';
import { IncomeCategoriesPageComponent } from './income-categories-page/income-categories-page.component';
import { IncomePageComponent } from './income-page/income-page.component';
import { PaymentMethodsPageComponent } from './payment-methods-page/payment-methods-page.component';
import { TransfersPageComponent } from './transfers-page/transfers-page.component';
import { AuthGuard } from './auth-guard';
import {ChartsPageComponent} from "./charts-page/charts-page.component";

const appRoutes: Routes = [
    { path: 'login', component: LoginPageComponent },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'expenses',
                component: ExpensesPageComponent
            },
            {
                path: 'expenses/:id',
                component: ExpensesPageComponent
            },
            {
                path: 'income',
                component: IncomePageComponent
            },
            {
                path: 'income/:id',
                component: IncomePageComponent
            },
            {
                path: 'transfers',
                component: TransfersPageComponent
            },
            {
                path: 'transfers/:id',
                component: TransfersPageComponent
            },
            {
                path: 'categories',
                component: CategoriesPageComponent
            },
            {
                path: 'income-categories',
                component: IncomeCategoriesPageComponent
            },
            {
                path: 'payment-methods',
                component: PaymentMethodsPageComponent
            },
            {
                path: 'history',
                component: HistoryPageComponent
            },
            {
                path: 'history/:month',
                component: HistoryPageComponent
            },
            {
                path: 'charts',
                component: ChartsPageComponent
            },
            {
                path: '',
                redirectTo: '/expenses'
            }
        ]
    },
    { path: '**', component: LayoutComponent }
];

export const appRoutingProviders: any[] = [

];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
