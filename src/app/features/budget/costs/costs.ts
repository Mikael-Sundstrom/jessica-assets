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
import { Category, EXPENSE_CATEGORY_GROUPS } from '../budget.model'

type GroupHeader = { __kind: 'group'; label: string; icon: string }

const GROUP_ICON: Record<string, string> = {
	'Boende & drift': 'home',
	'Mat & hushåll': 'restaurant',
	Transport: 'directions_car',
	Ekonomi: 'account_balance',
	Sparande: 'savings',
	'IT & abonnemang': 'devices',
	'Personligt & hälsa': 'health_and_safety',
	'Barn & husdjur': 'child_care',
	'Fritid & resor': 'emoji_events', // alt: 'flight', 'movie'
	'Hem & trädgård': 'yard',
	Övrigt: 'category',
}

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

	// Map category -> group label från modellen
	private labelByCategory = computed(() => {
		const m = new Map<Category, string>()
		for (const g of EXPENSE_CATEGORY_GROUPS) {
			for (const c of g.items) m.set(c, g.label)
		}
		return m
	})

	groupLabel(c?: Category): string {
		if (!c) return 'Övrigt'
		return this.labelByCategory().get(c) ?? 'Övrigt'
	}

	groupIcon(c?: Category): string {
		const label = this.groupLabel(c)
		return GROUP_ICON[label] ?? 'category'
	}

	private groupOrder = computed(() => [...EXPENSE_CATEGORY_GROUPS.map(g => g.label), 'Övrigt'])

	tableData = computed<(CostRow | GroupHeader)[]>(() => {
		const groups = new Map<string, CostRow[]>()
		for (const r of this.rows()) {
			const g = this.groupLabel(r.category)
			if (!groups.has(g)) groups.set(g, [])
			groups.get(g)!.push(r)
		}

		const out: (CostRow | GroupHeader)[] = []
		for (const g of this.groupOrder()) {
			const rs = groups.get(g)
			if (!rs || rs.length === 0) continue
			out.push({ __kind: 'group', label: g, icon: this.groupIcon(rs[0].category) })
			out.push(...rs)
		}
		return out
	})

	isGroupRow = (_: number, item: CostRow | GroupHeader) => (item as any).__kind === 'group'
	isDataRow = (_: number, item: CostRow | GroupHeader) => !(item as any).__kind

	categoryChip(r: CostRow) {
		return this.groupLabel(r.category)
	}

	displayedColumns = ['name', 'mikael', 'jessica', 'total'] as const

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
						id: row.idMikael || row.idJessica,
						name: row.title,
						category: row.category,
						perUser: { mikael: row.mikaelAmount, jessica: row.jessicaAmount },
						uidMikael: 'mikael',
						uidJessica: 'jessica',
						temporary: row.temporary ?? false,
					},
				})
				.afterClosed()
		)) as DialogClosed | undefined

		if (!res) return

		if ('delete' in res && res.delete) {
			if (row.idMikael) await this.svc.remove(row.idMikael)
			if (row.idJessica) await this.svc.remove(row.idJessica)
			return
		}

		if (!('delete' in res)) {
			await this.upsertForPerson(res, 'mikael', row.idMikael)
			await this.upsertForPerson(res, 'jessica', row.idJessica)
		}
	}

	private async upsertForPerson(
		res: DialogResult,
		person: 'mikael' | 'jessica',
		existingId?: string,
		opts: { allowZeroOnCreate?: boolean } = {}
	) {
		const amount = res.perUser?.[person] ?? 0

		if (existingId) {
			await this.svc.update(existingId, {
				title: res.name,
				amount,
				person,
				type: res.mode,
				category: res.category,
				temporary: !!res.temporary,
			})
		} else if (amount > 0 || opts.allowZeroOnCreate) {
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
