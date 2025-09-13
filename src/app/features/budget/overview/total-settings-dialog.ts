import { Component, inject, signal } from '@angular/core'
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

export interface TotalSettingsData {
	includeTemporary: boolean
	includeAmortization: boolean
	includeSavings: boolean
}

@Component({
	selector: 'app-total-settings-dialog',
	standalone: true,
	imports: [MatDialogModule, MatSlideToggleModule, MatButtonModule, MatIconModule],
	styles: [
		`
			.stack {
				display: flex;
				flex-direction: column;
				gap: 0.75rem;
				margin-top: 0.75rem;
			}
			.stack-toggle {
				display: grid;
				gap: 12px;
				margin-inline: auto;
			}
		`,
	],
	template: `
		<h2 mat-dialog-title>Diagraminställningar (Netto)</h2>
		<mat-dialog-content>
			<div class="stack">
				<div class="stack-toggle">
					<mat-slide-toggle [checked]="includeTemporary()" (change)="includeTemporary.set($event.checked)">
						Inkludera tillfälligt
					</mat-slide-toggle>

					<mat-slide-toggle
						[checked]="includeAmortization()"
						(change)="includeAmortization.set($event.checked)"
					>
						Räkna amortering som utgift
					</mat-slide-toggle>

					<mat-slide-toggle [checked]="includeSavings()" (change)="includeSavings.set($event.checked)">
						Räkna sparande som utgift
					</mat-slide-toggle>
				</div>
			</div>
		</mat-dialog-content>

		<mat-dialog-actions align="end">
			<button mat-button mat-dialog-close class="btn-cancel"><mat-icon>close</mat-icon>Avbryt</button>
			<span class="spacer"></span>
			<button mat-raised-button (click)="save()" class="btn-primary"><mat-icon>check</mat-icon>Spara</button>
		</mat-dialog-actions>
	`,
})
export class TotalSettingsDialog {
	private ref = inject(MatDialogRef<TotalSettingsDialog, TotalSettingsData>)
	private data = inject<TotalSettingsData>(MAT_DIALOG_DATA)

	includeTemporary = signal(this.data.includeTemporary)
	includeAmortization = signal(this.data.includeAmortization)
	includeSavings = signal(this.data.includeSavings)

	save() {
		this.ref.close({
			includeTemporary: this.includeTemporary(),
			includeAmortization: this.includeAmortization(),
			includeSavings: this.includeSavings(),
		})
	}
}
