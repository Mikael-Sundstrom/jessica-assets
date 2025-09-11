// app/features/charts/total-chart.component.ts
import { Component, computed, inject, signal, ElementRef } from '@angular/core'
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
		<!-- säkra höjden vid tab-byte -->
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
export class TotalChart {
	private svc = inject(BudgetService)
	private cfg = inject(BudgetSettingsService)
	private doc = inject(DOCUMENT)
	private host = inject(ElementRef<HTMLElement>)

	// ===== Tema-färger (samma strategi som i CostChart) =====
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
		rgbOrHex.startsWith('rgb(') ? rgbOrHex.replace('rgb(', 'rgba(').replace(')', `, ${a})`) : rgbOrHex // låt hex vara oförändrat

	private colorMikael = computed(() => this.resolveColor('--mat-sys-tertiary'))
	private colorJessica = computed(() => this.resolveColor('--mat-sys-primary'))
	private colorTotal = computed(() => this.resolveColor('--mat-sys-outline'))

	// ===== Chart options =====
	readonly options = computed<ChartConfiguration<'bar'>['options']>(() => ({
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false, position: 'top' },
			title: { display: true, text: 'Netto (inkomster - kostnader)' },
			tooltip: {
				callbacks: {
					label: ctx => this.formatCurrency(Number(ctx.parsed.y)),
				},
			},
		},
		scales: {
			y: {
				ticks: { callback: v => this.formatCurrency(Number(v)) },
			},
		},
	}))

	private toSek = (cents: number) => Math.round(cents) / 100

	// Beräkna netto per person med/utan tillfälligt
	private computeNet(includeTemporary: boolean) {
		const includeAmort = this.cfg.costIncludeAmortizationAsExpense()
		const includeSavings = this.cfg.costIncludeSavingsAsExpense()
		const all = this.svc.entries()

		const isCost = (c: (typeof all)[number]) => {
			if (c.type !== 'cost') return false
			if (!includeTemporary && c.temporary) return false
			if (!includeAmort && c.category === 'finance.loan_amortization') return false
			if (!includeSavings && c.category.startsWith('savings.')) return false
			return true
		}
		const isIncome = (c: (typeof all)[number]) => {
			if (c.type !== 'income') return false
			if (!includeTemporary && c.temporary) return false
			return true
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

	// Data: alltid "Utan tillfälligt". Om togglad: lägg till "Med tillfälligt".
	readonly data = computed<ChartData<'bar'>>(() => {
		const base = this.computeNet(false) // utan tillfälligt
		const temp = this.computeNet(true) // med tillfälligt
		const showTemp = this.cfg.includeTemporary()

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
		return new Intl.NumberFormat('sv-SE', {
			style: 'currency',
			currency: 'SEK',
			maximumFractionDigits: 0,
		}).format(n)
	}
}
