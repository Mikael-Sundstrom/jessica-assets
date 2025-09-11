// budget-settings.service.ts
import { Injectable, effect, signal } from '@angular/core'
import { Category } from './budget.model'

export type CostView = 'total' | 'grouped' | 'detailed'

@Injectable({ providedIn: 'root' })
export class BudgetSettingsService {
	private storageKey = 'budget.settings.v5'

	costView = signal<CostView>('grouped')
	includeTemporary = signal(false)
	costIncludeSavingsAsExpense = signal(false)
	costIncludeAmortizationAsExpense = signal(false)

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
				})
			)
		})
	}

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

	// helpers
	isAmortization(cat: Category) {
		return cat === 'finance.loan_amortization'
	}
}
