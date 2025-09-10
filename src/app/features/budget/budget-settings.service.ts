// budget-settings.service.ts
import { Injectable, effect, signal } from '@angular/core'
import { Category } from './budget.model'

export type CostView = 'total' | 'grouped' | 'detailed'

@Injectable({ providedIn: 'root' })
export class BudgetSettingsService {
	private storageKey = 'budget.settings.v4'

	// Endast nya, rena inställningar
	costView = signal<CostView>('grouped')

	includeTemporary = signal(false)
	costIncludeSavingsAsExpense = signal(false)
	costIncludeAmortizationAsExpense = signal(false)

	showMikael = signal(true)
	showJessica = signal(true)

	constructor() {
		const raw = localStorage.getItem(this.storageKey)
		if (raw) {
			try {
				const s = JSON.parse(raw)
				if (s.costView) this.costView.set(s.costView)
				if (typeof s.includeTemporary === 'boolean') this.includeTemporary.set(s.includeTemporary)
				if (typeof s.costIncludeSavingsAsExpense === 'boolean')
					this.costIncludeSavingsAsExpense.set(s.costIncludeSavingsAsExpense)
				if (typeof s.costIncludeAmortizationAsExpense === 'boolean')
					this.costIncludeAmortizationAsExpense.set(s.costIncludeAmortizationAsExpense)
				if (typeof s.showMikael === 'boolean') this.showMikael.set(s.showMikael)
				if (typeof s.showJessica === 'boolean') this.showJessica.set(s.showJessica)
			} catch {}
		}

		effect(() => {
			localStorage.setItem(
				this.storageKey,
				JSON.stringify({
					costView: this.costView(),
					includeTemporary: this.includeTemporary(),
					costIncludeSavingsAsExpense: this.costIncludeSavingsAsExpense(),
					costIncludeAmortizationAsExpense: this.costIncludeAmortizationAsExpense(),
					showMikael: this.showMikael(),
					showJessica: this.showJessica(),
				})
			)
		})
	}

	// setters
	setCostView(v: CostView) {
		this.costView.set(v)
	}
	setIncludeTemporary(v: boolean) {
		this.includeTemporary.set(v)
	}
	setCostIncludeSavingsAsExpense(v: boolean) {
		this.costIncludeSavingsAsExpense.set(v)
	}
	setCostIncludeAmortizationAsExpense(v: boolean) {
		this.costIncludeAmortizationAsExpense.set(v)
	}
	toggleMikael() {
		this.showMikael.set(!this.showMikael())
	}
	toggleJessica() {
		this.showJessica.set(!this.showJessica())
	}

	// helpers
	isAmortization(cat: Category) {
		return cat === 'finance.loan_amortization'
	}
	// isSavings(cat: Category) { return cat.startsWith('savings.'); } // för framtiden
}
