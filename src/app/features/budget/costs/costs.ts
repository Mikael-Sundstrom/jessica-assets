import { Component, computed, inject } from '@angular/core'
import { BudgetService } from '../budget.service'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { firstValueFrom } from 'rxjs'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatTableModule } from '@angular/material/table'
import { MatTooltipModule } from '@angular/material/tooltip'
import { AddEditDialogComponent } from '../add-edit-dialog.component'
import { CostRow, DialogClosed, DialogResult } from '../budget.model'
import { Category } from '../budget.model'

type GroupHeader = { __kind: 'group'; label: string; icon: string }

@Component({
	selector: 'app-costs',
	standalone: true,
	imports: [MatTableModule, MatIconModule, MatDialogModule, MatButtonModule, MatTooltipModule],
	templateUrl: './costs.html',
	styleUrl: './costs.scss',
})
export class Costs {
	private svc = inject(BudgetService)
	private dialog = inject(MatDialog)
	// Gruppnamn/etikett
	groupLabel(c?: Category): string {
		switch (c) {
			// Boende & drift
			case Category.Housing:
			case Category.UtilitiesElectricity:
			case Category.UtilitiesWaterSewer:
			case Category.UtilitiesHeating:
			case Category.HomeMaintenance:
			case Category.FurnitureAppliances:
				return 'Boende & drift'

			// Mat & hushåll
			case Category.Food:
			case Category.DiningOut:
			case Category.Household:
				return 'Mat & hushåll'

			// Transport
			case Category.VehicleFuel:
			case Category.VehicleMaintenance:
			case Category.VehicleTaxTollsParking:
			case Category.PublicTransport:
				return 'Transport'

			// Ekonomi
			case Category.Loans:
			case Category.Insurance:
			case Category.Savings:
			case Category.BankFees:
				return 'Ekonomi'

			// IT & abonnemang
			case Category.IT:
			case Category.Subscriptions:
				return 'IT & abonnemang'

			// Personligt & hälsa
			case Category.Clothing:
			case Category.Healthcare:
			case Category.Pharmacy:
			case Category.Dental:
			case Category.Beauty:
			case Category.SportsGym:
				return 'Personligt & hälsa'

			// Barn & husdjur
			case Category.Children:
			case Category.Pets:
				return 'Barn & husdjur'

			// Fritid & resor
			case Category.Entertainment:
			case Category.Hobbies:
			case Category.TravelHoliday:
			case Category.GiftsCharity:
				return 'Fritid & resor'

			// Hem & trädgård
			case Category.GardenOutdoor:
				return 'Hem & trädgård'

			default:
				return 'Övrigt'
		}
	}

	// Material-ikon för gruppen
	groupIcon(c?: Category): string {
		switch (this.groupLabel(c)) {
			case 'Boende & drift':
				return 'home'
			case 'Mat & hushåll':
				return 'restaurant'
			case 'Transport':
				return 'directions_car'
			case 'Ekonomi':
				return 'savings'
			case 'IT & abonnemang':
				return 'devices'
			case 'Personligt & hälsa':
				return 'health_and_safety'
			case 'Barn & husdjur':
				return 'child_care'
			case 'Fritid & resor':
				return 'emoji_events' // alt: 'flight', 'movie'
			case 'Hem & trädgård':
				return 'yard'
			default:
				return 'category'
		}
	}
	tableData = computed<(CostRow | GroupHeader)[]>(() => {
		const order = [
			'Boende & drift',
			'Mat & hushåll',
			'Transport',
			'Ekonomi',
			'IT & abonnemang',
			'Personligt & hälsa',
			'Barn & husdjur',
			'Fritid & resor',
			'Hem & trädgård',
			'Övrigt',
		]

		// gruppera
		const groups = new Map<string, CostRow[]>()
		for (const r of this.rows()) {
			const g = this.groupLabel(r.category)
			if (!groups.has(g)) groups.set(g, [])
			groups.get(g)!.push(r)
		}

		// flata i “order”, hoppa över tomma grupper
		const out: (CostRow | GroupHeader)[] = []
		for (const g of order) {
			const rs = groups.get(g)
			if (!rs || rs.length === 0) continue
			out.push({ __kind: 'group', label: g, icon: this.groupIcon(rs[0].category) })
			out.push(...rs)
		}
		return out
	})

	// Row-predikat
	isGroupRow = (_: number, item: CostRow | GroupHeader) => (item as any).__kind === 'group'
	isDataRow = (_: number, item: CostRow | GroupHeader) => !(item as any).__kind

	// (valfritt) hjälp för tooltip i name-cellen
	categoryChip(r: CostRow) {
		return this.groupLabel(r.category)
	}
	displayedColumns = [/* 'cat', */ 'name', 'mikael', 'jessica', 'total'] as const

