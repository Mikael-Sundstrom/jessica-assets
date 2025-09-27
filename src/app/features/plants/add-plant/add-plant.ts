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
				await this.plants.addSpecies(res.value)
			}
		})()
	}
}
