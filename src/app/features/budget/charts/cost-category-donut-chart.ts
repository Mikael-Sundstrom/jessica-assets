// features/budget/charts/cost-category-donut-chart.ts
import { Component, computed, inject, input } from '@angular/core'
import { DoughnutChart } from './doughnut-chart/doughnut-chart'
import { BudgetService } from '../budget.service'
import { Category, CATEGORY_LABEL, EXPENSE_CATEGORIES, EXPENSE_CATEGORY_GROUPS, EntryType } from '../budget.model'

type GroupMode = 'detailed' | 'grouped'

@Component({
	selector: 'app-cost-category-donut-chart',
	standalone: true,
	imports: [DoughnutChart],
	template: `
		<app-doughnut-chart
			[title]="title()"
			[labels]="labels()"
			[values]="values()"
			[currency]="'SEK'"
			[colors]="colors()"
			[height]="380"
			[cutout]="60"
		/>
	`,
})
export class CostCategoryDonutChart {
	private svc = inject(BudgetService)

	includeTemporary = input<boolean>(true)
	mode = input<GroupMode>('detailed')

	groupAliasMap = input<Readonly<Record<string, string>> | undefined>(undefined)
	includeGroups = input<ReadonlyArray<string> | undefined>(undefined) // kvar som tidigare
	includeCategories = input<ReadonlyArray<Category> | undefined>(undefined)

	// (valfritt) om du vill kunna dölja Sparande i utgiftskakan
	includeSavingsAsExpense = input<boolean>(true)

	// map underkategori -> gruppnamn
	private groupNameByCategory = (() => {
		const m = new Map<Category, string>()
		for (const g of EXPENSE_CATEGORY_GROUPS) for (const c of g.items) m.set(c, g.label)
		return m
	})()

	private isCost = (t: EntryType) => t === 'cost'

	private totalsByCategory = computed(() => {
		const map = new Map<Category, number>()
		for (const e of this.svc.entries()) {
			if (!this.isCost(e.type)) continue
			if (!this.includeTemporary() && e.temporary) continue
			if (!e.category || !EXPENSE_CATEGORIES.includes(e.category)) continue
			if (!this.includeSavingsAsExpense() && e.category === Category.Savings) continue

			// 🔽 filter på kategori (gäller i detailed-läge)
			const allowedCats = this.includeCategories()
			if (allowedCats?.length && !allowedCats.includes(e.category)) continue

			map.set(e.category, (map.get(e.category) ?? 0) + (e.amount || 0))
		}
		return map
	})

	private totalsGrouped = computed(() => {
		if (this.mode() !== 'grouped') return null
		const byCat = this.totalsByCategory()
		const gMap = new Map<string, number>()
		const allowedGroups = this.includeGroups()
		const alias = this.groupAliasMap() ?? {}

		for (const [cat, cents] of byCat) {
			if (cents <= 0) continue
			const original = this.groupNameByCategory.get(cat) ?? 'Övrigt'
			const display = alias[original] ?? original // ⬅️ alias/sammanslagning här

			// filter sker på det aliasade namnet
			if (allowedGroups?.length && !allowedGroups.includes(display)) continue

			gMap.set(display, (gMap.get(display) ?? 0) + cents)
		}
		return gMap
	})

	title = computed(() => (this.mode() === 'grouped' ? 'Utgifter per grupp' : 'Utgifter per kategori'))

	labels = computed(() => {
		if (this.mode() === 'grouped') {
			const g = this.totalsGrouped()!
			return Array.from(g.entries())
				.filter(([, v]) => v > 0)
				.map(([name]) => name)
		} else {
			const byCat = this.totalsByCategory()
			const order = this.includeCategories()?.length ? this.includeCategories()! : EXPENSE_CATEGORIES
			return order.filter(c => (byCat.get(c) ?? 0) > 0).map(c => CATEGORY_LABEL[c] ?? String(c))
		}
	})

	values = computed(() => {
		if (this.mode() === 'grouped') {
			const g = this.totalsGrouped()!
			return Array.from(g.entries())
				.filter(([, v]) => v > 0)
				.map(([, v]) => v / 100)
		} else {
			const byCat = this.totalsByCategory()
			const order = this.includeCategories()?.length ? this.includeCategories()! : EXPENSE_CATEGORIES
			return order.filter(c => (byCat.get(c) ?? 0) > 0).map(c => byCat.get(c)! / 100)
		}
	})

	colors = computed(() => [
		'#0b6af9',
		'#22c55e',
		'#f59e0b',
		'#ef4444',
		'#8b5cf6',
		'#14b8a6',
		'#e11d48',
		'#a855f7',
		'#06b6d4',
		'#475569',
		'#f97316',
		'#84cc16',
		'#10b981',
		'#6366f1',
		'#f43f5e',
		'#3b82f6',
		'#06b6d4',
		'#8b5cf6',
		'#a3e635',
		'#f59e0b',
		'#ef4444',
		'#22c55e',
		'#14b8a6',
		'#eab308',
		'#60a5fa',
	])
}