	rows = computed<CostRow[]>(() => {
		const byTitle = new Map<string, CostRow>()

		for (const e of this.svc.entries()) {
			if (e.type !== 'cost') continue

			const key = e.title.trim().toLowerCase()
			const row =
				byTitle.get(key) ??
				({
					title: e.title,
					mikaelAmount: 0,
					jessicaAmount: 0,
					category: e.category,
					temporary: false,
					sort: e.sort ?? 0,
				} as CostRow)

			if (e.person === 'mikael') {
				row.idMikael = e.id
				row.mikaelAmount = e.amount ?? 0
			} else if (e.person === 'jessica') {
				row.idJessica = e.id
				row.jessicaAmount = e.amount ?? 0
			}

			row.category ??= e.category
			row.temporary = row.temporary || !!e.temporary
			row.sort = Math.min(row.sort ?? Number.MAX_SAFE_INTEGER, e.sort ?? Number.MAX_SAFE_INTEGER)
			byTitle.set(key, row)
		}

		return Array.from(byTitle.values()).sort((a, b) => {
			const as = a.sort ?? Number.MAX_SAFE_INTEGER
			const bs = b.sort ?? Number.MAX_SAFE_INTEGER
			return as !== bs ? as - bs : a.title.localeCompare(b.title, 'sv')
		})
	})

	totals = computed(() => {
		const rs = this.rows()
		// Exkludera temporary från summering
		const active = rs.filter(r => !r.temporary)

		return {
			mikael: active.reduce((s, r) => s + (r.mikaelAmount || 0), 0),
			jessica: active.reduce((s, r) => s + (r.jessicaAmount || 0), 0),
			all: active.reduce((s, r) => s + (r.mikaelAmount || 0) + (r.jessicaAmount || 0), 0),
		}
	})

	toCurrency(ore?: number) {
		const v = Math.round((ore ?? 0) / 100)
		return v.toLocaleString('sv-SE', {
			style: 'currency',
			currency: 'SEK',
			minimumFractionDigits: 0,
		})
	}

	getRowTotal(r: CostRow) {
		return (r.mikaelAmount || 0) + (r.jessicaAmount || 0)
	}

	// ---- Dialoger ----
	async openAdd() {
		const res = (await firstValueFrom(
			this.dialog
				.open(AddEditDialogComponent, {
					height: '440px',
					data: {
						mode: 'cost',
						uidMikael: 'mikael',
						uidJessica: 'jessica',
					},
				})
				.afterClosed()
		)) as DialogResult | undefined

		if (!res) return

		const bothZero = (res.perUser?.mikael ?? 0) === 0 && (res.perUser?.jessica ?? 0) === 0

		await this.upsertForPerson(res, 'mikael', undefined, { allowZeroOnCreate: bothZero })
		await this.upsertForPerson(res, 'jessica', undefined, { allowZeroOnCreate: bothZero })
	}

	async editRow(row: CostRow) {
		const res = (await firstValueFrom(
			this.dialog
				.open(AddEditDialogComponent, {
					height: '440px',
					data: {
						mode: 'cost',
						// du kan skicka ett av id:n (används vid delete-knappen i dialogen)
						id: row.idMikael || row.idJessica,
						name: row.title,
						category: row.category,
						// dessa är i öre — dialogen konverterar till kr i sin form
						perUser: { mikael: row.mikaelAmount, jessica: row.jessicaAmount },
						uidMikael: 'mikael',
						uidJessica: 'jessica',
						temporary: row.temporary ?? false,
					},
				})
				.afterClosed()
		)) as DialogClosed | undefined

		if (!res) return

		// 🗑️ Radering
		if ('delete' in res && res.delete) {
			if (row.idMikael) await this.svc.remove(row.idMikael)
			if (row.idJessica) await this.svc.remove(row.idJessica)
			return
		}

		// 💾 Spara
		if (!('delete' in res)) {
			await this.upsertForPerson(res, 'mikael', row.idMikael)
			await this.upsertForPerson(res, 'jessica', row.idJessica)
		}
	}

	// Gemensam hjälpare för add/update per person
	private async upsertForPerson(
		res: DialogResult,
		person: 'mikael' | 'jessica',
		existingId?: string,
		opts: { allowZeroOnCreate?: boolean } = {}
	) {
		const amount = res.perUser?.[person] ?? 0

		if (existingId) {
			// Update får skriva 0 (nollställning) som tidigare
			await this.svc.update(existingId, {
				title: res.name,
				amount,
				person,
				type: res.mode,
				category: res.category,
				temporary: !!res.temporary,
			})
		} else if (amount > 0 || opts.allowZeroOnCreate) {
			// Nytt dokument – skapa även om amount = 0 när det uttryckligen tillåts
			await this.svc.add({
				title: res.name,
				amount,
				person,
				type: res.mode,
				category: res.category,
				temporary: !!res.temporary,
			})
		}
	}
}
