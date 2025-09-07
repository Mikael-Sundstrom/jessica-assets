// features/budget/charts/income-chart.ts
import { Component, computed, inject } from '@angular/core'
import { BarChart } from './bar-chart/bar-chart'
import { BudgetService } from '../budget.service'

@Component({
	selector: 'app-income-chart',
	standalone: true,
	imports: [BarChart],
	template: `
		<app-bar-chart
			[title]="'Inkomster'"
			[labels]="labels()"
			[datasets]="series()"
			[currency]="'SEK'"
			[groupColors]="groupColors()"
			[horizontal]="true"
		/>
	`,
})
export class IncomeChart {
	private svc = inject(BudgetService)

	labels = computed(() => ['Mikael', 'Jessica', 'Totalt'])

	// behåll gärna via CSS-variabler sen – nu bara samma färger som du hade
	groupColors = computed(() => ['#acc643', '#2fbb0c', '#177514'])

	// -> [{ label:'Ordinarie', data:[m,j,t] }, { label:'Tillfälligt', data:[m,j,t], hidden:true }]
	series = computed(() => {
		const incomes = this.svc.incomes() // öre

		const sum = (person?: 'mikael' | 'jessica', onlyOrdinary = false) =>
			incomes
				.filter(e => (!person || e.person === person) && (!onlyOrdinary || !e.temporary))
				.reduce((s, e) => s + e.amount, 0) / 100

		const mOrd = sum('mikael', true)
		const jOrd = sum('jessica', true)
		const tOrd = mOrd + jOrd

		const mAll = sum('mikael', false)
		const jAll = sum('jessica', false)
		const tAll = mAll + jAll

		return [
			{ label: 'Ordinarie', data: [mOrd, jOrd, tOrd] },
			{ label: 'Tillfälligt', data: [mAll, jAll, tAll], hidden: false },
		]
	})
}
