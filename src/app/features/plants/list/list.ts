import { Component, inject, signal, effect, computed } from '@angular/core'
import { MatTableModule } from '@angular/material/table'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { PlantsService } from '../plants.service'
import {
	PlantSpecies,
	WATER_LABEL,
	SUNLIGHT_META,
	SOIL_META,
	MAX_GRADE,
	SOWING_META,
	monthLabel,
	deepDiffClean,
	formatSpacing, // ✅ från @plants/model
} from '@plants/model'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatDialog } from '@angular/material/dialog'
import { ImageViewerDialog } from '../../../components/image-viewer/image-viewer.dialog'
import { AddEditPlantDialogComponent } from '../add-plant/add-edit-plant-dialog.component'
import { firstValueFrom } from 'rxjs'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

type Col = 'plantType' | 'name' | 'sowWindow'

@Component({
	selector: 'app-list',
	standalone: true,
	imports: [
		MatTableModule,
		MatButtonModule,
		MatIconModule,
		MatTooltipModule,
		MatPaginatorModule,
		MatFormFieldModule,
		MatInputModule,
	],
	templateUrl: './list.html',
	styleUrl: './list.scss',
})
export class PlantsList {
	private svc = inject(PlantsService)
	private dialog = inject(MatDialog)

	maxGrade = MAX_GRADE
	species = this.svc.species

	// Kolumner
	columns = signal<Col[]>(['plantType', 'name', 'sowWindow'])

	// Expansion
	private expanded = signal<PlantSpecies | null>(null)
	isExpanded = (row: PlantSpecies) => this.expanded()?.id === row.id
	toggle(row: PlantSpecies) {
		this.expanded.set(this.isExpanded(row) ? null : row)
	}

	// Filter
	filterText = signal('')

	private rowSearchText = (r: PlantSpecies) =>
		[
			r.plantType,
			r.variety,
			r.name,
			r.description,
			r.water ? WATER_LABEL[r.water] : '',
			r.sunlight ? SUNLIGHT_META[r.sunlight]?.label : '',
			r.soil ? SOIL_META[r.soil]?.label : '',
			r.sowingMethod ? SOWING_META[r.sowingMethod]?.label : '',
			r.isEdible ? 'ätbar edible' : 'nej inte ätbar',
		]
			.filter(Boolean)
			.join(' ')
			.toLowerCase()

	// Filtrerad lista
	filtered = computed(() => {
		const all = this.species() ?? []
		const q = this.filterText().trim().toLowerCase()
		if (!q) return all
		return all.filter(r => this.rowSearchText(r).includes(q))
	})

	// Pagination
	pageIndex = signal(0)
	pageSize = signal(10)
	pageSizeOptions = [5, 10, 25] as const
	length = signal(0)
	rows = signal<PlantSpecies[]>([])

	private _sync = effect(() => {
		const base = this.filtered()
		const size = this.pageSize()
		const maxPage = Math.max(0, Math.ceil((base.length || 1) / size) - 1)
		if (this.pageIndex() > maxPage) this.pageIndex.set(maxPage)

		const start = this.pageIndex() * size
		const end = start + size
		this.length.set(base.length)
		this.rows.set(base.slice(start, end))
		this.expanded.set(null)
	})

	onPage(e: { pageIndex: number; pageSize: number }) {
		this.pageIndex.set(e.pageIndex)
		this.pageSize.set(e.pageSize)
	}

	onFilterInput(value: string) {
		this.filterText.set(value ?? '')
		this.pageIndex.set(0)
	}

	// UI helpers
	nameOf = (row: PlantSpecies) => row.name?.trim() || row.variety?.trim() || row.plantType

	private formatSpacing = formatSpacing

