import { Component } from '@angular/core'
import { PlantsList } from './list/list'
import { AddPlant } from './add-plant/add-plant'

@Component({
	selector: 'app-plants',
	standalone: true,
	imports: [PlantsList, AddPlant],
	templateUrl: './plants-shell.html',
	styleUrl: './plants-shell.scss',
})
export class PlantsShell {}
