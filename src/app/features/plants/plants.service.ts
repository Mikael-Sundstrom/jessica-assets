// plants.service.ts
// prettier-ignore
import { Firestore, collection, query, orderBy, doc, addDoc, setDoc, deleteDoc, updateDoc, collectionData,} from '@angular/fire/firestore'
import { Injectable, inject, EnvironmentInjector, runInInjectionContext, computed, Signal } from '@angular/core'
import { deleteField } from 'firebase/firestore'
import { toSignal } from '@angular/core/rxjs-interop'
import { map } from 'rxjs/operators'
import type { PlantSpecies } from '@plants/model'

type SpeciesDoc = Omit<PlantSpecies, 'id'> & { id: string }

@Injectable({ providedIn: 'root' })
export class PlantsService {
	private fs = inject(Firestore)
	private env = inject(EnvironmentInjector)

	private inCtx<T>(fn: () => T) {
		return runInInjectionContext(this.env, fn)
	}

	private speciesCol = this.inCtx(() =>
		collection(this.fs, 'plants')
	) as import('firebase/firestore').CollectionReference<SpeciesDoc>

	readonly species: Signal<PlantSpecies[]> = toSignal(
		this.inCtx(() =>
			collectionData<SpeciesDoc>(query(this.speciesCol, orderBy('plantType', 'asc')), { idField: 'id' }).pipe(
				map(list => list as PlantSpecies[])
			)
		),
		{ initialValue: [] }
	)

	readonly byId = computed(() => new Map(this.species().map(s => [s.id, s])))

	async addSpecies(s: Omit<PlantSpecies, 'id'>): Promise<string> {
		const ref = await this.inCtx(() => addDoc(this.speciesCol, s as SpeciesDoc))
		return ref.id
	}

	async upsertSpecies(s: PlantSpecies) {
		await this.inCtx(async () => {
			const { id, ...rest } = s
			const d = doc(this.fs, 'plants', id)
			await setDoc(d, rest, { merge: true }) // merge är OK här (skapar/uppdaterar)
		})
	}

	private prune<T extends Record<string, any>>(obj: T): Partial<T> {
		const out: any = {}

		const isPlainObject = (x: unknown): x is Record<string, unknown> =>
			x != null && typeof x === 'object' && Object.getPrototypeOf(x) === Object.prototype

		for (const [k, v] of Object.entries(obj)) {
			if (v === undefined) continue
			if (typeof v === 'string' && v.trim() === '') continue
			if (Array.isArray(v) && v.length === 0) continue
			if (isPlainObject(v) && Object.keys(v).length === 0) continue
			out[k] = v
		}
		return out
	}

	// 🔑 Platta ut patchen till fältvägar så syskonfält inte skrivs bort av misstag
	private flattenForUpdate(patch: Partial<Omit<PlantSpecies, 'id'>>): Record<string, any> {
		const out: Record<string, any> = {}

		for (const [k, v] of Object.entries(patch)) {
			if (k === 'sowingWindow') {
				if (v == null) {
					out['sowingWindow'] = deleteField()
				} else {
					const w: any = v
					if (w.earliest != null) out['sowingWindow.earliest'] = w.earliest
					if (w.latest != null) out['sowingWindow.latest'] = w.latest
				}
				continue
			}

			if (k === 'harvestWindow') {
				if (v == null) {
					out['harvestWindow'] = deleteField()
				} else {
					const w: any = v
					if (w.earliest != null) out['harvestWindow.earliest'] = w.earliest
					if (w.latest != null) out['harvestWindow.latest'] = w.latest
				}
				continue
			}

			if (k === 'growthHeightCm') {
				if (v == null) {
					out['growthHeightCm'] = deleteField()
				} else if (typeof v === 'number') {
					// ren siffra → skriv hela fältet
					out['growthHeightCm'] = v
				} else {
					const h: any = v
					if (h.min != null) out['growthHeightCm.min'] = h.min
					if (h.max != null) out['growthHeightCm.max'] = h.max
				}
				continue
			}

			if (k === 'spacing') {
				if (v == null) {
					out['spacing'] = deleteField()
				} else {
					const s: any = v
					if (s.betweenPlantsCm != null) out['spacing.betweenPlantsCm'] = s.betweenPlantsCm
					if (s.betweenRowsCm != null) out['spacing.betweenRowsCm'] = s.betweenRowsCm
				}
				continue
			}

			// övriga toppnivå-fält
			out[k] = v
		}

		return out
	}

	async updateSpecies(id: string, patch: Partial<Omit<PlantSpecies, 'id'>>) {
		await this.inCtx(async () => {
			const d = doc(this.fs, 'plants', id)
			const pruned = this.prune(patch)
			const flattened = this.flattenForUpdate(pruned)
			await updateDoc(d, flattened)
		})
	}

	async removeSpecies(id: string) {
		await this.inCtx(async () => {
			const d = doc(this.fs, 'plants', id)
			await deleteDoc(d)
		})
	}
}
