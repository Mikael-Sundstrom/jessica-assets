// app/features/charts/cost-chart.component.ts
import { Component, computed, ElementRef, inject, ViewChild, AfterViewInit, OnDestroy } from '@angular/core'
import { BaseChartDirective } from 'ng2-charts'
import { ChartConfiguration, ChartData } from 'chart.js'
import { MatDialog } from '@angular/material/dialog'
import { BudgetService } from '../budget.service'
import { BudgetSettingsService } from '../budget-settings.service'
import { TOPGROUP_LABEL, HouseholdEntry, TopGroup } from '../budget.model'
import { DOCUMENT } from '@angular/common'
import { GroupDialogComponent, GroupItem } from './group-dialog.component'

type View = 'total' | 'grouped' | 'detailed'

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
			(chartClick)="onChartClick($event)"
		></canvas>
	`,
	styles: [
		`
			.cost-chart {
				width: 100%;
				margin: 1rem;
			}
		`,
	],
})
export class CostChart implements AfterViewInit, OnDestroy {
	private doc = inject(DOCUMENT)
	private host = inject(ElementRef<HTMLElement>)
	private dialog = inject(MatDialog)
	private detailedInfo = computed(() => this.buildDetailedWithOthers())

	private svc = inject(BudgetService)
	private cfg = inject(BudgetSettingsService)

	@ViewChild(BaseChartDirective) chart?: BaseChartDirective
	private io?: IntersectionObserver

	// === Färger (samma som innan) ===
	private colorMikael = computed(() => this.resolveColor('--mat-sys-tertiary'))
	private colorJessica = computed(() => this.resolveColor('--mat-sys-primary'))
	private colorTotal = computed(() => this.resolveColor('--mat-sys-secondary'))

	private resolveColor = (cssVarName: string): string => {
		const probe = this.doc.createElement('div')
		probe.style.display = 'none'
		probe.style.color = `var(${cssVarName})`
		const container = this.host.nativeElement
		container.appendChild(probe)
		const resolved = getComputedStyle(probe).color
		probe.remove()
		if (!resolved) {
			const raw = getComputedStyle(this.doc.documentElement).getPropertyValue(cssVarName).trim()
			const m = raw.match(/light-dark\(([^,]+),\s*([^)]+)\)/)
			if (m) {
				const isDark = matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
				return (isDark ? m[2] : m[1]).trim()
			}
			return raw || '#000'
		}
		return resolved
	}

	chartHeight = computed(() => (this.cfg.costView() === 'detailed' ? 600 : 400))

	readonly options = computed<ChartConfiguration<'bar'>['options']>(() => {
		const isGrouped = this.cfg.costView() === 'grouped'
		return {
			responsive: true,
			maintainAspectRatio: false,
			resizeDelay: 0,
			indexAxis: 'y',
			plugins: {
				legend: { display: true, position: 'top' },
				title: { display: true, text: 'Kostnader' },
				tooltip: { enabled: false }, // 👈 rätt sätt att stänga av tooltip
			},
			scales: {
				x: {
					stacked: isGrouped,
					beginAtZero: true,
					ticks: { callback: v => this.formatCurrency(Number(v)) },
				},
				y: { stacked: isGrouped },
			},
		}
	})

	// ————— Data-filter (samma) —————
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

	// === Returnera rätt ChartData och håll “othersItems” tillgängligt ===

	readonly data = computed<ChartData<'bar'>>(() => {
		const view = this.cfg.costView() as View
		if (view === 'total') return this.buildTotal()
		if (view === 'grouped') return this.groupedInfo().chart
		return this.detailedInfo().chart
	})

	// ————— Helpers —————
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
		return (cat.includes('.') ? cat.split('.')[0] : cat) as TopGroup
	}

	// ————— Vyer —————

	private buildTotal(): ChartData<'bar'> {
		const rows = this.filteredCosts()
		const sumCents = (person?: 'mikael' | 'jessica') =>
			rows.filter(e => (person ? e.person === person : true)).reduce((a, e) => a + e.amount, 0)
		const mikael = this.toSek(sumCents('mikael'))
		const jessica = this.toSek(sumCents('jessica'))
		const total = mikael + jessica
		return {
			labels: ['Mikael', 'Jessica', 'Totalt'],
			datasets: [
				{
					label: 'Kostnader',
					data: [mikael, jessica, total],
					backgroundColor: [this.colorMikael(), this.colorJessica(), this.colorTotal()],
					borderWidth: 0,
				},
			],
		}
	}

	private buildGrouped(): ChartData<'bar'> {
		const rows = this.filteredCosts()

		// 1) Summera per toppgrupp
		const groups = new Map<TopGroup, { mikael: number; jessica: number }>()
		for (const e of rows) {
			const g = this.topGroupKey(e.category) // -> TopGroup
			if (!groups.has(g)) groups.set(g, { mikael: 0, jessica: 0 })
			groups.get(g)![e.person] += e.amount
		}

		// 2) Flytta smågrupper (< 500 kr total) till befintlig 'other' (Övrigt)
		const LIMIT_CENTS = 500 * 100
		const OTHER_KEY: TopGroup = 'other'
		if (!groups.has(OTHER_KEY)) groups.set(OTHER_KEY, { mikael: 0, jessica: 0 })

		for (const [key, val] of Array.from(groups.entries())) {
			if (key === OTHER_KEY) continue
			const total = val.mikael + val.jessica
			if (total > 0 && total < LIMIT_CENTS) {
				const o = groups.get(OTHER_KEY)!
				o.mikael += val.mikael
				o.jessica += val.jessica
				groups.delete(key)
			}
		}

		// 3) Sortera kvarvarande grupper (störst först) och lägg Övrigt sist
		const keys = Array.from(groups.keys())
			.filter(k => k !== OTHER_KEY)
			.sort((a, b) => {
				const A = groups.get(a)!
				const B = groups.get(b)!
				return B.mikael + B.jessica - (A.mikael + A.jessica)
			})

		const labels: string[] = keys.map(k => TOPGROUP_LABEL[k])
		const dataMikael: number[] = keys.map(k => this.toSek(groups.get(k)!.mikael))
		const dataJessica: number[] = keys.map(k => this.toSek(groups.get(k)!.jessica))

		// 4) Övrigt sist (endast om > 0)
		const other = groups.get(OTHER_KEY)!
		if (other.mikael + other.jessica > 0) {
			labels.push(TOPGROUP_LABEL[OTHER_KEY]) // "Övrigt"
			dataMikael.push(this.toSek(other.mikael))
			dataJessica.push(this.toSek(other.jessica))
		}

		return {
			labels,
			datasets: [
				{ label: 'Mikael', data: dataMikael, backgroundColor: this.colorMikael(), borderWidth: 0 },
				{ label: 'Jessica', data: dataJessica, backgroundColor: this.colorJessica(), borderWidth: 0 },
			],
		}
	}

	// === Detaljerad med per-person-tröskel OCH lista över vad som hamnade i Övrigt ===
	private buildDetailedWithOthers(): { chart: ChartData<'bar'>; others: GroupItem[]; othersLabel: string } {
		const rows = this.filteredCosts()
		const buckets = new Map<string, { mikael: number; jessica: number }>()
		for (const e of rows) {
			const key = e.title || '(utan titel)'
			if (!buckets.has(key)) buckets.set(key, { mikael: 0, jessica: 0 })
			buckets.get(key)![e.person] += e.amount
		}

		const LIMIT_CENTS = 400 * 100
		const OTHERS_KEY = `Övrigt (< ${LIMIT_CENTS / 100} kr)`
		const others = { mikael: 0, jessica: 0 }
		const othersItems: GroupItem[] = []

		for (const [key, val] of Array.from(buckets.entries())) {
			let movedM = 0,
				movedJ = 0
			if (val.mikael > 0 && val.mikael < LIMIT_CENTS) {
				movedM = val.mikael
				others.mikael += val.mikael
				val.mikael = 0
			}
			if (val.jessica > 0 && val.jessica < LIMIT_CENTS) {
				movedJ = val.jessica
				others.jessica += val.jessica
				val.jessica = 0
			}
			if (movedM || movedJ) {
				othersItems.push({ title: key, mikaelCents: movedM, jessicaCents: movedJ })
			}
			if (val.mikael + val.jessica === 0) buckets.delete(key)
		}
		if (others.mikael + others.jessica > 0) buckets.set(OTHERS_KEY, others)

		const visibleTotal = (v: { mikael: number; jessica: number }) => v.mikael + v.jessica
		const all = Array.from(buckets.entries())
		const nonOthers = all.filter(([k]) => k !== OTHERS_KEY)
		const filtered = nonOthers
			.filter(([, v]) => visibleTotal(v) > 0)
			.sort(([, a], [, b]) => visibleTotal(b) - visibleTotal(a))
		const labels = filtered.map(([k]) => k)
		if (buckets.has(OTHERS_KEY) && visibleTotal(buckets.get(OTHERS_KEY)!) > 0) labels.push(OTHERS_KEY)

		const dataMikael = labels.map(k => this.toSek(buckets.get(k)!.mikael))
		const dataJessica = labels.map(k => this.toSek(buckets.get(k)!.jessica))

		return {
			chart: {
				labels,
				datasets: [
					{ label: 'Mikael', data: dataMikael, backgroundColor: this.colorMikael(), borderWidth: 0 },
					{ label: 'Jessica', data: dataJessica, backgroundColor: this.colorJessica(), borderWidth: 0 },
				],
			},
			others: othersItems,
			othersLabel: OTHERS_KEY,
		}
	}

	private groupedInfo = computed(() => this.buildGroupedWithItems())

	private buildGroupedWithItems(): {
		chart: ChartData<'bar'>
		itemsByLabel: Record<string, GroupItem[]>
	} {
		const rows = this.filteredCosts()

		// a) bucket per toppgrupp + per titel
		const byGroup = new Map<TopGroup, Map<string, { mikael: number; jessica: number }>>()
		for (const e of rows) {
			const g = this.topGroupKey(e.category)
			if (!byGroup.has(g)) byGroup.set(g, new Map())
			const perTitle = byGroup.get(g)!
			const t = e.title || '(utan titel)'
			if (!perTitle.has(t)) perTitle.set(t, { mikael: 0, jessica: 0 })
			perTitle.get(t)![e.person] += e.amount
		}

		// b) summera per toppgrupp
		const groups = new Map<TopGroup, { mikael: number; jessica: number }>()
		for (const [g, titles] of byGroup.entries()) {
			let m = 0,
				j = 0
			for (const v of titles.values()) {
				m += v.mikael
				j += v.jessica
			}
			groups.set(g, { mikael: m, jessica: j })
		}

		// c) flytta smågrupper (< 500 kr) in i existing 'other'
		const LIMIT_CENTS = 500 * 100
		const OTHER_KEY: TopGroup = 'other'
		if (!groups.has(OTHER_KEY)) groups.set(OTHER_KEY, { mikael: 0, jessica: 0 })
		if (!byGroup.has(OTHER_KEY)) byGroup.set(OTHER_KEY, new Map())

		for (const [g, sum] of Array.from(groups.entries())) {
			if (g === OTHER_KEY) continue
			const total = sum.mikael + sum.jessica
			if (total > 0 && total < LIMIT_CENTS) {
				// slå ihop alla dess titlar in i Övrigt
				const dest = byGroup.get(OTHER_KEY)!
				for (const [title, val] of byGroup.get(g)!.entries()) {
					if (!dest.has(title)) dest.set(title, { mikael: 0, jessica: 0 })
					const d = dest.get(title)!
					d.mikael += val.mikael
					d.jessica += val.jessica
				}
				const o = groups.get(OTHER_KEY)!
				o.mikael += sum.mikael
				o.jessica += sum.jessica
				byGroup.delete(g)
				groups.delete(g)
			}
		}

		// d) sortera grupper (Övrigt sist)
		const keys = Array.from(groups.keys())
			.filter(k => k !== OTHER_KEY)
			.sort((a, b) => {
				const A = groups.get(a)!
				const B = groups.get(b)!
				return B.mikael + B.jessica - (A.mikael + A.jessica)
			})

		const labels: string[] = keys.map(k => TOPGROUP_LABEL[k])
		const dataMikael: number[] = keys.map(k => this.toSek(groups.get(k)!.mikael))
		const dataJessica: number[] = keys.map(k => this.toSek(groups.get(k)!.jessica))

		const other = groups.get(OTHER_KEY)!
		if (other && other.mikael + other.jessica > 0) {
			labels.push(TOPGROUP_LABEL[OTHER_KEY])
			dataMikael.push(this.toSek(other.mikael))
			dataJessica.push(this.toSek(other.jessica))
		}

		// e) mappa label -> items (sorterade störst→minst)
		const itemsByLabel: Record<string, GroupItem[]> = {}
		for (const [g, titles] of byGroup.entries()) {
			const label = TOPGROUP_LABEL[g]
			const arr: GroupItem[] = Array.from(titles.entries()).map(([title, v]) => ({
				title,
				mikaelCents: v.mikael,
				jessicaCents: v.jessica,
			}))
			arr.sort((a, b) => b.mikaelCents + b.jessicaCents - (a.mikaelCents + a.jessicaCents))
			itemsByLabel[label] = arr
		}

		return {
			chart: {
				labels,
				datasets: [
					{ label: 'Mikael', data: dataMikael, backgroundColor: this.colorMikael(), borderWidth: 0 },
					{ label: 'Jessica', data: dataJessica, backgroundColor: this.colorJessica(), borderWidth: 0 },
				],
			},
			itemsByLabel,
		}
	}

	// ——— Klick på diagrammet: öppna dialog om användaren klickade på Övrigt ———
	onChartClick(evt: { event?: import('chart.js').ChartEvent; active?: object[] }) {
		const labels = (this.data().labels ?? []) as string[]
		const idx = (evt?.active?.[0] as any)?.index
		if (typeof idx !== 'number') return
		const clicked = labels[idx]
		const view = this.cfg.costView()

		if (view === 'grouped') {
			const g = this.groupedInfo()
			const items = g.itemsByLabel[clicked]
			if (items?.length) {
				this.dialog.open(GroupDialogComponent, {
					data: { groupLabel: clicked, items },
				})
			}
			return
		}

		if (view === 'detailed') {
			const info = this.detailedInfo()
			if (clicked === info.othersLabel && info.others.length > 0) {
				this.dialog.open(GroupDialogComponent, { data: { groupLabel: info.othersLabel, items: info.others } })
			}
		}
	}

	// ——— Stabil höjd vid tabb-byte ———
	ngAfterViewInit() {
		this.io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					queueMicrotask(() => {
						this.chart?.chart?.resize()
						this.chart?.update()
					})
				}
			},
			{ threshold: 0.01 }
		)
		this.io.observe(this.host.nativeElement)
	}
	ngOnDestroy() {
		this.io?.disconnect()
	}
}
