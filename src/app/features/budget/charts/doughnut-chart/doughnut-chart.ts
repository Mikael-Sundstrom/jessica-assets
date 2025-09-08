// bar-chart.ts
import { Component, Input, OnChanges } from '@angular/core'
import { BaseChartDirective } from 'ng2-charts'
import { ChartData, ChartOptions, TooltipItem } from 'chart.js'

type Series = { label: string; data: ReadonlyArray<number>; hidden?: boolean; color?: string }

@Component({
	selector: 'app-doughnut-chart',
	standalone: true,
	imports: [BaseChartDirective],
	templateUrl: './doughnut-chart.html',
	styleUrls: ['./doughnut-chart.scss'],
	host: { ngSkipHydration: 'true' },
})
export class DoughnutChart implements OnChanges {
	@Input() labels: ReadonlyArray<string> = []
	@Input() values: ReadonlyArray<number> = [] // i samma enhet som du vill visa (t.ex. SEK)
	@Input() title?: string
	@Input() currency: string = 'SEK'
	@Input() colors?: ReadonlyArray<string>
	@Input() height = 320
	@Input() cutout = 60

	data: ChartData<'doughnut', number[], string> = { labels: [], datasets: [] }

	options: ChartOptions<'doughnut'> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: true, position: 'bottom' },
			title: { display: false, text: '' },
			tooltip: {
				callbacks: {
					label: (ctx: TooltipItem<'doughnut'>) => this.tooltipLabel(ctx),
				},
			},
		},
		cutout: `${this.cutout}%`,
	}

	private fmtCurrency = (n: number) =>
		new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: this.currency,
			maximumFractionDigits: 0,
		}).format(n)

	private tooltipLabel(ctx: TooltipItem<'doughnut'>) {
		const val = Number(ctx.parsed)
		const sum = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0) || 1
		const pct = Math.round((val / sum) * 100)
		return `${ctx.label}: ${this.fmtCurrency(val)} (${pct}%)`
	}

	private cssVar(name: string, fallback: string) {
		const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
		return v || fallback
	}

	ngOnChanges(): void {
		const defaults = [
			this.cssVar('--md-sys-color-primary', '#3b82f6'),
			this.cssVar('--md-sys-color-secondary', '#22c55e'),
			this.cssVar('--md-sys-color-tertiary', '#8b5cf6'),
			this.cssVar('--md-sys-color-primary-fixed', '#94b6ff'),
			this.cssVar('--md-sys-color-secondary-fixed', '#a7f3d0'),
			this.cssVar('--md-sys-color-tertiary-fixed', '#c4b5fd'),
			'#f59e0b',
			'#ef4444',
			'#10b981',
			'#6366f1',
			'#14b8a6',
		]

		const palette = (this.colors?.length ? this.colors : defaults).slice(0, this.labels.length)

		this.data = {
			labels: Array.from(this.labels),
			datasets: [
				{
					data: Array.from(this.values),
					backgroundColor: palette,
					borderWidth: 1,
				},
			],
		}

		this.options = {
			...this.options,
			plugins: {
				...this.options.plugins,
				title: { display: !!this.title, text: this.title },
			},
			cutout: `${this.cutout}%`,
		}
	}
}
