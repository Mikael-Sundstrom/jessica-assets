import { Component, computed, inject, signal } from '@angular/core'
import { MatTableModule } from '@angular/material/table'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { PlantsService } from '../plants.service'
import { PlantSpecies, WATER_LABEL, FERTILIZER_LABEL, SUNLIGHT_META, CARE_EASE_LABEL } from '../plants.models'

import { MatTooltipModule } from '@angular/material/tooltip'
// type Col = 'plantType' | 'variety' | 'growthHeightCm' | 'spacing' | 'sunlight'
type Col = 'plantType' | 'variety' | 'sowWindow' | 'careEase'

@Component({
	selector: 'app-list',
	standalone: true,
	imports: [MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule],
	templateUrl: './list.html',
	styleUrl: './list.scss',
})
export class PlantsList {
	private svc = inject(PlantsService)

	// 🔹 Data direkt från service (Signal<PlantSpecies[]>)
	species = this.svc.species

	// 🔹 Kolumner
	columns = signal<Col[]>(['plantType', 'variety', 'sowWindow', 'careEase'])

	// 🔹 Expansion
	expanded = signal<PlantSpecies | null>(null)
	isExpanded = (row: PlantSpecies) => this.expanded() === row
	toggle(row: PlantSpecies) {
		this.expanded.set(this.isExpanded(row) ? null : row)
	}

	private isSunKey = (k: any): k is keyof typeof SUNLIGHT_META => k in SUNLIGHT_META

	// 🔹 Hjälpare
	careLabel = (v?: number) => (v && CARE_EASE_LABEL[v as 1 | 2 | 3]) || '—'
	range = (n: number) => Array.from({ length: n }, (_, i) => i)
	maxCare = 3

	trackById = (_: number, x: PlantSpecies) => x.id
	sunlightMetaSafe = (k: any) => (this.isSunKey(k) ? SUNLIGHT_META[k] : null)
	waterLabel = (k: PlantSpecies['water']) => WATER_LABEL[k]
	fertLabel = (k: PlantSpecies['fertilizer']) => FERTILIZER_LABEL[k]

	// Månad 1-12 → "Jan", osv.
	public monthName = (m?: number) =>
		m && m >= 1 && m <= 12
			? ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'][m - 1]
			: undefined

	// Säkert textuttryck för såfönster, stödjer både ny och legacy-modell
	sowingWindowText = (row: any) => {
		// Ny modell: { earliest: number; latest: number }
		const sw = row?.sowingWindow
		if (sw?.earliest && sw?.latest) {
			const a = this.monthName(sw.earliest) ?? sw.earliest
			const b = this.monthName(sw.latest) ?? sw.latest
			return `${a} - ${b}`
		}
		// Legacy: earliestSowing/latestSowing som strängar
		if (row?.earliestSowing || row?.latestSowing) {
			return `${row.earliestSowing ?? '—'} - ${row.latestSowing ?? '—'}`
		}
		return '—'
	}

	germinationDaysText = (row: any) =>
		row?.germinationDays?.min ? `${row.germinationDays.min}-${row.germinationDays.max} dagar` : '—'

	germinationTempText = (row: any) =>
		row?.germinationTemp?.min ? `${row.germinationTemp.min}-${row.germinationTemp.max} °C` : '—'

	spacingText = (s?: { betweenPlantsCm?: number; betweenRowsCm?: number }) => {
		if (!s) return '—'
		const a = s.betweenPlantsCm ? `${s.betweenPlantsCm} cm` : ''
		const b = s.betweenRowsCm ? ` / rad ${s.betweenRowsCm} cm` : ''
		return a || b ? `${a}${b}` : '—'
	}

	heightText = (h?: number) => (h ? `${h} cm` : '—')
}
