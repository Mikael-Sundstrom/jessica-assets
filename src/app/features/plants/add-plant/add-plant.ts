import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

@Component({
	selector: 'app-add-plant',
	imports: [MatIconModule, MatButtonModule],
	templateUrl: './add-plant.html',
	styleUrl: './add-plant.scss',
})
export class AddPlant {}
