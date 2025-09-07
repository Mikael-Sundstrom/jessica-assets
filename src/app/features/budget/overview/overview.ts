import { Component, computed, inject } from '@angular/core'
import { MatGridListModule } from '@angular/material/grid-list'
import { BreakpointObserver } from '@angular/cdk/layout'
import { CostChart } from '../charts/cost-chart.component'
import { IncomeChart } from '../charts/income-chart.component'
import { TotalChart } from '../charts/total-chart.component'
import { MatDividerModule } from '@angular/material/divider'
import { MatCardModule } from '@angular/material/card'
import { toSignal } from '@angular/core/rxjs-interop'
import { distinctUntilChanged, map } from 'rxjs'

@Component({
	selector: 'app-overview',
	standalone: true,
	imports: [MatGridListModule, MatDividerModule, MatCardModule, CostChart, IncomeChart, TotalChart],
	templateUrl: './overview.html',
	styleUrl: './overview.scss',
})
export class Overview {
	private bp = inject(BreakpointObserver)

	// true under 700px
	private narrow = toSignal(
		this.bp.observe('(max-width: 699px)').pipe(
			map(r => r.matches),
			distinctUntilChanged()
		),
		{ initialValue: false }
	)

	cols = computed(() => (this.narrow() ? 1 : 2))
	totalColspan = computed(() => (this.cols() === 1 ? 1 : 2))
}
