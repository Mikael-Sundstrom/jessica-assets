import { Injectable, inject, signal, Injector, runInInjectionContext } from '@angular/core'
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from '@angular/fire/auth'

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly injector = inject(Injector)
	private readonly auth = inject(Auth)

	ready = signal(false)
	currentUser = signal<User | null>(null)
	allowedUsers = ['ullbergjessica@gmail.com', 'permikaelsundstrom@gmail.com']

	constructor() {
		runInInjectionContext(this.injector, () => {
			onAuthStateChanged(this.auth, user => {
				if (user && !this.allowedUsers.includes(user.email || '')) {
					this.logout()
					this.currentUser.set(null)
				} else {
					this.currentUser.set(user)
				}
				this.ready.set(true) // markera att initial auth är klar
			})
		})
	}

	loginWithGoogle() {
		const provider = new GoogleAuthProvider()
		return runInInjectionContext(this.injector, () =>
			signInWithPopup(this.auth, provider).then(result => {
				if (!this.allowedUsers.includes(result.user.email || '')) {
					this.logout()
					throw new Error('Otillåten användare')
				}
				return result
			})
		)
	}

	logout() {
		return runInInjectionContext(this.injector, () => signOut(this.auth))
	}
}
