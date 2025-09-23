import { Component, inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { AddEditPlantDialogComponent } from './add-edit-plant-dialog.component'
import { firstValueFrom } from 'rxjs'
import { PlantsService } from '../plants.service'

@Component({
	selector: 'app-add-plant',
	standalone: true,
	imports: [MatIconModule, MatButtonModule],
	templateUrl: './add-plant.html',
	styleUrl: './add-plant.scss',
})
export class AddPlant {
	private dialog = inject(MatDialog)
	private plants = inject(PlantsService)

	open() {
		const ref = this.dialog.open(AddEditPlantDialogComponent, {
			width: '720px',
			maxWidth: '95vw',
			maxHeight: '90vh',
			autoFocus: 'first-tabbable',
			data: { mode: 'add' } as const,
		})

		;(async () => {
			const res = await firstValueFrom(ref.afterClosed())
			if (res?.ok && res.mode === 'add') {
				const clean = pruneUndefined(res.value)
				const id = await this.plants.addSpecies(clean as any)
				console.log('Ny växt skapad:', id)
			}
		})()
	}
}
// Samma pruneUndefined som ovan – lägg i en utils.ts om du vill återanvända
function pruneUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
	const out: any = {}
	for (const k of Object.keys(obj)) {
		const v = obj[k]
		if (v === undefined) continue
		if (typeof v === 'string' && v.trim() === '') continue
		if (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) continue
		out[k] = v
	}
	return out
}
