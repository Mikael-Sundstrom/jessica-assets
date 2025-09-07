// app/app.routes.ts
import { inject } from '@angular/core'
import { Routes } from '@angular/router'
import { AuthService } from './auth.service'

const isLoggedIn = () => !!inject(AuthService).currentUser()
const isLoggedOut = () => !inject(AuthService).currentUser()

export const routes: Routes = [
	{ path: '', loadComponent: () => import('./components/gate/gate').then(m => m.Gate), pathMatch: 'full' },

	{
		path: 'budget',
		canMatch: [isLoggedIn],
		loadComponent: () => import('./features/budget/budget-shell').then(m => m.BudgetShell),
	},

	{ path: '**', redirectTo: '' },
]
