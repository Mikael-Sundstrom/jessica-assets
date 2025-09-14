import { Component, inject, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { PlantsService } from './plants.service'
import { FERTILIZER_LABEL, Planting, PlantSpecies, SUNLIGHT_LABEL, WATER_LABEL } from './plants.models'
import { PlantsList } from './list/list'

@Component({
	selector: 'app-plants',
	standalone: true,
	imports: [PlantsList],
	templateUrl: './plants-shell.html',
	styleUrl: './plants-shell.scss',
})
export class PlantsShell {}
