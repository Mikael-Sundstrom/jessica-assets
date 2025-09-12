import { Component, signal } from '@angular/core'
import { MatTabsModule } from '@angular/material/tabs'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { Overview } from './overview/overview'
import { Costs } from './costs/costs'
import { Income } from './income/income'

@Component({
	selector: 'app-budget-shell',
	standalone: true,
	imports: [MatTabsModule, MatProgressBarModule, Overview, Costs, Income],
	templateUrl: './budget-shell.html',
})
export class BudgetShell {
	selectedIndex = signal(0)
}
