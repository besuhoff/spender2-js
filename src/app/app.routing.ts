import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginPageComponent } from './login-page/login-page.component';
import { LayoutComponent } from './layout/layout.component';
import { CategoriesPageComponent } from './categories-page/categories-page.component';
import { HistoryPageComponent } from './history-page/history-page.component';
import { IncomeCategoriesPageComponent } from './income-categories-page/income-categories-page.component';
import { PaymentMethodsPageComponent } from './payment-methods-page/payment-methods-page.component';
import { OperationsPageComponent } from './operations-page/operations-page.component';
import { AuthGuard } from './auth-guard';
import {ChartsPageComponent} from './charts-page/charts-page.component';
import {LimitsPageComponent} from './limits-page/limits-page.component';

const appRoutes: Routes = [
    { path: 'login', component: LoginPageComponent },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        children: [
            {
                path: 'operations',
                component: OperationsPageComponent
            },
            {
                path: 'operations/:type',
                component: OperationsPageComponent
            },
            {
                path: 'operations/:type/id/:id',
                component: OperationsPageComponent
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
                path: 'limits',
                component: LimitsPageComponent
            },
            {
                path: 'history',
                component: HistoryPageComponent
            },
            {
                path: 'history/:range',
                component: HistoryPageComponent
            },
            {
                path: 'charts',
                component: ChartsPageComponent
            },
            {
                path: '',
                pathMatch: 'full',
                redirectTo: '/operations/expense'
            }
        ]
    },
    { path: '**', redirectTo: '' }
];

export const appRoutingProviders: any[] = [

];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
