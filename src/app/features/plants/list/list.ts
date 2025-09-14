import { Component, computed, inject, signal } from '@angular/core'
import { MatTableModule } from '@angular/material/table'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { PlantsService } from '../plants.service'
import { PlantSpecies, SUNLIGHT_LABEL, WATER_LABEL, FERTILIZER_LABEL } from '../plants.models'

type Col = 'plantType' | 'variety' | 'growthHeightCm' | 'spacing' | 'sunlight'

@Component({
	selector: 'app-list',
	standalone: true,
	imports: [MatTableModule, MatButtonModule, MatIconModule],
	templateUrl: './list.html',
	styleUrl: './list.scss',
})
export class PlantsList {
	private svc = inject(PlantsService)

	// 🔹 Data direkt från service (Signal<PlantSpecies[]>)
	species = this.svc.species

	// 🔹 Kolumner
	columns = signal<Col[]>(['plantType', 'variety', 'growthHeightCm', 'spacing', 'sunlight'])
	// columns = signal<Exclude<Col, 'expand'>[]>(['plantType', 'variety', 'growthHeightCm', 'spacing', 'sunlight'])
	// columnsWithExpand = computed<Col[]>(() => [...this.columns(), 'expand'])

	// 🔹 Expansion
	expanded = signal<PlantSpecies | null>(null)
	isExpanded = (row: PlantSpecies) => this.expanded() === row
	toggle(row: PlantSpecies) {
		this.expanded.set(this.isExpanded(row) ? null : row)
	}

	// 🔹 Hjälpare
	trackById = (_: number, x: PlantSpecies) => x.id
	sunlightLabel = (k: PlantSpecies['sunlight']) => SUNLIGHT_LABEL[k]
	waterLabel = (k: PlantSpecies['water']) => WATER_LABEL[k]
	fertLabel = (k: PlantSpecies['fertilizer']) => FERTILIZER_LABEL[k]

	// Månad 1–12 → "Jan", osv.
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
			return `${a} – ${b}`
		}
		// Legacy: earliestSowing/latestSowing som strängar
		if (row?.earliestSowing || row?.latestSowing) {
			return `${row.earliestSowing ?? '—'} – ${row.latestSowing ?? '—'}`
		}
		return '—'
	}

	germinationDaysText = (row: any) =>
		row?.germinationDays?.min ? `${row.germinationDays.min}–${row.germinationDays.max} dagar` : '—'

	germinationTempText = (row: any) =>
		row?.germinationTemp?.min ? `${row.germinationTemp.min}–${row.germinationTemp.max} °C` : '—'

	spacingText = (s?: { betweenPlantsCm?: number; betweenRowsCm?: number }) => {
		if (!s) return '—'
		const a = s.betweenPlantsCm ? `${s.betweenPlantsCm} cm` : ''
		const b = s.betweenRowsCm ? ` / rad ${s.betweenRowsCm} cm` : ''
		return a || b ? `${a}${b}` : '—'
	}

	heightText = (h?: number) => (h ? `${h} cm` : '—')
}
