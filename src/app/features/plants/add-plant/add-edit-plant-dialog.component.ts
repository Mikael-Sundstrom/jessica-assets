// add-edit-plant-dialog.component.ts
import { AsyncPipe } from '@angular/common'
import { Component, computed, inject, signal } from '@angular/core'
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatIconModule } from '@angular/material/icon'
import { MatSliderModule } from '@angular/material/slider'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import type { Sunlight, WaterNeed, Soil, PlantSpecies, Grade, SowingMethod, Cultivation } from '@plants/model'
import {
	makeSoilOptions,
	makeSowingOptions,
	normalizeWindow,
	normalizeHeight,
	heightMinMax,
	spacingFrom,
	displayWithMonth,
	GRADE_VALUES,
	formatCm,
	formatMm,
	sunIconByScale,
	waterIconByScale,
	makeCultivationOptions,
	makePlantTypeOptions,
} from '@plants/model'
import { map, shareReplay, startWith } from 'rxjs/operators'

export type AddEditPlantData = { mode: 'add' } | { mode: 'edit'; id: string; value: PlantSpecies }

@Component({
	selector: 'app-add-edit-plant-dialog',
	standalone: true,
	imports: [
		AsyncPipe,
		ReactiveFormsModule,
		MatDialogModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatCheckboxModule,
		MatButtonModule,
		MatIconModule,
		MatButtonToggleModule,
		MatSliderModule,
		MatAutocompleteModule,
	],
	styleUrls: ['./add-edit-plant-dialog.component.scss'],
	templateUrl: './add-edit-plant-dialog.component.html',
})
export class AddEditPlantDialogComponent {
	private fb = inject(FormBuilder)
	private ref = inject(MatDialogRef<AddEditPlantDialogComponent>)
	private data = inject<AddEditPlantData>(MAT_DIALOG_DATA)

	// state
	busy = signal(false)
	isEdit = signal(this.data?.mode === 'edit')
	gradeScale = signal<Grade[]>([...GRADE_VALUES])

	// options
	soilOptions = makeSoilOptions()
	sowingOptions = makeSowingOptions()
	cultivationOptions = makeCultivationOptions()
	plantTypeOptions = makePlantTypeOptions()

	// displayWith
	sunDisplay = (v: number | null) => sunIconByScale(v)
	waterDisplay = (v: number | null) => waterIconByScale(v)
	edibleDisplay = (v: number | null) => (v ? 'Ja' : 'Nej')

	// hjälpare
	formatCm = formatCm
	formatMm = formatMm
	formatLabel = displayWithMonth

	get cultivationDisplay(): string {
		const v = this.form.value?.cultivation ?? []
		const map = new Map(this.cultivationOptions.map(o => [o.value, o.label]))
		return v.length ? v.map(c => map.get(c)).join(' · ') : '—'
	}

	constructor() {
		if (this.isEdit()) {
			const v = (this.data as Extract<AddEditPlantData, { mode: 'edit' }>).value
			this.patchFromSpecies(v)
		}
	}

	// form
	form = this.fb.group({
		// obligatoriska fält kan fortfarande vara nonNullable via control-konfiguration
		plantType: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
		cultivation: this.fb.control<Cultivation[]>([], { nonNullable: true }),
		name: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
		description: this.fb.control(''),
		imageUrl: this.fb.control(''),

		sunlight: this.fb.control<Sunlight | undefined>(undefined),
		water: this.fb.control<WaterNeed | undefined>(undefined),
		soil: this.fb.control<Soil | undefined>(undefined),
		isEdible: this.fb.control(0, { nonNullable: true }),
		grade: this.fb.control<Grade | undefined>(undefined),

		sowingMethod: this.fb.control<SowingMethod | undefined>(undefined),
		sowingDepthMm: this.fb.control<number | undefined>(undefined),
		sowFrom: this.fb.control<number | undefined>(undefined),
		sowTo: this.fb.control<number | undefined>(undefined),

		betweenPlantsCm: this.fb.control<number | undefined>(undefined),
		betweenRowsCm: this.fb.control<number | undefined>(undefined),

		heightMin: this.fb.control<number | undefined>(undefined),
		heightMax: this.fb.control<number | undefined>(undefined),

		harvestFrom: this.fb.control<number | undefined>(undefined),
		harvestTo: this.fb.control<number | undefined>(undefined),
	})

	private patchFromSpecies(row: PlantSpecies) {
		const { min: heightMin, max: heightMax } = heightMinMax(row.growthHeightCm)

		this.form.patchValue({
			plantType: row.plantType ?? '',
			cultivation: row.cultivation ?? [],
			name: row.name ?? '',
			description: row.description ?? '',
			imageUrl: row.imageUrl ?? '',
			sunlight: row.sunlight,
			water: row.water,
			soil: row.soil,
			isEdible: row.isEdible ? 1 : 0,
			grade: row.grade,
			sowingMethod: row.sowingMethod,
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

	filteredPlantTypes$ = this.form.controls.plantType.valueChanges.pipe(
		startWith(this.form.controls.plantType.value ?? ''),
		map(v => (v ?? '').toString().toLowerCase().trim()),
		map(q => (q ? this.plantTypeOptions.filter(o => o.label.toLowerCase().includes(q)) : this.plantTypeOptions)),
		shareReplay({ bufferSize: 1, refCount: true })
	)

	setGrade(g: Grade) {
		this.form.patchValue({ grade: g })
	}
	counterIcon(g: number) {
		return `counter_${g}`
	}

	close() {
		this.ref.close()
	}

	async submit() {
		if (this.form.invalid || this.busy()) return
		this.busy.set(true)
		try {
			const v = this.form.getRawValue()
			const value = this.mapFormToDto(this.form.getRawValue()) // se helper nedan
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
	private mapFormToDto(v: ReturnType<typeof this.form.getRawValue>): Omit<PlantSpecies, 'id'> {
		const dto: any = {
			plantType: v.plantType?.trim() || '',
			cultivation: v.cultivation || [],
			name: v.name?.trim() || '',
			description: v.description?.trim() || '',
			imageUrl: v.imageUrl?.trim() || '',
			isEdible: !!v.isEdible,
		}

		if (v.sunlight) dto.sunlight = v.sunlight
		if (v.water) dto.water = v.water
		if (v.soil) dto.soil = v.soil
		if (v.grade != null) dto.grade = v.grade

		const sowWin = normalizeWindow(v.sowFrom, v.sowTo)
		if (sowWin) dto.sowingWindow = sowWin

		if (v.sowingDepthMm != null) dto.sowingDepthMm = v.sowingDepthMm
		if (v.sowingMethod) dto.sowingMethod = v.sowingMethod

		const spacing = spacingFrom(v.betweenPlantsCm, v.betweenRowsCm)
		if (spacing) dto.spacing = spacing

		const height = normalizeHeight(v.heightMin, v.heightMax)
		if (height != null) dto.growthHeightCm = height

		const harvestWin = normalizeWindow(v.harvestFrom, v.harvestTo)
		if (harvestWin) dto.harvestWindow = harvestWin

		return dto
	}
}
