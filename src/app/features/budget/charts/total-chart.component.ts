// app/features/charts/total-chart.component.ts
import { Component, computed, inject, signal } from '@angular/core'
import { BaseChartDirective } from 'ng2-charts'
import { ChartConfiguration, ChartData } from 'chart.js'
import { BudgetService } from '../budget.service'
import { BudgetSettingsService } from '../budget-settings.service'

@Component({
	selector: 'app-total-chart',
	standalone: true,
	imports: [BaseChartDirective],
	template: ` <canvas baseChart [data]="data()" [options]="options()" [type]="'bar'"> </canvas> `,
})
export class TotalChart {
	private svc = inject(BudgetService)
	private cfg = inject(BudgetSettingsService)

	readonly options = signal<ChartConfiguration<'bar'>['options']>({
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			tooltip: {
				callbacks: {
					label: ctx => this.formatCurrency(Number(ctx.parsed.y)),
				},
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				ticks: { callback: v => this.formatCurrency(Number(v)) },
			},
		},
	})

	readonly data = computed<ChartData<'bar'>>(() => {
		const includeTemp = this.cfg.includeTemporary()
		const includeAmort = this.cfg.costIncludeAmortizationAsExpense()
		const includeSavings = this.cfg.costIncludeSavingsAsExpense()

		const P = {
			mikael: this.cfg.showMikael(),
			jessica: this.cfg.showJessica(),
		}

		const all = this.svc.entries()

		const isCost = (c: (typeof all)[number]) => {
			if (c.type !== 'cost') return false
			if (!includeTemp && c.temporary) return false
			if (!includeAmort && c.category === 'finance.loan_amortization') return false
			if (!includeSavings && c.category.startsWith('savings.')) return false
			return true
		}
		const isIncome = (c: (typeof all)[number]) => {
			if (c.type !== 'income') return false
			if (!includeTemp && c.temporary) return false
			return true
		}

		const sum = (pred: (x: (typeof all)[number]) => boolean, person?: 'mikael' | 'jessica') =>
			all
				.filter(pred)
				.filter(e => (person ? e.person === person : true))
				.reduce((a, e) => a + e.amount, 0)

		const costM = P.mikael ? sum(isCost, 'mikael') : 0
		const costJ = P.jessica ? sum(isCost, 'jessica') : 0
		const incM = P.mikael ? sum(isIncome, 'mikael') : 0
		const incJ = P.jessica ? sum(isIncome, 'jessica') : 0

		const netM = incM - costM
		const netJ = incJ - costJ
		const netTotal = netM + netJ

		return {
			labels: ['Mikael', 'Jessica', 'Totalt'],
			datasets: [
				{
					label: 'Netto (inkomster - kostnader)',
					data: [netM, netJ, netTotal],
					backgroundColor: ['#2e7d32', '#00796b', '#455a64'],
					borderWidth: 0,
				},
			],
		}
	})

	private formatCurrency(n: number): string {
		return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(
			n
		)
	}
}
