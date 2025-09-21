import { Component, inject, signal } from '@angular/core'
import { MatTableModule } from '@angular/material/table'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { PlantsService } from '../plants.service'
import { PlantSpecies, WATER_LABEL, SUNLIGHT_META, SOIL_META, Grade, MAX_GRADE, GRADE_LABEL } from '../plants.model'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatDialog } from '@angular/material/dialog'
import { ImageViewerDialog } from '../../../components/image-viewer/image-viewer.dialog'

type Col = 'plantType' | 'name' | 'variety' | 'sowWindow'

@Component({
	selector: 'app-list',
	standalone: true,
	imports: [MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule],
	templateUrl: './list.html',
	styleUrl: './list.scss',
})
export class PlantsList {
	private svc = inject(PlantsService)
	public maxGrade = MAX_GRADE

	// 🔹 Data direkt från service (Signal<PlantSpecies[]>)
	public species = this.svc.species

	// 🔹 Kolumner
	public columns = signal<Col[]>(['plantType', 'name', 'variety', 'sowWindow'])

	// 🔹 Expansion
	private expanded = signal<PlantSpecies | null>(null)
	public isExpanded = (row: PlantSpecies) => this.expanded()?.id === row.id
	public toggle(row: PlantSpecies) {
		this.expanded.set(this.isExpanded(row) ? null : row)
	}

	// 🔹 Hjälpare
	private isSunKey = (k: any): k is keyof typeof SUNLIGHT_META => k in SUNLIGHT_META
	private isSoilKey = (k: any): k is keyof typeof SOIL_META => k in SOIL_META
	private sunlightMetaSafe = (k: any) => (this.isSunKey(k) ? SUNLIGHT_META[k] : null)
	private waterLabel = (k: PlantSpecies['water']) => (k !== undefined ? WATER_LABEL[k] : '—')
	private soilMetaSafe = (k: PlantSpecies['soil']) => (this.isSoilKey(k) ? SOIL_META[k] : null)
	public gradeLabel = (v?: number) => (v && GRADE_LABEL[v as 1 | 2 | 3 | 4 | 5]) || '—'
	public gradeIcon = (g?: Grade) => (g ? (`counter_${g}` as const) : 'remove')
	public gradeClass = (g?: Grade) => (g == null ? '' : g >= 4 ? 'grade--high' : g === 3 ? 'grade--mid' : 'grade--low')
	public range = (n: number) => Array.from({ length: n }, (_, i) => i)
	public nameOf = (row: PlantSpecies) => row.name?.trim() || row.variety?.trim() || row.plantType

	// Månad 1-12 → "Jan", osv.
	public monthName = (m?: number) =>
		m && m >= 1 && m <= 12
			? ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'][m - 1]
			: undefined

	// Säkert textuttryck för såfönster
	sowingWindowText = (row: any) => {
		const sw = row?.sowingWindow
		if (sw?.earliest && sw?.latest) {
			const a = this.monthName(sw.earliest) ?? sw.earliest
			const b = this.monthName(sw.latest) ?? sw.latest
			return `${a} - ${b}`
		}
		return '—'
	}

	private spacingText = (s?: { betweenPlantsCm?: number; betweenRowsCm?: number }) => {
		if (!s) return '—'
		const a = s.betweenPlantsCm ? `${s.betweenPlantsCm} cm` : ''
		const b = s.betweenRowsCm ? ` / rad ${s.betweenRowsCm} cm` : ''
		return a || b ? `${a}${b}` : '—'
	}

	// PlantsList.ts
	private heightText(h?: PlantSpecies['growthHeightCm']): string {
		if (h == null) return '—'
		if (typeof h === 'number') return `${h} cm`
		const { min, max, approx, note } = h
		const core =
			min != null && max != null
				? `${min}–${max} cm`
				: min != null
				? `≥ ${min} cm`
				: max != null
				? `≤ ${max} cm`
				: approx != null
				? `ca ${approx} cm`
				: '—'
		return note ? `${core} (${note})` : core
	}

	factRows = (row: PlantSpecies) => {
		const dash = '—'
		const monthWin = (mw?: { earliest?: number; latest?: number }) =>
			mw?.earliest && mw?.latest
				? `${this.monthName(mw.earliest) ?? mw.earliest} - ${this.monthName(mw.latest) ?? mw.latest}`
				: dash

		const facts: { label: string; icon: string; value: string; hint?: string }[] = [
			{
				label: 'Såfönster',
				icon: 'calendar_month',
				value: monthWin(row.sowingWindow),
			},
			{
				label: 'Höjd',
				icon: 'height',
				value: this.heightText(row.growthHeightCm),
			},
			{
				label: 'Skördefönster',
				icon: 'agriculture',
				value: monthWin(row.harvestWindow),
			},
			{
				label: 'Sådjup',
				icon: 'vertical_align_bottom',
				value: row.sowingDepthMm ? `${row.sowingDepthMm} mm` : dash,
			},
			{
				label: 'Avstånd',
				icon: 'straighten',
				value: this.spacingText(row.spacing),
			},
			{
				label: 'Jord',
				icon: 'landslide',
				value: this.soilMetaSafe(row.soil)?.label ?? dash,
				hint: this.soilMetaSafe(row.soil)?.tooltip || undefined,
			},
			{
				label: 'Ljusbehov',
				icon: this.sunlightMetaSafe(row.sunlight)?.icon || 'sunny',
				value: this.sunlightMetaSafe(row.sunlight)?.label || dash,
			},
			{
				label: 'Vattning',
				icon: 'opacity',
				value: this.waterLabel(row.water),
			},
		].filter(f => f.value !== dash)

		return facts.filter(f => f.value !== dash)
	}

	private dialog = inject(MatDialog)

	openImage(src: string, alt?: string) {
		this.dialog.open(ImageViewerDialog, {
			data: { src, alt },
			width: '100vw',
			maxWidth: '100vw',
			panelClass: 'image-dialog',
			backdropClass: 'image-backdrop',
		})
	}
}
