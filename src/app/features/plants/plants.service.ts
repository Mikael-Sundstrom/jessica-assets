// plants.service.ts
import { Injectable, inject, EnvironmentInjector, runInInjectionContext, computed, Signal } from '@angular/core'
import { Firestore, collection, query, orderBy, doc, addDoc, setDoc, deleteDoc } from '@angular/fire/firestore'
import { collectionData } from '@angular/fire/firestore'
import { toSignal } from '@angular/core/rxjs-interop'
import { PlantSpecies, Planting } from './plants.models'

@Injectable({ providedIn: 'root' })
export class PlantsService {
	private fs = inject(Firestore)
	private env = inject(EnvironmentInjector)

	// ✅ arter i toppnivå-kollektionen "plants"
	private speciesCol = runInInjectionContext(this.env, () =>
		collection(this.fs, 'plants')
	) as import('firebase/firestore').CollectionReference<PlantSpecies>

	// ✅ plantingar i toppnivå-kollektionen "plantings" (ändra om du vill)
	private plantingsCol = runInInjectionContext(this.env, () =>
		collection(this.fs, 'plantings')
	) as import('firebase/firestore').CollectionReference<Planting>

	/** ✅ Korrekt typad och iterable från start */
	readonly species: Signal<PlantSpecies[]> = toSignal(
		runInInjectionContext(this.env, () =>
			collectionData<PlantSpecies>(query(this.speciesCol, orderBy('plantType', 'asc')), { idField: 'id' })
		),
		{ initialValue: [] } // <-- viktigt!
	)

	readonly plantings: Signal<Planting[]> = toSignal(
		runInInjectionContext(this.env, () =>
			collectionData<Planting>(query(this.plantingsCol, orderBy('createdAt', 'desc')), { idField: 'id' })
		),
		{ initialValue: [] }
	)

	readonly bySpecies = computed(() => {
		const map = new Map<string, PlantSpecies>()
		for (const s of this.species()) map.set(s.id, s)
		return map
	})

	async addSpecies(s: Omit<PlantSpecies, 'id' | 'createdAt' | 'updatedAt'>) {
		await addDoc(this.speciesCol, {
			...s,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			id: '',
		})
	}
	async upsertSpecies(s: PlantSpecies) {
		const d = runInInjectionContext(this.env, () => doc(this.fs, `plants/${s.id}`))
		await setDoc(d, { ...s, updatedAt: Date.now() }, { merge: true })
	}
	async removeSpecies(id: string) {
		const d = runInInjectionContext(this.env, () => doc(this.fs, `plants/${id}`))
		await deleteDoc(d)
	}

	async addPlanting(p: Omit<Planting, 'id' | 'createdAt' | 'updatedAt'>) {
		await addDoc(this.plantingsCol, {
			...p,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			id: '',
		})
	}
	async upsertPlanting(p: Planting) {
		const d = runInInjectionContext(this.env, () => doc(this.fs, `plantings/${p.id}`))
		await setDoc(d, { ...p, updatedAt: Date.now() }, { merge: true })
	}
	async removePlanting(id: string) {
		const d = runInInjectionContext(this.env, () => doc(this.fs, `plantings/${id}`))
		await deleteDoc(d)
	}
}
