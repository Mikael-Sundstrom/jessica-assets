// features/plants/add-edit-plant-dialog.component.ts
import { Component, inject, signal, computed, effect } from '@angular/core'
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatIconModule } from '@angular/material/icon'
import { PlantsService } from '../plants.service'
import {
	SUNLIGHT,
	WATER_NEED,
	SOIL,
	WATER_LABEL,
	SOIL_LABEL,
	SUNLIGHT_META,
	type PlantSpecies,
	type Grade,
	Spacing,
	SOWING,
	SOWING_META,
	type SowingMethod,
} from '../plants.model'

export const MONTHS = [
	{ value: 1, label: 'Januari' },
	{ value: 2, label: 'Februari' },
	{ value: 3, label: 'Mars' },
	{ value: 4, label: 'April' },
	{ value: 5, label: 'Maj' },
	{ value: 6, label: 'Juni' },
	{ value: 7, label: 'Juli' },
	{ value: 8, label: 'Augusti' },
	{ value: 9, label: 'September' },
	{ value: 10, label: 'Oktober' },
	{ value: 11, label: 'November' },
	{ value: 12, label: 'December' },
] as const
type Option<T extends string | number> = { value: T; label: string; icon?: string }

// Vad dialogen kan få in:
export type AddEditPlantData = { mode: 'add' } | { mode: 'edit'; id: string; value: PlantSpecies }

