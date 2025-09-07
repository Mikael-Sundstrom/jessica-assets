// features/budget/charts/cost-chart.ts
import { Component, computed, inject } from '@angular/core'
import { BarChart } from './bar-chart/bar-chart'
import { BudgetService } from '../budget.service'
import { EntryType, PersonId } from '../budget.model'

@Component({
	selector: 'app-total-chart',
	standalone: true,
	imports: [BarChart],
	template: `
		<app-bar-chart
			[title]="'Resultat (Netto)'"
			[labels]="labels()"
			[datasets]="series()"
			[currency]="'SEK'"
			[groupColors]="groupColors()"
			[horizontal]="true"
		/>
	`,
})
export class TotalChart {
	private svc = inject(BudgetService)

	labels = computed(() => ['Mikael', 'Jessica', 'Totalt'])

	// (valfritt) samma färger du använt i andra diagram
	groupColors = computed(() => ['#94b6ff', '#0b6af9', '#3d1aff'])

	private sum = (type: EntryType, person?: PersonId, onlyOrdinary = false) => {
		const entries = this.svc.entries()
		let cents = 0
		for (const e of entries) {
			if (e.type !== type) continue
			if (person && e.person !== person) continue
			if (onlyOrdinary && e.temporary) continue
			cents += e.amount || 0
		}
		return cents // öre
	}

	series = computed(() => {
		const persons: PersonId[] = ['mikael', 'jessica']

		const makeNetRow = (onlyOrdinary: boolean) => {
			const perPersonNetCents = persons.map(
				p => this.sum('income', p, onlyOrdinary) - this.sum('cost', p, onlyOrdinary)
			)
			const totalCents = perPersonNetCents.reduce((a, b) => a + b, 0)
			const toKr = (v: number) => v / 100
			return [...perPersonNetCents.map(toKr), toKr(totalCents)]
		}

		return [
			{ label: 'Ordinarie (Netto)', data: makeNetRow(true) },
			{ label: 'Tillfälligt (Netto)', data: makeNetRow(false), hidden: false },
		]
	})
}