	private heightText(h?: PlantSpecies['growthHeightCm']): string {
		if (h == null) return '—'
		if (typeof h === 'number') return `${h} cm`
		const { min, max, approx, note } = h
		const core =
			min != null && max != null
				? `${min}-${max} cm`
				: min != null
				? `≥ ${min} cm`
				: max != null
				? `≤ ${max} cm`
				: approx != null
				? `ca ${approx} cm`
				: '—'
		return note ? `${core} (${note})` : core
	}

	private monthLabelShort = (m?: number) => (m ? monthLabel(m, { short: true }) : undefined)

	sowingWindowText = (row: PlantSpecies) => {
		const sw = row.sowingWindow
		if (sw?.earliest && sw?.latest) {
			const a = this.monthLabelShort(sw.earliest) ?? String(sw.earliest)
			const b = this.monthLabelShort(sw.latest) ?? String(sw.latest)
			return `${a} - ${b}`
		}
		return '—'
	}

	factRows = (row: PlantSpecies) => {
		const dash = '—'
		const monthWin = (mw?: { earliest?: number; latest?: number }) =>
			mw?.earliest && mw?.latest
				? `${this.monthLabelShort(mw.earliest) ?? mw.earliest} - ${
						this.monthLabelShort(mw.latest) ?? mw.latest
				  }`
				: dash

		return [
			{ label: 'Såfönster', icon: 'calendar_month', value: monthWin(row.sowingWindow) },
			{ label: 'Höjd', icon: 'height', value: this.heightText(row.growthHeightCm) },
			{ label: 'Skördefönster', icon: 'agriculture', value: monthWin(row.harvestWindow) },
			{
				label: 'Sådjup',
				icon: 'vertical_align_bottom',
				value: row.sowingDepthMm ? `${row.sowingDepthMm} mm` : dash,
			},
			{ label: 'Avstånd', icon: 'fit_page', value: this.formatSpacing(row.spacing) },
			{
				label: 'Såmetod',
				icon: SOWING_META[row.sowingMethod!]?.icon ?? 'eco',
				value: row.sowingMethod ? SOWING_META[row.sowingMethod]?.label ?? dash : dash,
			},
			{
				label: 'Ljusbehov',
				icon: SUNLIGHT_META[row.sunlight!]?.icon ?? 'sunny',
				value: row.sunlight ? SUNLIGHT_META[row.sunlight]?.label ?? dash : dash,
			},
			{
				label: 'Jord',
				icon: 'landslide',
				value: row.soil ? SOIL_META[row.soil]?.label ?? dash : dash,
				hint: row.soil ? SOIL_META[row.soil]?.tooltip : undefined,
			},
			{ label: 'Vattning', icon: 'opacity', value: row.water ? WATER_LABEL[row.water] ?? dash : dash },
			{ label: 'Ätbart', icon: row.isEdible ? 'restaurant' : 'no_meals', value: row.isEdible ? 'Ja' : 'Nej' },
		].filter(f => f.value !== dash)
	}

	openImage(src: string, alt?: string) {
		this.dialog.open(ImageViewerDialog, {
			data: { src, alt },
			width: '100vw',
			maxWidth: '100vw',
			panelClass: 'image-dialog',
			backdropClass: 'image-backdrop',
		})
	}

	async edit(row: PlantSpecies, ev?: Event) {
		ev?.stopPropagation()
		const ref = this.dialog.open(AddEditPlantDialogComponent, {
			width: '720px',
			maxWidth: '95vw',
			maxHeight: '95vh',
			// autoFocus: 'first-tabbable',
			autoFocus: 'false',
			data: { mode: 'edit', id: row.id, value: row } as const,
		})

		const res = await firstValueFrom(ref.afterClosed())
		if (res?.ok && res.mode === 'edit') {
			const patch = deepDiffClean(row as any, res.value as any) // ✅ nu från util
			if (Object.keys(patch).length) {
				await this.svc.updateSpecies(res.id, patch as any)
				console.log('Växt uppdaterad:', res.id)
			} else {
				console.log('Inga ändringar - skip update')
			}
		}
	}
}
