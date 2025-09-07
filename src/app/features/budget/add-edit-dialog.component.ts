import { Component, computed, inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { FormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatSelectModule } from '@angular/material/select'
import { MatCheckboxModule } from '@angular/material/checkbox'
import {
	Category,
	CATEGORY_LABEL,
	INCOME_CATEGORY_GROUPS,
	EXPENSE_CATEGORY_GROUPS,
	CategoryGroup,
} from './budget.model'

export interface AddEditData {
	id?: string
	mode: 'cost' | 'income' // 👈 talar om om dialogen gäller kostnad/inkomst
	name?: string
	perUser?: Record<string, number>
	category?: Category
	temporary?: boolean
	uidMikael: string
	uidJessica: string
}

@Component({
	selector: 'app-add-edit-cost-dialog',
	standalone: true,
	imports: [
		MatDialogModule,
		FormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatIconModule,
		MatSelectModule,
		MatCheckboxModule,
	],
	template: `
		<h2 mat-dialog-title class="flex items-center gap-2">
			<mat-icon>{{ data.mode === 'income' ? 'savings' : 'payments' }}</mat-icon>
			{{
				data.id
					? data.mode === 'income'
						? 'Redigera inkomst'
						: 'Redigera kostnad'
					: data.mode === 'income'
					? 'Ny inkomst'
					: 'Ny kostnad'
			}}
		</h2>

		<mat-dialog-content class="mat-typography">
			<form (ngSubmit)="save()" class="form-grid">
				<mat-form-field class="full-span">
					<mat-label>Post</mat-label>
					<input matInput [(ngModel)]="form.name" name="name" required cdkFocusInitial />
				</mat-form-field>

				<mat-form-field class="full-span">
					<mat-label>Kategori</mat-label>
					<mat-select [(ngModel)]="form.category" name="category" required>
						@for (g of categoryGroups(); track g.label) {
						<mat-optgroup [label]="g.label">
							@for (c of g.items; track c) {
							<mat-option [value]="c">{{ CATEGORY_LABEL[c] }}</mat-option>
							}
						</mat-optgroup>
						}
					</mat-select>
				</mat-form-field>

				<!-- Dessa hamnar sida vid sida med 12px gap på >=768px -->
				<!-- ... -->
				<!-- De andra fälten oförändrade -->

				<div class="two-inputs">
					<mat-form-field class="flex-1">
						<mat-label>Mikael (kr/mån)</mat-label>
						<input matInput type="number" [(ngModel)]="form.mikael" name="mikael" />
					</mat-form-field>

					<mat-form-field class="flex-1">
						<mat-label>Jessica (kr/mån)</mat-label>
						<input matInput type="number" [(ngModel)]="form.jessica" name="jessica" />
					</mat-form-field>
				</div>

				<div class="full-span checkbox-row">
					<mat-checkbox [(ngModel)]="form.temporary" name="temporary">Tillfällig</mat-checkbox>
				</div>
			</form>
		</mat-dialog-content>

		<mat-dialog-actions align="end">
			@if (data.id) {
			<button mat-button type="button" class="text-red-600" (click)="remove()">Radera</button>
			}
			<button mat-button type="button" (click)="close()">Avbryt</button>
			<button mat-button (click)="save()">Spara</button>
		</mat-dialog-actions>
	`,
	styles: [
		`
			.form-grid {
				display: flex;
				flex-wrap: wrap;
				gap: 16px;
			}
			.full-span {
				width: 100%;
				gap: 8px;
			}

			.two-inputs {
				display: flex;
				width: 100%;
				gap: 16px;
			}

			mat-dialog-content.mat-mdc-dialog-content {
				padding-top: 8px !important;
			}
		`,
	],
})
export class AddEditDialogComponent {
	dialogRef = inject(MatDialogRef<AddEditDialogComponent>)
	data = inject<AddEditData>(MAT_DIALOG_DATA)

	CATEGORY_LABEL = CATEGORY_LABEL
	// Kategorier (svenska labels → engelska värden i modellen)
	// Visa "Inkomst" först när mode === 'income'
	categoryGroups = computed<CategoryGroup[]>(() =>
		this.data.mode === 'income' ? INCOME_CATEGORY_GROUPS : EXPENSE_CATEGORY_GROUPS
	)

	private firstCategory = this.categoryGroups()[0]?.items[0] ?? Category.Other

	form = {
		name: this.data.name ?? '',
		category: this.data.category ?? (this.data.mode === 'income' ? Category.Income : this.firstCategory),
		mikael: (this.data.perUser?.[this.data.uidMikael] ?? 0) / 100,
		jessica: (this.data.perUser?.[this.data.uidJessica] ?? 0) / 100,
		temporary: this.data.temporary ?? false,
	}

	remove() {
		this.dialogRef.close({ delete: true, id: this.data.id })
	}

	save() {
		const payload = {
			id: this.data.id,
			name: this.form.name.trim(),
			category: this.form.category as Category,
			temporary: !!this.form.temporary,
			perUser: {
				[this.data.uidMikael]: Math.round((this.form.mikael || 0) * 100),
				[this.data.uidJessica]: Math.round((this.form.jessica || 0) * 100),
			},
			mode: this.data.mode as 'cost' | 'income',
		}
		this.dialogRef.close(payload)
	}

	close() {
		this.dialogRef.close()
	}
}
