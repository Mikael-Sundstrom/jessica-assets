// app/features/charts/total-chart.component.ts
import { Component, computed, inject, ElementRef, OnDestroy, signal } from '@angular/core'
import { BaseChartDirective } from 'ng2-charts'
import { ChartConfiguration, ChartData } from 'chart.js'
import { BudgetService } from '../budget.service'
import { BudgetSettingsService } from '../budget-settings.service'
import { DOCUMENT } from '@angular/common'

@Component({
	selector: 'app-total-chart',
	standalone: true,
	imports: [BaseChartDirective],
	template: `
		<canvas baseChart [data]="data()" [options]="options()" type="bar" [height]="300" class="total-chart"></canvas>
	`,
	styles: [
		`
			.total-chart {
				width: 100%;
				margin: 1rem;
			}
		`,
	],
})
export class TotalChart implements OnDestroy {
	private svc = inject(BudgetService)
	private cfg = inject(BudgetSettingsService)
	private doc = inject(DOCUMENT)
	private host = inject(ElementRef<HTMLElement>)

	// === Lägg till överst i klassen ===
	private themeClass = signal<'light' | 'dark' | 'rose' | 'blue'>(this.readThemeClass())
	private mo?: MutationObserver
	private neutralChart = {
		mikael: '#005cbbcc',
		jessica: '#ba005ccc',
		total: '#666666cc',
	}
	private readThemeClass(): 'light' | 'dark' | 'rose' | 'blue' {
		const c = this.doc.documentElement.classList
		if (c.contains('theme-rose')) return 'rose'
		if (c.contains('theme-blue')) return 'blue'
		if (c.contains('theme-dark')) return 'dark'
		return 'light'
	}

	// ===== Tema-färger =====
	private resolveColor = (cssVarName: string): string => {
		const probe = this.doc.createElement('div')
		probe.style.display = 'none'
		probe.style.color = `var(${cssVarName})`
		this.host.nativeElement.appendChild(probe)
		const resolved = getComputedStyle(probe).color
		probe.remove()
		return resolved || '#455a64'
	}
	private withAlpha = (rgbOrHex: string, a: number) =>
		rgbOrHex.startsWith('rgb(') ? rgbOrHex.replace('rgb(', 'rgba(').replace(')', `, ${a})`) : rgbOrHex

	private labelColor = computed(() => {
		this.themeClass() // <- skapa beroende
		return this.resolveColor('--mat-sys-on-surface')
	})
	private gridColor = computed(() => {
		this.themeClass() // <- skapa beroende
		return this.withAlpha(this.resolveColor('--mat-sys-outline-variant'), 0.18)
	})

	// Välj färgkälla beroende på tema
	private colorMikael = computed(() => {
		const t = this.themeClass()
		if (t === 'light' || t === 'dark') return this.neutralChart.mikael
		return this.resolveColor('--mat-sys-tertiary')
	})
	private colorJessica = computed(() => {
		const t = this.themeClass()
		if (t === 'light' || t === 'dark') return this.neutralChart.jessica
		return this.resolveColor('--mat-sys-primary')
	})
	private colorTotal = computed(() => {
		const t = this.themeClass()
		if (t === 'light' || t === 'dark') return this.neutralChart.total
		return this.resolveColor('--mat-sys-secondary')
	})

	// ===== Chart options =====
	readonly options = computed<ChartConfiguration<'bar'>['options']>(() => ({
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false, position: 'top' },
			title: { display: true, text: 'Resultat' },
			subtitle: { display: true, text: '' },
			tooltip: {
				callbacks: { label: ctx => this.formatCurrency(Number(ctx.parsed.y)) },
			},
		},
		scales: {
			x: {
				ticks: {
					color: this.labelColor(),
				},
				grid: { color: this.gridColor() },
			},
			y: {
				ticks: {
					color: this.labelColor(),
					callback: v => this.formatCurrency(Number(v)),
				},
				grid: { color: this.gridColor() },
			},
		},
	}))

	private toSek = (cents: number) => Math.round(cents) / 100

	// ===== Netto-beräkning =====
	private computeNet(includeTemporary: boolean) {
		const includeAmort = this.cfg.totalIncludeAmortizationAsExpense()
		const savingsAsExpense = this.cfg.totalIncludeSavingsAsExpense()
		const all = this.svc.entries()
		const isSavings = (e: (typeof all)[number]) => e.type === 'cost' && e.category?.startsWith('savings.')

		const isCost = (e: (typeof all)[number]) => {
			if (e.type !== 'cost') return false
			if (!includeTemporary && e.temporary) return false
			if (!includeAmort && e.category === 'finance.loan_amortization') return false
			if (!savingsAsExpense && isSavings(e)) return false // ignorera sparande
			return true
		}

		const isIncome = (e: (typeof all)[number]) => {
			if (!includeTemporary && e.temporary) return false
			return e.type === 'income' // <-- ta bort specialfallet
		}

		const sum = (pred: (x: (typeof all)[number]) => boolean, person?: 'mikael' | 'jessica') =>
			all
				.filter(pred)
				.filter(e => (person ? e.person === person : true))
				.reduce((a, e) => a + e.amount, 0)

		const costM = sum(isCost, 'mikael')
		const costJ = sum(isCost, 'jessica')
		const incM = sum(isIncome, 'mikael')
		const incJ = sum(isIncome, 'jessica')

		const netM = this.toSek(incM - costM)
		const netJ = this.toSek(incJ - costJ)
		const netT = netM + netJ
		return { netM, netJ, netT }
	}

	// ===== Data =====
	readonly data = computed<ChartData<'bar'>>(() => {
		const base = this.computeNet(false)
		const temp = this.computeNet(true)
		const showTemp = this.cfg.totalIncludeTemporary()

		const labels = ['Mikael', 'Jessica', 'Totalt']
		const datasets: ChartData<'bar'>['datasets'] = [
			{
				label: 'Utan tillfälligt',
				data: [base.netM, base.netJ, base.netT],
				backgroundColor: [this.colorMikael(), this.colorJessica(), this.colorTotal()],
				borderWidth: 0,
			},
		]

		if (showTemp) {
			datasets.push({
				label: 'Med tillfälligt',
				data: [temp.netM, temp.netJ, temp.netT],
				backgroundColor: [
					this.withAlpha(this.colorMikael(), 0.55),
					this.withAlpha(this.colorJessica(), 0.55),
					this.withAlpha(this.colorTotal(), 0.55),
				],
				borderWidth: 0,
			})
		}

		return { labels, datasets }
	})

	private formatCurrency(n: number): string {
		return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(
			n
		)
	}

	// Lyssna på tema-byte (klass på <html>) och uppdatera diagrammet
	constructor() {
		this.mo = new MutationObserver(() => {
			this.themeClass.set(this.readThemeClass())
		})
		this.mo.observe(this.doc.documentElement, { attributes: true, attributeFilter: ['class'] })
	}

	ngOnDestroy() {
		this.mo?.disconnect()
	}
}
