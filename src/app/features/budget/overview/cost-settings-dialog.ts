// app/features/overview/cost-settings-dialog.ts
import { Component, inject, signal } from '@angular/core'
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

type View = 'total' | 'grouped' | 'detailed'

export interface CostSettingsData {
	view: View
	includeTemporary: boolean
	includeAmortization: boolean
	includeSavings: boolean
}

@Component({
	selector: 'app-cost-settings-dialog',
	standalone: true,
	imports: [MatDialogModule, MatButtonToggleModule, MatSlideToggleModule, MatButtonModule, MatIconModule],
	styles: [
		`
			.row {
				display: flex;
				gap: 1rem;
				align-items: center;
				flex-wrap: wrap;
			}
			.spacer {
				flex: 1;
			}
			.stack {
				display: flex;
				flex-direction: column;
				gap: 0.75rem;
				margin-top: 0.75rem;
			}
		`,
	],
	template: `
		<h2 mat-dialog-title>Diagraminställningar</h2>
		<mat-dialog-content>
			<div class="stack">
				<div class="row">
					<mat-button-toggle-group [value]="view()" (change)="view.set($event.value)">
						<mat-button-toggle value="total">Total</mat-button-toggle>
						<mat-button-toggle value="grouped">Grupperad</mat-button-toggle>
						<mat-button-toggle value="detailed">Detaljerad</mat-button-toggle>
					</mat-button-toggle-group>
				</div>

				<mat-slide-toggle [checked]="includeTemporary()" (change)="includeTemporary.set($event.checked)">
					Inkludera tillfälligt
				</mat-slide-toggle>

				<mat-slide-toggle [checked]="includeAmortization()" (change)="includeAmortization.set($event.checked)">
					Räkna amortering som utgift
				</mat-slide-toggle>

				<mat-slide-toggle [checked]="includeSavings()" (change)="includeSavings.set($event.checked)">
					Räkna sparande som utgift
				</mat-slide-toggle>
			</div>
		</mat-dialog-content>

		<mat-dialog-actions align="end">
			<button mat-button mat-dialog-close>
				<mat-icon>close</mat-icon>
				Avbryt
			</button>
			<button mat-raised-button color="primary" (click)="save()">
				<mat-icon>check</mat-icon>
				Spara
			</button>
		</mat-dialog-actions>
	`,
})
export class CostSettingsDialog {
	private ref = inject(MatDialogRef<CostSettingsDialog, CostSettingsData>)
	private data = inject<CostSettingsData>(MAT_DIALOG_DATA)

	// lokala signals
	view = signal<View>(this.data.view)
	includeTemporary = signal(this.data.includeTemporary)
	includeAmortization = signal(this.data.includeAmortization)
	includeSavings = signal(this.data.includeSavings)

	save() {
		this.ref.close({
			view: this.view(),
			includeTemporary: this.includeTemporary(),
			includeAmortization: this.includeAmortization(),
			includeSavings: this.includeSavings(),
		})
	}
}
