import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core'
import { provideRouter } from '@angular/router'

import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon'
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field'
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar'
import { MAT_DATE_LOCALE } from '@angular/material/core'
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog'
import { MAT_RIPPLE_GLOBAL_OPTIONS } from '@angular/material/core'

import { routes } from './app.routes'
import { initializeApp, provideFirebaseApp } from '@angular/fire/app'
import { getAuth, provideAuth } from '@angular/fire/auth'
import { getFirestore, provideFirestore } from '@angular/fire/firestore'
import { getStorage, provideStorage } from '@angular/fire/storage'

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideZonelessChangeDetection(),
		provideRouter(routes),

		// ✅ Material defaults (globala)
		{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', subscriptSizing: 'dynamic' } },
		{ provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 3000 } },
		{ provide: MAT_DATE_LOCALE, useValue: 'sv-SE' },
		{ provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true, disableClose: false } },
		{ provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: { disabled: false } },
		{ provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { autoFocus: true, restoreFocus: true } },
		{ provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-rounded' } },
		// 🔥 AngularFire (hosten äger init)
		provideFirebaseApp(() =>
			initializeApp({
				projectId: 'jessica-assets',
				appId: '1:490194807563:web:7b39f3ca3baa28b021100e',
				storageBucket: 'jessica-assets.firebasestorage.app',
				apiKey: 'AIzaSyCggeMH0sML-h1j2uoKVP5KKTQKuAjNWmo',
				authDomain: 'jessica-assets.firebaseapp.com',
				messagingSenderId: '490194807563',
			})
		),
		provideAuth(() => getAuth()),
		provideFirestore(() => getFirestore()),
		provideStorage(() => getStorage()),
	],
}
