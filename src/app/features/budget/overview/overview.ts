// app/features/overview/overview.ts
import { Component, computed, inject } from '@angular/core'
import { BreakpointObserver } from '@angular/cdk/layout'
import { toSignal } from '@angular/core/rxjs-interop'
import { map, distinctUntilChanged } from 'rxjs'
import { firstValueFrom } from 'rxjs'

import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'

import { BudgetSettingsService } from '../budget-settings.service'
import { CostChart } from '../charts/cost-chart.component'
import { TotalChart } from '../charts/total-chart.component'
import { CostSettingsDialog, CostSettingsData } from './cost-settings-dialog'

@Component({
	selector: 'app-overview',
	standalone: true,
	imports: [MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule, MatDialogModule, CostChart, TotalChart],
	templateUrl: './overview.html',
	styleUrl: './overview.scss',
})
export class Overview {
	private bp = inject(BreakpointObserver)
	private dialog = inject(MatDialog)
	cfg = inject(BudgetSettingsService)

	private narrow = toSignal(
		this.bp.observe('(max-width: 699px)').pipe(
			map(r => r.matches),
			distinctUntilChanged()
		),
		{ initialValue: false }
	)

	cols = computed(() => (this.narrow() ? 1 : 2))
	totalColspan = computed(() => (this.cols() === 1 ? 1 : 2))

	async openSettings() {
		const data: CostSettingsData = {
			view: this.cfg.costView(),
			includeTemporary: this.cfg.includeTemporary(),
			includeAmortization: this.cfg.costIncludeAmortizationAsExpense(),
			includeSavings: this.cfg.costIncludeSavingsAsExpense(),
		}

		const ref = this.dialog.open(CostSettingsDialog, {
			data,
			width: '560px',
			maxWidth: '96vw',
		})
		const res = await firstValueFrom(ref.afterClosed())
		if (!res) return

		// applicera valen
		this.cfg.setCostView(res.view)
		this.cfg.setIncludeTemporary(res.includeTemporary)
		this.cfg.setCostIncludeAmortizationAsExpense(res.includeAmortization)
		this.cfg.setCostIncludeSavingsAsExpense(res.includeSavings)
	}
}
