import { bootstrapApplication } from '@angular/platform-browser'
import { appConfig } from './app/app.config'
import { App } from './app/app'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)
const saved = localStorage.getItem('theme')
if (saved) {
	document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-blue', 'theme-rose')
	document.documentElement.classList.add(saved)
}

bootstrapApplication(App, appConfig).catch(err => console.error(err))
