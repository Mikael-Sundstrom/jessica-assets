// bar-chart.ts
import { Component, Input, OnChanges } from '@angular/core'
import { BaseChartDirective } from 'ng2-charts'
import { ChartData, ChartOptions, TooltipItem } from 'chart.js'

type Series = { label: string; data: ReadonlyArray<number>; hidden?: boolean; color?: string }

@Component({
	selector: 'app-bar-chart',
	standalone: true,
	imports: [BaseChartDirective],
	templateUrl: './bar-chart.html',
	styleUrls: ['./bar-chart.scss'],
	host: { ngSkipHydration: 'true' },
})
export class BarChart implements OnChanges {
	@Input() labels: ReadonlyArray<string> = []
	@Input() datasets: ReadonlyArray<Series> = []
	@Input() currency: string = 'SEK'
	@Input() title?: string
	@Input() subtitle?: string
	@Input() groupColors?: ReadonlyArray<string>
	@Input() horizontal = false

	private fmt = (n: number) =>
		new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: this.currency,
			maximumFractionDigits: 0,
		}).format(n)

	barData: ChartData<'bar', number[], string> = { labels: [], datasets: [] }

	barOptions: ChartOptions<'bar'> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: true },
			tooltip: {
				callbacks: {
					label: (ctx: TooltipItem<'bar'>) => `${ctx.dataset.label}: ${this.fmt(+ctx.parsed.y)}`,
				},
			},
		},
		scales: {
			x: { grid: { display: false } },
			y: { ticks: { callback: val => this.fmt(Number(val)) } },
		},
	}

	private cssVar(name: string, fallback: string) {
		const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
		return v || fallback
	}
	private hexToRgba(hex: string, a: number) {
		const h = hex.replace('#', '')
		const v =
			h.length === 3
				? h
						.split('')
						.map(c => c + c)
						.join('')
				: h
		const n = parseInt(v, 16)
		const r = (n >> 16) & 255,
			g = (n >> 8) & 255,
			b = n & 255
		return `rgba(${r}, ${g}, ${b}, ${a})`
	}

	ngOnChanges(): void {
		const prevHidden = this.barData.datasets.map(d => (d as any).hidden)

		const defaults = [
			this.cssVar('--md-sys-color-primary', '#3b82f6'),
			this.cssVar('--md-sys-color-secondary', '#22c55e'),
			this.cssVar('--md-sys-color-tertiary', '#8b5cf6'),
		]

		const bases = (this.groupColors?.length ? this.groupColors : defaults).slice(0, this.labels.length)

		// Nyans per dataset:
		//  - Ordinarie = ljus nyans
		//  - Tillfälligt = tydligare nyans av samma färg
		const bgOrd = bases.map(c => this.hexToRgba(c, 0.35))
		const brdOrd = bases.map(c => this.hexToRgba(c, 0.9))
		const bgTemp = bases.map(c => this.hexToRgba(c, 0.65))
		const brdTemp = bases.map(c => this.hexToRgba(c, 1.0))

		this.barData = {
			labels: Array.from(this.labels),
			datasets: this.datasets.map((s, i) => {
				const bg = i === 0 ? bgOrd : bgTemp // dataset 0: Ordinarie, dataset 1: Tillfälligt
				const brd = i === 0 ? brdOrd : brdTemp
				return {
					label: s.label,
					data: Array.from(s.data),
					hidden: s.hidden ?? prevHidden[i] ?? false,
					backgroundColor: bg.slice(0, this.labels.length),
					borderColor: brd.slice(0, this.labels.length),
					borderWidth: 1,
					borderRadius: 6,
				}
			}),
		}

		// uppdatera formatter med ev. ny valuta

		const valueTicks = { callback: (v: any) => this.fmt(Number(v)) }

		this.barOptions = {
			responsive: true,
			maintainAspectRatio: false,
			indexAxis: this.horizontal ? 'y' : 'x',
			plugins: {
				legend: { display: true },
				title: {
					// 👈 Title-plugin
					display: !!this.title,
					text: this.title,
				},
				subtitle: {
					// 👈 (valfritt) Subtitle
					display: !!this.subtitle,
					text: this.subtitle,
				},
				tooltip: {
					callbacks: {
						label: ctx => {
							// värdeaxeln är x vid horisontell
							const val = this.horizontal ? +ctx.parsed.x : +ctx.parsed.y
							return `${ctx.dataset.label}: ${this.fmt(val)}`
						},
					},
				},
			},
			scales: this.horizontal
				? { x: { ticks: valueTicks, grid: { display: true } }, y: { grid: { display: false } } }
				: { x: { grid: { display: false } }, y: { ticks: valueTicks } },
		}
	}
}