@Component({
	selector: 'app-add-edit-plant-dialog',
	standalone: true,
	imports: [
		ReactiveFormsModule,
		MatDialogModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatCheckboxModule,
		MatButtonModule,
		MatIconModule,
		MatButtonToggleModule,
	],
	styles: [
		`
			.row {
				display: grid;
				gap: 1rem;
				grid-template-columns: 1fr 1fr;
			}
			.row .checkboxe-edible {
				align-items: center;
				display: flex;
			}
			.full {
				grid-column: 1 / -1;
			}
			.full.grade-picker {
				display: flex;
				justify-content: center;
				gap: 0.5rem;
				align-items: center;
			}
			.full.grade-picker mat-icon {
				height: 26px;
				width: 26px;
			}
			mat-dialog-content.mat-mdc-dialog-content {
				padding-top: 0.5rem !important;
			}
		`,
	],
	template: `
		<h2 mat-dialog-title>@if (isEdit()) { Redigera växt } @else { Ny växt }</h2>

		<mat-dialog-content class="mat-typography">
			<form class="mat-dialog-content" [formGroup]="form" (ngSubmit)="submit()">
				<div class="row">
					<mat-form-field>
						<mat-label>Växttyp</mat-label>
						<input matInput formControlName="plantType" placeholder="t.ex. Tomat" />
					</mat-form-field>

					<mat-form-field>
						<mat-label>Odlingsvariant</mat-label>
						<input matInput formControlName="variety" placeholder="t.ex. 'Växthus'" />
					</mat-form-field>

					<mat-form-field class="full">
						<mat-label>Namn (visningsnamn)</mat-label>
						<input matInput formControlName="name" placeholder="t.ex. 'Black cherry'" />
					</mat-form-field>

					<mat-form-field class="full">
						<mat-label>Beskrivning</mat-label>
						<textarea matInput formControlName="description" rows="4"></textarea>
					</mat-form-field>

					<mat-form-field class="full">
						<mat-label>Bild-URL</mat-label>
						<input matInput formControlName="imageUrl" placeholder="https://..." />
					</mat-form-field>

					<!-- Badges -->
					<mat-form-field>
						<mat-label>Ljus</mat-label>
						<mat-select formControlName="sunlight">
							@for (s of sunlightOptions; track s.value) {
							<mat-option [value]="s.value">
								<mat-icon style="margin-right:.75rem;">{{ s.icon }}</mat-icon>
								{{ s.label }}
							</mat-option>
							}
						</mat-select>
					</mat-form-field>

					<mat-form-field>
						<mat-label>Vatten</mat-label>
						<mat-select formControlName="water">
							@for (w of waterOptions; track w.value) {
							<mat-option [value]="w.value">{{ w.label }}</mat-option>
							}
						</mat-select>
					</mat-form-field>

					<!-- Såmetod -->
					<mat-form-field>
						<mat-label>Såmetod</mat-label>
						<mat-select formControlName="sowingMethod">
							@for (o of sowingOptions; track o.value) {
							<mat-option [value]="o.value">
								<mat-icon style="margin-right:.75rem;">{{ o.icon }}</mat-icon>
								{{ o.label }}
							</mat-option>
							}
						</mat-select>
					</mat-form-field>

					<!-- Sådjup -->
					<mat-form-field>
						<mat-label>Sådjup (mm)</mat-label>
						<input matInput type="number" formControlName="sowingDepthMm" />
					</mat-form-field>

					<!-- Såfönster -->
					<mat-form-field>
						<mat-label>Sådd från</mat-label>
						<mat-select formControlName="sowFrom">
							@for (m of months; track m.value) {
							<mat-option [value]="m.value">{{ m.label }}</mat-option>
							}
						</mat-select>
					</mat-form-field>

					<mat-form-field>
						<mat-label>Sådd till</mat-label>
						<mat-select formControlName="sowTo">
							@for (m of months; track m.value) {
							<mat-option [value]="m.value">{{ m.label }}</mat-option>
							}
						</mat-select>
					</mat-form-field>

					<!-- Skördefönster -->
					<mat-form-field>
						<mat-label>Skörd från</mat-label>
						<mat-select formControlName="harvestFrom">
							@for (m of months; track m.value) {
							<mat-option [value]="m.value">{{ m.label }}</mat-option>
							}
						</mat-select>
					</mat-form-field>

					<mat-form-field>
						<mat-label>Skörd till</mat-label>
						<mat-select formControlName="harvestTo">
							@for (m of months; track m.value) {
							<mat-option [value]="m.value">{{ m.label }}</mat-option>
							}
						</mat-select>
					</mat-form-field>

					<!-- Avstånd -->
					<mat-form-field>
						<mat-label>Plantavstånd (cm)</mat-label>
						<input matInput type="number" formControlName="betweenPlantsCm" />
					</mat-form-field>

					<mat-form-field>
						<mat-label>Radavstånd (cm)</mat-label>
						<input matInput type="number" formControlName="betweenRowsCm" />
					</mat-form-field>

					<!-- Höjd -->
					<mat-form-field>
						<mat-label>Höjd min (cm)</mat-label>
						<input matInput type="number" formControlName="heightMin" />
					</mat-form-field>

					<mat-form-field>
						<mat-label>Höjd max (cm)</mat-label>
						<input matInput type="number" formControlName="heightMax" />
					</mat-form-field>

					<mat-form-field>
						<mat-label>Jord</mat-label>
						<mat-select formControlName="soil">
							@for (j of soilOptions; track j.value) {
							<mat-option [value]="j.value">{{ j.label }}</mat-option>
							}
						</mat-select>
					</mat-form-field>

					<span class="checkboxe-edible">
						<mat-checkbox class="full" formControlName="isEdible">Ätbar</mat-checkbox>
					</span>

					<!-- Betyg 1–5 -->
					<div class="full grade-picker" aria-label="Betyg">
						<mat-button-toggle-group
							formControlName="grade"
							[multiple]="false"
							name="grade"
							aria-label="Välj betyg"
						>
							@for (g of gradeScale(); track g) {
							<mat-button-toggle [value]="g" aria-label="Betyg {{ g }}">
								<mat-icon>{{ counterIcon(g) }}</mat-icon>
							</mat-button-toggle>
							}
						</mat-button-toggle-group>
					</div>
				</div>
			</form>
		</mat-dialog-content>

		<mat-dialog-actions align="end">
			<button mat-button type="button" (click)="close()">Avbryt</button>
			<button
				mat-flat-button
				color="primary"
				type="button"
				(click)="submit()"
				[disabled]="form.invalid || busy()"
			>
				@if (isEdit()) { Uppdatera } @else { Spara }
			</button>
		</mat-dialog-actions>
	`,
})
export class AddEditPlantDialogComponent {
	private fb = inject(FormBuilder)
	private ref = inject(MatDialogRef<AddEditPlantDialogComponent>)
	private svc = inject(PlantsService)
	private data = inject<AddEditPlantData>(MAT_DIALOG_DATA)

