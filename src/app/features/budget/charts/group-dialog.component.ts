// app/features/charts/group-dialog.component.ts
import { Component, inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatTableModule } from '@angular/material/table'

export interface GroupItem {
	title: string
	mikaelCents: number
	jessicaCents: number
}
export interface GroupDialogData {
	groupLabel: string
	items: GroupItem[]
}

@Component({
	selector: 'app-group-dialog',
	standalone: true,
	imports: [MatDialogModule, MatButtonModule, MatIconModule, MatTableModule],
	styles: [
		`
			@use '@angular/material' as mat;
			table {
				width: 100%;
				table-layout: fixed; /* Viktigt för att bredder ska funka */
				@include mat.table-overrides(
					(
						// background-color: color-mix(in srgb, var(--mat-sys-primary) 20%, white),
						row-item-label-text-size: 13px,
						header-headline-size: 14px,
						row-item-container-height: 35px,
						footer-supporting-text-weight: 600
					)
				);
			}

			/* Titel-kolumnen tar all plats som blir kvar */
			.mat-column-title {
				width: auto;
				padding-right: 8px;
				white-space: normal;
				word-break: break-word;
			}

			/* Mikael, Jessica och Summa med fasta bredder */
			.mat-column-mikael,
			.mat-column-jessica,
			.mat-column-total {
				width: 90px;
				text-align: right;
			}

			/* Gör så att rubriktext inte klipps */
			th.mat-header-cell {
				overflow: visible;
				white-space: nowrap;
			}

			.mat-mdc-dialog-title {
				font-weight: 400;
				text-align: center;
				font-size: 20px;
			}

			mat-dialog-content {
				max-height: 70vh;
				overflow: auto;
				padding: 0 !important;
			}
		`,
	],
	template: `
		<h2 mat-dialog-title>{{ data.groupLabel }}</h2>

		<mat-dialog-content>
			<table mat-table [dataSource]="data.items" class=" budget-table">
				<!-- Titel -->
				<ng-container matColumnDef="title">
					<th mat-header-cell *matHeaderCellDef>Titel</th>
					<td mat-cell *matCellDef="let row">{{ row.title }}</td>
					<td mat-footer-cell *matFooterCellDef>Summa</td>
				</ng-container>

				<!-- Mikael -->
				<ng-container matColumnDef="mikael">
					<th mat-header-cell *matHeaderCellDef>Mikael</th>
					<td mat-cell *matCellDef="let row">{{ format(row.mikaelCents) }}</td>
					<td mat-footer-cell *matFooterCellDef>{{ format(sum('mikael')) }}</td>
				</ng-container>

				<!-- Jessica -->
				<ng-container matColumnDef="jessica">
					<th mat-header-cell *matHeaderCellDef>Jessica</th>
					<td mat-cell *matCellDef="let row">{{ format(row.jessicaCents) }}</td>
					<td mat-footer-cell *matFooterCellDef>{{ format(sum('jessica')) }}</td>
				</ng-container>

				<!-- Total -->
				<ng-container matColumnDef="total">
					<th mat-header-cell *matHeaderCellDef>Summa</th>
					<td mat-cell *matCellDef="let row">{{ format(row.mikaelCents + row.jessicaCents) }}</td>
					<td mat-footer-cell *matFooterCellDef>{{ format(sum('total')) }}</td>
				</ng-container>

				<!-- Header, body och footer -->
				<tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
				<tr mat-row *matRowDef="let row; columns: displayedColumns" class="striped-row"></tr>
				<tr mat-footer-row *matFooterRowDef="displayedColumns"></tr>
			</table>
		</mat-dialog-content>

		<!-- <mat-dialog-actions align="end">
			<button mat-button mat-dialog-close>
				<mat-icon>close</mat-icon>
				Stäng
			</button>
		</mat-dialog-actions> -->
	`,
})
export class GroupDialogComponent {
	data = inject<GroupDialogData>(MAT_DIALOG_DATA)
	displayedColumns = ['title', 'mikael', 'jessica', 'total']

	private nf = new Intl.NumberFormat('sv-SE', {
		style: 'currency',
		currency: 'SEK',
		maximumFractionDigits: 0,
	})
	format = (cents: number) => this.nf.format(Math.round(cents) / 100)

	sum(which: 'mikael' | 'jessica' | 'total'): number {
		const m = this.data.items.reduce((a, r) => a + r.mikaelCents, 0)
		const j = this.data.items.reduce((a, r) => a + r.jessicaCents, 0)
		return which === 'mikael' ? m : which === 'jessica' ? j : m + j
	}
}
