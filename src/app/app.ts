// app/app.ts
import { Component, computed, inject, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatDividerModule } from '@angular/material/divider'
import { Router, RouterOutlet, RouterLink, NavigationEnd } from '@angular/router'
import { AuthService } from './auth.service'
import { toSignal } from '@angular/core/rxjs-interop'
import { filter, map, startWith } from 'rxjs/operators'

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [
		MatToolbarModule,
		MatButtonModule,
		MatIconModule,
		MatMenuModule,
		MatDividerModule,
		RouterOutlet,
		RouterLink,
	],
	templateUrl: './app.html',
	styleUrl: './app.scss',
})
export class App {
	private auth = inject(AuthService)
	private router = inject(Router)

	user = computed(() => this.auth.currentUser())

	// Title och bakåtknapp
	showBack = computed(() => {
		const data = typeof this.routeData() === 'function' ? (this.routeData() as any)() : this.routeData()
		return !!data.back
	})
	showCenterTitle = computed(() => {
		const data = typeof this.routeData() === 'function' ? (this.routeData() as any)() : this.routeData()
		return !!data.center
	})
	private routeData = toSignal(
		this.router.events.pipe(
			filter(e => e instanceof NavigationEnd),
			map(() => {
				let r = this.router.routerState.root
				while (r.firstChild) r = r.firstChild
				const data = r.snapshot.data
				return typeof data === 'object' && data !== null ? data : {}
			}),
			startWith(() => {
				let r = this.router.routerState.root
				while ((r as any).firstChild) r = (r as any).firstChild!
				const data = r.snapshot.data
				return typeof data === 'object' && data !== null ? data : {}
			})
		),
		{ initialValue: {} as { title?: string; back?: boolean; center?: boolean } }
	)
	title = computed(() => {
		const data = typeof this.routeData() === 'function' ? (this.routeData() as any)() : this.routeData()
		return data.title ?? 'App'
	})
	initials = computed(() => {
		const n = this.user()?.displayName?.trim() || this.user()?.email || ''
		return n
			.split(/\s+/)
			.map(s => s[0])
			.slice(0, 2)
			.join('')
			.toUpperCase()
	})

	// tema
	currentTheme = signal(localStorage.getItem('theme') ?? '')

	themes = [
		{ class: 'theme-rose', label: 'Rosa', color: '#f42a6eff' },
		{ class: 'theme-red', label: 'Röd', color: '#e91e1eff' },
		{ class: 'theme-blue', label: 'Blå', color: '#2196f3' },
		{ class: 'theme-green', label: 'Grön', color: '#4caf50' },
		{ class: 'theme-yellow', label: 'Gul', color: '#ff9800' },
		{ class: 'theme-magenta', label: 'Magenta', color: '#d81b60' },
	]

	setTheme(themeClass: string) {
		const root = document.documentElement
		this.themes.forEach(t => root.classList.remove(t.class))
		if (themeClass) root.classList.add(themeClass)
		localStorage.setItem('theme', themeClass)
		this.currentTheme.set(themeClass)
	}

	toggleTheme() {
		document.documentElement.classList.toggle('theme-blue')
	}

	login() {
		this.auth.loginWithGoogle().catch(console.error)
	}
	logout() {
		this.auth.logout()
	}
}