	// state
	busy = signal(false)
	isEdit = signal(this.data?.mode === 'edit')
	gradeScale = signal<Grade[]>([1, 2, 3, 4, 5])

	// options
	sunlightOptions: ReadonlyArray<Option<(typeof SUNLIGHT)[number]>> = SUNLIGHT.map(v => ({
		value: v,
		label: SUNLIGHT_META[v].label,
		icon: SUNLIGHT_META[v].icon,
	}))
	waterOptions: ReadonlyArray<Option<(typeof WATER_NEED)[number]>> = WATER_NEED.map(v => ({
		value: v,
		label: WATER_LABEL[v],
	}))
	soilOptions: ReadonlyArray<Option<(typeof SOIL)[number]>> = SOIL.map(v => ({ value: v, label: SOIL_LABEL[v] }))

	sowingOptions: ReadonlyArray<Option<SowingMethod>> = SOWING.map(v => ({
		value: v,
		label: SOWING_META[v].label,
		icon: SOWING_META[v].icon,
	}))

	months = MONTHS

	form = this.fb.nonNullable.group({
		plantType: ['', Validators.required],
		variety: ['', Validators.required],
		name: ['', Validators.required],
		description: [''],
		imageUrl: [''],

		sunlight: ['' as '' | (typeof SUNLIGHT)[number]],
		water: ['' as '' | (typeof WATER_NEED)[number]],
		soil: ['' as '' | (typeof SOIL)[number]],
		isEdible: [false],
		grade: this.fb.control<Grade | undefined>(undefined),

		sowingMethod: ['' as '' | SowingMethod],
		sowingDepthMm: [undefined as number | undefined],
		sowFrom: [undefined as number | undefined],
		sowTo: [undefined as number | undefined],

		betweenPlantsCm: [undefined as number | undefined],
		betweenRowsCm: [undefined as number | undefined],

		heightMin: [undefined as number | undefined],
		heightMax: [undefined as number | undefined],

		harvestFrom: [undefined as number | undefined],
		harvestTo: [undefined as number | undefined],
	})

	constructor() {
		// Förifyll när mode = edit
		if (this.isEdit()) {
			const v = (this.data as Extract<AddEditPlantData, { mode: 'edit' }>).value
			this.patchFromSpecies(v)
		}
	}

	private patchFromSpecies(row: PlantSpecies) {
		// growthHeightCm: number | {min?:number,max?:number}
		let heightMin: number | undefined
		let heightMax: number | undefined
		if (typeof row.growthHeightCm === 'number') {
			heightMin = row.growthHeightCm
			heightMax = row.growthHeightCm
		} else if (row.growthHeightCm) {
			heightMin = row.growthHeightCm.min
			heightMax = row.growthHeightCm.max
		}

		this.form.patchValue({
			plantType: row.plantType ?? '',
			variety: row.variety ?? '',
			name: row.name ?? '',
			description: row.description ?? '',
			imageUrl: row.imageUrl ?? '',
			sunlight: (row.sunlight as any) ?? '',
			water: (row.water as any) ?? '',
			soil: (row.soil as any) ?? '',
			isEdible: !!row.isEdible,
			grade: row.grade as Grade | undefined,
			sowingMethod: (row.sowingMethod as any) ?? '',
			sowingDepthMm: row.sowingDepthMm,
			sowFrom: row.sowingWindow?.earliest,
			sowTo: row.sowingWindow?.latest,
			betweenPlantsCm: row.spacing?.betweenPlantsCm,
			betweenRowsCm: row.spacing?.betweenRowsCm,
			heightMin,
			heightMax,
			harvestFrom: row.harvestWindow?.earliest,
			harvestTo: row.harvestWindow?.latest,
		})
	}

