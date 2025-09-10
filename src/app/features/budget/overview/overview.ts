// app/features/overview/overview.ts
import { Component, computed, inject } from '@angular/core'
import { BreakpointObserver } from '@angular/cdk/layout'
import { toSignal } from '@angular/core/rxjs-interop'
import { map, distinctUntilChanged } from 'rxjs'

import { MatCardModule } from '@angular/material/card'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

import { BudgetSettingsService } from '../budget-settings.service'
import { CostChart } from '../charts/cost-chart.component'
import { IncomeChart } from '../charts/income-chart.component'
import { TotalChart } from '../charts/total-chart.component'
// Om du har en donut för kategorier, importera den också
// import { CostCategoryDonutChart } from '../charts/cost-category-donut-chart';

@Component({
	selector: 'app-overview',
	standalone: true,
	imports: [
		MatCardModule,
		MatButtonToggleModule,
		MatSlideToggleModule,
		MatButtonModule,
		MatIconModule,
		CostChart,
		IncomeChart,
		TotalChart,
		// CostCategoryDonutChart,
	],
	templateUrl: './overview.html',
	styleUrl: './overview.scss',
})
export class Overview {
	private bp = inject(BreakpointObserver)
	cfg = inject(BudgetSettingsService)

	// Responsive kolumner
	private narrow = toSignal(
		this.bp.observe('(max-width: 699px)').pipe(
			map(r => r.matches),
			distinctUntilChanged()
		),
		{ initialValue: false }
	)

	cols = computed(() => (this.narrow() ? 1 : 2))
	totalColspan = computed(() => (this.cols() === 1 ? 1 : 2))

	// Hjälp för template – toggla knapparnas "aktiva" tillstånd
	isMikaelOn = computed(() => this.cfg.showMikael())
	isJessicaOn = computed(() => this.cfg.showJessica())

	onIncludeTemporaryChange(checked: boolean) {
		this.cfg.setIncludeTemporary(checked)
	}
	onIncludeAmortizationChange(checked: boolean) {
		this.cfg.setCostIncludeAmortizationAsExpense(checked)
	}
	onIncludeSavingsChange(checked: boolean) {
		this.cfg.setCostIncludeSavingsAsExpense(checked)
	}
	toggleMikael() {
		this.cfg.toggleMikael()
	}
	toggleJessica() {
		this.cfg.toggleJessica()
	}
}
