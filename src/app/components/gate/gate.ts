import { Component, computed, inject } from '@angular/core'
import { AuthService } from '../../auth.service'
import { Home } from '../home/home'
import { Welcome } from '../welcome/welcome'

@Component({
	selector: 'app-gate',
	imports: [Home, Welcome],
	templateUrl: './gate.html',
	styleUrl: './gate.scss',
})
export class Gate {
	private auth = inject(AuthService)
	user = computed(() => this.auth.currentUser())
	// valfritt: sätt en ready-signal i AuthService när onAuthStateChanged triggat minst en gång
	ready = computed(() => this.auth.ready())
}
