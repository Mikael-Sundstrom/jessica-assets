// household.service.ts
import { Injectable, inject, computed, EnvironmentInjector, runInInjectionContext } from '@angular/core'
import { Firestore, collection, query, orderBy } from '@angular/fire/firestore'
import { collectionData } from '@angular/fire/firestore'
import { toSignal } from '@angular/core/rxjs-interop'
import { map } from 'rxjs/operators'
import { HouseholdEntry } from './budget.model'

@Injectable({ providedIn: 'root' })
export class BudgetService {
	private readonly fs = inject(Firestore)
	private readonly env = inject(EnvironmentInjector)

	// Skapa refs/queries inuti InjectionContext
	private readonly col = runInInjectionContext(this.env, () => collection(this.fs, 'household'))

	private readonly q = runInInjectionContext(this.env, () =>
		query(this.col, orderBy('sort', 'asc'), orderBy('createdAt', 'asc'))
	)
	// Realtime -> Signal (subscriben skapas i InjectionContext)
	readonly entries = toSignal(
		runInInjectionContext(this.env, () =>
			collectionData(this.q, { idField: 'id' }).pipe(
				map((rows: any[]) =>
					rows.map(
						r =>
							({
								...r,
								createdAt: r?.createdAt?.toDate?.() ?? null,
							} as HouseholdEntry)
					)
				)
			)
		),
		{ initialValue: [] as HouseholdEntry[] }
	)

	// Härledda vyer
	readonly costs = computed(() => this.entries().filter(e => e.type === 'cost'))
	readonly incomes = computed(() => this.entries().filter(e => e.type === 'income'))

	// Utility för att inte skriva undefined till Firestore
	private clean<T extends object>(obj: T): T {
		return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T
	}

	// CRUD — alla Firebase-anrop wrappas i runInInjectionContext
	async add(entry: Omit<HouseholdEntry, 'id' | 'createdAt' | 'sort'>) {
		return runInInjectionContext(this.env, async () => {
			const { addDoc, serverTimestamp } = await import('@angular/fire/firestore')
			await addDoc(
				this.col,
				this.clean({
					...entry,
					sort: Date.now(), // 👈 default sort
					createdAt: serverTimestamp(),
				})
			)
		})
	}

	async update(id: string, patch: Partial<HouseholdEntry>) {
		return runInInjectionContext(this.env, async () => {
			const { doc, updateDoc } = await import('@angular/fire/firestore')
			await updateDoc(doc(this.fs, 'household', id), this.clean(patch) as any)
		})
	}

	async remove(id: string) {
		return runInInjectionContext(this.env, async () => {
			const { doc, deleteDoc } = await import('@angular/fire/firestore')
			await deleteDoc(doc(this.fs, 'household', id))
		})
	}

	// Hjälpmetod för summeringar (behåller enkel anrop-syntax i komponenter)
	totalFor(type: 'cost' | 'income', person?: 'mikael' | 'jessica') {
		return this.entries()
			.filter(e => e.type === type && (!person || e.person === person))
			.reduce((sum, e) => sum + e.amount, 0)
	}
}
