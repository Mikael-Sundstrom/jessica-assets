// app/features/budget-settings.service.ts
import { Injectable, effect, signal } from '@angular/core'
import { Category } from './budget.model'

export type CostView = 'total' | 'grouped' | 'detailed'

@Injectable({ providedIn: 'root' })
export class BudgetSettingsService {
	private storageKey = 'budget.settings.v6'

	// --- CostChart ---
	costView = signal<CostView>('grouped')
	costIncludeTemporary = signal(false)
	costIncludeSavingsAsExpense = signal(false)
	costIncludeAmortizationAsExpense = signal(false)

	// --- TotalChart ---
	totalIncludeTemporary = signal(false)
	totalIncludeSavingsAsExpense = signal(false)
	totalIncludeAmortizationAsExpense = signal(false)

	constructor() {
		const raw = localStorage.getItem(this.storageKey)
		if (raw) {
			try {
				const s = JSON.parse(raw)
				if (s.costView) this.costView.set(s.costView)
				if (typeof s.costIncludeTemporary === 'boolean') this.costIncludeTemporary.set(s.costIncludeTemporary)
				if (typeof s.costIncludeSavingsAsExpense === 'boolean')
					this.costIncludeSavingsAsExpense.set(s.costIncludeSavingsAsExpense)
				if (typeof s.costIncludeAmortizationAsExpense === 'boolean')
					this.costIncludeAmortizationAsExpense.set(s.costIncludeAmortizationAsExpense)

				if (typeof s.totalIncludeTemporary === 'boolean')
					this.totalIncludeTemporary.set(s.totalIncludeTemporary)
				if (typeof s.totalIncludeSavingsAsExpense === 'boolean')
					this.totalIncludeSavingsAsExpense.set(s.totalIncludeSavingsAsExpense)
				if (typeof s.totalIncludeAmortizationAsExpense === 'boolean')
					this.totalIncludeAmortizationAsExpense.set(s.totalIncludeAmortizationAsExpense)
			} catch {}
		}

		effect(() => {
			localStorage.setItem(
				this.storageKey,
				JSON.stringify({
					// cost
					costView: this.costView(),
					costIncludeTemporary: this.costIncludeTemporary(),
					costIncludeSavingsAsExpense: this.costIncludeSavingsAsExpense(),
					costIncludeAmortizationAsExpense: this.costIncludeAmortizationAsExpense(),
					// total
					totalIncludeTemporary: this.totalIncludeTemporary(),
					totalIncludeSavingsAsExpense: this.totalIncludeSavingsAsExpense(),
					totalIncludeAmortizationAsExpense: this.totalIncludeAmortizationAsExpense(),
				})
			)
		})
	}

	// setters: Cost
	setCostView(v: CostView) {
		this.costView.set(v)
	}
	setCostIncludeTemporary(v: boolean) {
		this.costIncludeTemporary.set(v)
	}
	setCostIncludeSavingsAsExpense(v: boolean) {
		this.costIncludeSavingsAsExpense.set(v)
	}
	setCostIncludeAmortizationAsExpense(v: boolean) {
		this.costIncludeAmortizationAsExpense.set(v)
	}

	// setters: Total
	setTotalIncludeTemporary(v: boolean) {
		this.totalIncludeTemporary.set(v)
	}
	setTotalIncludeSavingsAsExpense(v: boolean) {
		this.totalIncludeSavingsAsExpense.set(v)
	}
	setTotalIncludeAmortizationAsExpense(v: boolean) {
		this.totalIncludeAmortizationAsExpense.set(v)
	}

	// helper
	isAmortization(cat: Category) {
		return cat === 'finance.loan_amortization'
	}
}
