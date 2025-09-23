// plants.service.ts
import { Injectable, inject, EnvironmentInjector, runInInjectionContext, computed, Signal } from '@angular/core'
import {
	Firestore,
	collection,
	query,
	orderBy,
	doc,
	addDoc,
	setDoc,
	deleteDoc,
	updateDoc,
} from '@angular/fire/firestore'
import { collectionData } from '@angular/fire/firestore'
import { toSignal } from '@angular/core/rxjs-interop'
import { PlantSpecies } from './plants.model'
import { map } from 'rxjs/operators'

type SpeciesDoc = Omit<PlantSpecies, 'id'> & { id?: string }

@Injectable({ providedIn: 'root' })
export class PlantsService {
	private fs = inject(Firestore)
	private env = inject(EnvironmentInjector)

	// Liten helper så vi slipper upprepa oss
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

	readonly byId = computed(() => {
		const m = new Map<string, PlantSpecies>()
		for (const s of this.species()) m.set(s.id, s)
		return m
	})

	async addSpecies(s: Omit<PlantSpecies, 'id'>): Promise<string> {
		// Viktigt: själva addDoc körs i injection context
		const ref = await this.inCtx(() => addDoc(this.speciesCol, s))
		return ref.id
	}

	async upsertSpecies(s: PlantSpecies) {
		await this.inCtx(async () => {
			const { id, ...rest } = s
			const d = doc(this.fs, `plants/${id}`)
			await setDoc(d, rest, { merge: true })
		})
	}

	private prune<T extends Record<string, any>>(obj: T): Partial<T> {
		const out: any = {}
		for (const [k, v] of Object.entries(obj)) {
			if (v === undefined) continue
			if (typeof v === 'string' && v.trim() === '') continue
			if (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) continue
			out[k] = v
		}
		return out
	}

	async updateSpecies(id: string, patch: Partial<Omit<PlantSpecies, 'id'>>) {
		await this.inCtx(async () => {
			const d = doc(this.fs, 'plants', id)
			await updateDoc(d, this.prune(patch) as any)
		})
	}

	async removeSpecies(id: string) {
		await this.inCtx(async () => {
			const d = doc(this.fs, `plants/${id}`)
			await deleteDoc(d)
		})
	}
}