	setGrade(g: Grade) {
		this.form.patchValue({ grade: g })
	}
	counterIcon(g: number) {
		return `counter_${g}`
	}
	close() {
		this.ref.close()
	}

	private buildHeight(): PlantSpecies['growthHeightCm'] | undefined {
		const { heightMin, heightMax } = this.form.getRawValue()
		if (typeof heightMin === 'number' && typeof heightMax === 'number') {
			return heightMin === heightMax ? heightMin : { min: heightMin, max: heightMax }
		}
		if (typeof heightMin === 'number' || typeof heightMax === 'number') {
			return {
				...(heightMin != null ? { min: heightMin } : {}),
				...(heightMax != null ? { max: heightMax } : {}),
			}
		}
		return undefined
	}

	private buildSpacing(): Spacing | undefined {
		const { betweenPlantsCm, betweenRowsCm } = this.form.getRawValue()
		const s: any = {}
		if (betweenPlantsCm != null) s.betweenPlantsCm = betweenPlantsCm
		if (betweenRowsCm != null) s.betweenRowsCm = betweenRowsCm
		return Object.keys(s).length ? s : undefined
	}

	async submit() {
		if (this.form.invalid || this.busy()) return
		this.busy.set(true)
		try {
			const v = this.form.getRawValue()
			const value = this.mapFormToDto(v) // se helper nedan
			if (this.isEdit()) {
				const { id } = this.data as Extract<AddEditPlantData, { mode: 'edit' }>
				this.ref.close({ ok: true, mode: 'edit', id, value })
			} else {
				this.ref.close({ ok: true, mode: 'add', value })
			}
		} finally {
			this.busy.set(false)
		}
	}
	private mapFormToDto(v: any): Omit<PlantSpecies, 'id'> {
		const spacing = this.buildSpacing()
		const height = this.buildHeight()

		const dto: any = {
			plantType: v.plantType?.trim() || '',
			variety: v.variety?.trim() || '',
			name: v.name?.trim() || '',
			description: v.description?.trim() || '',
			imageUrl: v.imageUrl?.trim() || '',
			isEdible: !!v.isEdible,
		}

		// Lägg endast till om valt – annars lämna helt bort (inte undefined!)
		if (v.sunlight) dto.sunlight = v.sunlight
		if (v.water) dto.water = v.water
		if (v.soil) dto.soil = v.soil
		if (v.grade != null) dto.grade = v.grade
		if (v.sowFrom || v.sowTo) dto.sowingWindow = { earliest: v.sowFrom ?? v.sowTo, latest: v.sowTo ?? v.sowFrom }
		if (v.sowingDepthMm != null) dto.sowingDepthMm = v.sowingDepthMm
		if (v.sowingMethod) dto.sowingMethod = v.sowingMethod
		if (spacing) dto.spacing = spacing
		if (height != null) dto.growthHeightCm = height
		if (v.harvestFrom || v.harvestTo) {
			dto.harvestWindow = { earliest: v.harvestFrom ?? v.harvestTo, latest: v.harvestTo ?? v.harvestFrom }
		}

		// Ta bort null/empty-fields om du vill:
		return pruneUndefined(dto) as Omit<PlantSpecies, 'id'>
	}
}

// === liten hjälpare: ta bort undefined (och valfritt tomma strängar) ===
function pruneUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
	const out: any = {}
	for (const k of Object.keys(obj)) {
		const v = obj[k]
		if (v === undefined) continue // aldrig skicka undefined till Firestore
		// vill du även droppa tomma strängar/objekt:
		if (typeof v === 'string' && v.trim() === '') continue
		if (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) continue
		out[k] = v
	}
	return out
}
