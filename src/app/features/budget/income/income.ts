// income.ts
import { Component, computed, inject } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { AddEditDialogComponent } from '../add-edit-dialog.component'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatTableModule } from '@angular/material/table'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { BudgetService } from '../budget.service'
import { DialogClosed, DialogResult, Category, IncomeRow } from '../budget.model'

@Component({
	selector: 'app-income',
	standalone: true,
	imports: [MatTableModule, MatIconModule, MatDialogModule, MatButtonModule, CdkDropList, CdkDrag],
	templateUrl: './income.html',
	styleUrls: ['./income.scss'],
})
export class Income {
	private svc = inject(BudgetService)
	private dialog = inject(MatDialog)

	displayedColumns = ['name', 'mikael', 'jessica', 'total'] as const

	rows = computed<IncomeRow[]>(() => {
		const byTitle = new Map<string, IncomeRow>()

		for (const e of this.svc.entries()) {
			if (e.type !== 'income') continue
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
				} as IncomeRow)

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
		return v.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK', minimumFractionDigits: 0 })
	}

	getRowTotal(r: IncomeRow) {
		return (r.mikaelAmount || 0) + (r.jessicaAmount || 0)
	}

	async openAdd() {
		const res = (await firstValueFrom(
			this.dialog
				.open(AddEditDialogComponent, {
					height: '440px',
					data: {
						mode: 'income',
						uidMikael: 'mikael',
						uidJessica: 'jessica',
					},
				})
				.afterClosed()
		)) as DialogResult | undefined

		if (!res) return

		// Tillåt “titel-endast” (båda beloppen = 0) vid skapande
		const bothZero = (res.perUser?.mikael ?? 0) === 0 && (res.perUser?.jessica ?? 0) === 0
		await this.upsertForPerson(res, 'mikael', undefined, { allowZeroOnCreate: bothZero })
		await this.upsertForPerson(res, 'jessica', undefined, { allowZeroOnCreate: bothZero })
	}

	async editRow(row: IncomeRow) {
		const res = (await firstValueFrom(
			this.dialog
				.open(AddEditDialogComponent, {
					height: '440px',
					data: {
						mode: 'income',
						id: row.idMikael || row.idJessica,
						name: row.title,
						category: row.category ?? Category.Income,
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
				category: res.category ?? Category.Income,
				temporary: !!res.temporary,
			})
		} else if (amount > 0 || opts.allowZeroOnCreate) {
			await this.svc.add({
				title: res.name,
				amount,
				person,
				type: res.mode,
				category: res.category ?? Category.Income,
				temporary: !!res.temporary,
			})
		}
	}

	async drop(event: CdkDragDrop<IncomeRow[]>) {
		const arr = [...this.rows()]
		moveItemInArray(arr, event.previousIndex, event.currentIndex)
		const base = 100,
			step = 100
		await Promise.all(
			arr.map((row, idx) => {
				const sort = base + idx * step
				const ps: Promise<any>[] = []
				if (row.idMikael) ps.push(this.svc.update(row.idMikael, { sort }))
				if (row.idJessica) ps.push(this.svc.update(row.idJessica, { sort }))
				return Promise.all(ps)
			})
		)
	}
}
