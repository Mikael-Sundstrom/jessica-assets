// app/features/charts/cost-chart.component.ts
import { Component, computed, inject } from '@angular/core'
import { BaseChartDirective } from 'ng2-charts'
import { ChartConfiguration, ChartData } from 'chart.js'
import { BudgetService } from '../budget.service'
import { BudgetSettingsService } from '../budget-settings.service'
import { TOPGROUP_LABEL, HouseholdEntry, TopGroup } from '../budget.model'

type View = 'total' | 'grouped' | 'detailed'

// Sparas vid buildGrouped() för ticks/tooltip

@Component({
	selector: 'app-cost-chart',
	standalone: true,
	imports: [BaseChartDirective],
	template: `
		<canvas
			baseChart
			[data]="data()"
			[options]="options()"
			type="bar"
			class="cost-chart"
			[style.height.px]="chartHeight()"
		></canvas>
	`,
	styles: [
		`
			.cost-chart {
				width: 100%;
				height: 800px;
				margin: 1rem;
			}
		`,
	],
})
export class CostChart {
	private svc = inject(BudgetService)
	private cfg = inject(BudgetSettingsService)

	// Färger
	private colorMikael = '#2962ff'
	private colorJessica = '#d81b60'

	chartHeight = computed(() => (this.cfg.costView() === 'detailed' ? 1200 : 400))

	// Chart-options – stacka endast i "grupperad"
	// options – horisontella staplar + valuta på värdeaxeln (x)
	readonly options = computed<ChartConfiguration<'bar'>['options']>(() => {
		const isGrouped = this.cfg.costView() === 'grouped'
		return {
			responsive: true,
			maintainAspectRatio: false,
			indexAxis: 'y', // 👈 horisontellt
			plugins: {
				legend: { display: true, position: 'top' },
				title: {
					// 👈 Title-plugin
					display: true,
					text: 'Kostnader',
				},
				tooltip: { enabled: true },
			},
			scales: {
				x: {
					stacked: isGrouped,
					beginAtZero: true,
					ticks: { callback: v => this.formatCurrency(Number(v)) },
				},
				y: {
					stacked: isGrouped,
					// inga callbacks behövs – vi skickar redan färdiga stränglabels
				},
			},
		}
	})

	// Filtrera kostnader enligt togglar
	private filteredCosts = computed(() => {
		const includeTemp = this.cfg.includeTemporary()
		const includeAmort = this.cfg.costIncludeAmortizationAsExpense()
		const includeSavings = this.cfg.costIncludeSavingsAsExpense()

		return this.svc.entries().filter(e => {
			if (e.type !== 'cost') return false
			if (!includeTemp && e.temporary) return false

			if (!includeAmort && e.category === 'finance.loan_amortization') return false
			if (!includeSavings && e.category.startsWith('savings.')) return false

			return true
		})
	})

	// Synliga personer
	private visiblePersons = computed(() => ({
		mikael: this.cfg.showMikael(),
		jessica: this.cfg.showJessica(),
	}))

	// Chart-data för vyerna
	readonly data = computed<ChartData<'bar'>>(() => {
		const view = this.cfg.costView() as View
		if (view === 'total') return this.buildTotal()
		if (view === 'grouped') return this.buildGrouped()
		return this.buildDetailed()
	})

	// ===== Helpers =====
	private toSek = (cents: number) => Math.round(cents) / 100
	private formatCurrency(n: number): string {
		return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(
			n
		)
	}
	private sum(entries: HouseholdEntry[], person?: 'mikael' | 'jessica'): number {
		return entries.filter(e => (person ? e.person === person : true)).reduce((acc, e) => acc + e.amount, 0)
	}
	private topGroupKey(cat: string): TopGroup {
		return (cat.includes('.') ? cat.split('.')[0] : cat) as TopGroup // ren dot-path
	}

	// === Vyer ===

	// TOTAL: en stapel per person + totalt
	private buildTotal(): ChartData<'bar'> {
		const persons = this.visiblePersons()
		const rows = this.filteredCosts()

		const sumCents = (person?: 'mikael' | 'jessica') =>
			rows.filter(e => (person ? e.person === person : true)).reduce((a, e) => a + e.amount, 0)

		const mikael = persons.mikael ? this.toSek(sumCents('mikael')) : 0
		const jessica = persons.jessica ? this.toSek(sumCents('jessica')) : 0
		const total = mikael + jessica

		return {
			labels: ['Mikael', 'Jessica', 'Totalt'],
			datasets: [
				{
					label: 'Kostnader',
					data: [mikael, jessica, total],
					backgroundColor: [this.colorMikael, this.colorJessica, '#455a64'],
					borderWidth: 0,
				},
			],
		}
	}

	// buildGrouped – returnera rena textlabels från modellen
	private buildGrouped(): ChartData<'bar'> {
		const persons = this.visiblePersons()
		const rows = this.filteredCosts()

		const groups = new Map<string, { mikael: number; jessica: number }>()
		for (const e of rows) {
			const g = this.topGroupKey(e.category)
			if (!groups.has(g)) groups.set(g, { mikael: 0, jessica: 0 })
			groups.get(g)![e.person] += e.amount
		}

		const keys = Array.from(groups.keys()).sort((a, b) => {
			const A = groups.get(a)!
			const B = groups.get(b)!
			return B.mikael + B.jessica - (A.mikael + A.jessica)
		}) as TopGroup[]

		const dataMikael = keys.map(k => this.toSek(groups.get(k)!.mikael))
		const dataJessica = keys.map(k => this.toSek(groups.get(k)!.jessica))

		const datasets: ChartData<'bar'>['datasets'] = []
		if (persons.mikael)
			datasets.push({ label: 'Mikael', data: dataMikael, backgroundColor: this.colorMikael, borderWidth: 0 })
		if (persons.jessica)
			datasets.push({ label: 'Jessica', data: dataJessica, backgroundColor: this.colorJessica, borderWidth: 0 })

		return {
			labels: keys.map(k => TOPGROUP_LABEL[k]), // 👈 svenska etiketter från modellen
			datasets,
		}
	}

	// DETALJERAD: varje post (titel) som egen stapel
	private buildDetailed(): ChartData<'bar'> {
		const persons = this.visiblePersons()
		const rows = this.filteredCosts()

		const buckets = new Map<string, { mikael: number; jessica: number }>()
		for (const e of rows) {
			const key = e.title || '(utan titel)'
			if (!buckets.has(key)) buckets.set(key, { mikael: 0, jessica: 0 })
			buckets.get(key)![e.person] += e.amount // i öre
		}

		// Sortera efter totalsumma (störst först)
		const labels = Array.from(buckets.entries())
			.sort(([, a], [, b]) => b.mikael + b.jessica - (a.mikael + a.jessica))
			.map(([k]) => k)

		const dataMikael = labels.map(k => this.toSek(buckets.get(k)!.mikael))
		const dataJessica = labels.map(k => this.toSek(buckets.get(k)!.jessica))

		const datasets: ChartData<'bar'>['datasets'] = []
		if (persons.mikael)
			datasets.push({ label: 'Mikael', data: dataMikael, backgroundColor: this.colorMikael, borderWidth: 0 })
		if (persons.jessica)
			datasets.push({ label: 'Jessica', data: dataJessica, backgroundColor: this.colorJessica, borderWidth: 0 })

		return { labels, datasets }
	}
}
