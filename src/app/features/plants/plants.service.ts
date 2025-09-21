// plants.service.ts
import { Injectable, inject, EnvironmentInjector, runInInjectionContext, computed, Signal } from '@angular/core'
import { Firestore, collection, query, orderBy, doc, addDoc, setDoc, deleteDoc } from '@angular/fire/firestore'
import { collectionData } from '@angular/fire/firestore'
import { toSignal } from '@angular/core/rxjs-interop'
import { PlantSpecies } from './plants.model'
import { map } from 'rxjs/operators'

type SpeciesDoc = Omit<PlantSpecies, 'id'> & { id?: string } // ← Firestore-dokumentet saknar id, men behövs för idField

@Injectable({ providedIn: 'root' })
export class PlantsService {
	private fs = inject(Firestore)
	private env = inject(EnvironmentInjector)

	private speciesCol = runInInjectionContext(this.env, () =>
		collection(this.fs, 'plants')
	) as import('firebase/firestore').CollectionReference<SpeciesDoc>

	readonly species: Signal<PlantSpecies[]> = toSignal(
		runInInjectionContext(this.env, () =>
			collectionData<SpeciesDoc>(query(this.speciesCol, orderBy('plantType', 'asc')), {
				idField: 'id',
			}).pipe(map(list => list as PlantSpecies[]))
		),
		{ initialValue: [] }
	)

	readonly byId = computed(() => {
		const m = new Map<string, PlantSpecies>()
		for (const s of this.species()) m.set(s.id, s)
		return m
	})

	async addSpecies(s: Omit<PlantSpecies, 'id'>) {
		await addDoc(this.speciesCol, s)
	}

	async upsertSpecies(s: PlantSpecies) {
		const { id, ...rest } = s
		const d = runInInjectionContext(this.env, () => doc(this.fs, `plants/${id}`))
		await setDoc(d, rest, { merge: true }) // skriv inte id i dokumentet
	}

	async updateSpecies(id: string, patch: Partial<PlantSpecies>) {
		const { id: _ignore, ...rest } = patch as any
		const d = runInInjectionContext(this.env, () => doc(this.fs, `plants/${id}`))
		await setDoc(d, rest, { merge: true })
	}

	async removeSpecies(id: string) {
		const d = runInInjectionContext(this.env, () => doc(this.fs, `plants/${id}`))
		await deleteDoc(d)
	}
}
