import { Component, computed, effect, input, signal } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { CostCategoryDonutChart } from '../cost-category-donut-chart'

type Preset = 'combined' | 'separate' | 'all'

@Component({
	selector: 'app-cost-groups-card',
	standalone: true,
	imports: [MatCardModule, MatButtonToggleModule, MatSlideToggleModule, CostCategoryDonutChart],
	template: `
		<mat-card>
			<div class="controls" style="display:flex;gap:.75rem;align-items:center;padding:.5rem 0 .75rem;">
				<mat-button-toggle-group [value]="preset()" (change)="onPresetChange($event.value)">
					<mat-button-toggle value="combined">Boende+Mat ihop</mat-button-toggle>
					<mat-button-toggle value="separate">Separata</mat-button-toggle>
					<mat-button-toggle value="all">Alla</mat-button-toggle>
				</mat-button-toggle-group>

				<span style="flex:1"></span>

				<mat-slide-toggle [checked]="includeTemporary()" (change)="onTempToggle($event.checked)">
					Inkludera tillfälligt
				</mat-slide-toggle>
			</div>

			<app-cost-category-donut-chart
				[mode]="'grouped'"
				[includeTemporary]="includeTemporary()"
				[groupAliasMap]="aliasMap()"
				[includeGroups]="groups()"
				[includeSavingsAsExpense]="true"
			/>
		</mat-card>
	`,
})
export class CostGroupsCard {
	// 🔹 extern input (read-only)
	includeTemporaryIn = input(false)

	// 🔹 internt skrivbar signal för UI:t
	includeTemporary = signal(false)

	// 🔹 håll dem i synk: om föräldern ändrar inputen följer vi med
	private sync = effect(() => {
		this.includeTemporary.set(this.includeTemporaryIn())
	})

	// UI-state
	preset = signal<Preset>('combined')

	onPresetChange(v: Preset) {
		this.preset.set(v)
	}
	onTempToggle(checked: boolean) {
		this.includeTemporary.set(checked)
	}

	aliasMap = computed(() =>
		this.preset() === 'combined'
			? ({ 'Boende & drift': 'Boende & mat', 'Mat & hushåll': 'Boende & mat' } as const)
			: undefined
	)

	groups = computed<ReadonlyArray<string> | undefined>(() => {
		switch (this.preset()) {
			case 'combined':
				return ['Boende & mat', 'Transport', 'Sparande']
			case 'separate':
				return ['Boende & drift', 'Mat & hushåll', 'Transport', 'Sparande']
			case 'all':
				return undefined // visa alla
		}
	})
}
