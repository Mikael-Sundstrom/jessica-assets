// budget.model.ts (ren & tydlig)
export type PersonId = 'mikael' | 'jessica'
export type EntryType = 'cost' | 'income'
export type MoneyCents = number

// 1) Toppgrupper (kompakt)
export type TopGroup = 'housing' | 'food' | 'transport' | 'savings' | 'finance' | 'family' | 'other' | 'income'

export const TOPGROUP_LABEL: Record<TopGroup, string> = {
	housing: 'Boende & drift',
	food: 'Mat & hushåll',
	transport: 'Transport',
	savings: 'Sparande',
	finance: 'Ekonomi & lån',
	family: 'Barn & husdjur',
	other: 'Övrigt',
	income: 'Inkomster',
}

// 2) Kategorier som dot-paths (group.sub)
export type Category =
	// Inkomster
	| 'income.general'
	| 'income.salary'
	| 'income.benefits'
	| 'income.other'

	// Boende & drift (inkl. hem & trädgård)
	| 'housing.housing_fee'
	| 'housing.electricity'
	| 'housing.water_sewer'
	| 'housing.heating'
	| 'housing.maintenance'
	| 'housing.furniture_appliances'
	| 'housing.garden_outdoor'
	| 'food.groceries'
	| 'food.dining_out'
	| 'food.restaurant'
	| 'food.household_supplies'
	// Transport
	| 'transport.fuel'
	| 'transport.maintenance'
	| 'transport.repairs'
	| 'transport.tax_tolls_parking'
	| 'transport.public_transport'
	// 💾 Sparande
	| 'savings.emergency'
	| 'savings.goals'
	| 'savings.pension'
	| 'savings.investments'
	// 💰 Ekonomi & lån
	| 'finance.loan_interest' // ränta
	| 'finance.loan_amortization' // amortering
	| 'finance.insurance' // försäkringar
	| 'finance.bank_fees' // bankavgifter
	// 👨‍👩‍👧‍👦 Barn & husdjur
	| 'family.children'
	| 'family.pets'
	// Övrigt
	| 'other.it'
	| 'other.subscriptions'
	| 'other.clothing'
	| 'other.healthcare'
	| 'other.pharmacy'
	| 'other.dental'
	| 'other.beauty'
	| 'other.sports_gym'
	| 'other.entertainment'
	| 'other.hobbies'
	| 'other.travel_holiday'
	| 'other.gifts_charity'
	| 'other.other'

// 3) Label för underkategorier
export const CATEGORY_LABEL: Record<Category, string> = {
	// income
	'income.general': 'Inkomst',
	'income.salary': 'Lön',
	'income.benefits': 'Ersättningar',
	'income.other': 'Övriga inkomster',

	// housing
	'housing.housing_fee': 'Boende (hyra/avgift/bolån)',
	'housing.electricity': 'El',
	'housing.water_sewer': 'Vatten & avlopp',
	'housing.heating': 'Uppvärmning',
	'housing.maintenance': 'Husunderhåll',
	'housing.furniture_appliances': 'Möbler & vitvaror',
	'housing.garden_outdoor': 'Trädgård',

	// food
	'food.groceries': 'Mat (hem)',
	'food.dining_out': 'Uteätande',
	'food.restaurant': 'Restaurang',
	'food.household_supplies': 'Hushåll',

	// transport
	'transport.fuel': 'Bränsle',
	'transport.maintenance': 'Bilservice',
	'transport.repairs': 'Reparationer',
	'transport.tax_tolls_parking': 'Skatt/Tullar/Parkering',
	'transport.public_transport': 'Kollektivtrafik',

	// finance
	'finance.loan_interest': 'Ränta',
	'finance.loan_amortization': 'Amortering',
	'finance.insurance': 'Försäkringar',
	'finance.bank_fees': 'Bankavgifter',

	// family
	'family.children': 'Barn',
	'family.pets': 'Husdjur',

	// savings
	'savings.emergency': 'Buffert',
	'savings.goals': 'Sparmål',
	'savings.pension': 'Pensionsspar',
	'savings.investments': 'Investeringar',

	// other
	'other.it': 'IT',
	'other.subscriptions': 'Abonnemang',
	'other.clothing': 'Kläder',
	'other.healthcare': 'Vård',
	'other.pharmacy': 'Apotek',
	'other.dental': 'Tandvård',
	'other.beauty': 'Skönhet',
	'other.sports_gym': 'Träning',
	'other.entertainment': 'Underhållning',
	'other.hobbies': 'Hobby',
	'other.travel_holiday': 'Resor',
	'other.gifts_charity': 'Gåvor & välgörenhet',
	'other.other': 'Övrigt',
}

// 4) Hjälpare
export const INCOME_CATEGORIES = Object.keys(CATEGORY_LABEL).filter(k => k.startsWith('income.')) as Category[]

export const EXPENSE_CATEGORIES = Object.keys(CATEGORY_LABEL).filter(k => !k.startsWith('income.')) as Category[]

// TopGroup-derivering utan extra map
export const topGroupOf = (cat: Category): TopGroup => cat.split('.')[0] as TopGroup

// 5) Datamodeller
export interface HouseholdEntry {
	id?: string
	type: EntryType
	title: string
	amount: MoneyCents
	person: PersonId
	category: Category
	temporary?: boolean
	sort?: number
	createdAt?: Date
}

// Tabell-row (viewmodell)
export interface CostRow {
	title: string
	idMikael?: string
	idJessica?: string
	mikaelAmount: MoneyCents
	jessicaAmount: MoneyCents
	category?: Category
	temporary?: boolean
	sort?: number
}
export interface IncomeRow {
	title: string
	idMikael?: string
	idJessica?: string
	mikaelAmount: number
	jessicaAmount: number
	category?: Category
	temporary?: boolean
	sort?: number
}

// Dialogtyper
export interface DialogResult {
	name: string
	perUser: Partial<Record<PersonId, MoneyCents>>
	category: Category
	uidMikael: 'mikael'
	uidJessica: 'jessica'
	temporary?: boolean
	mode: EntryType
}

export type DialogClosed = DialogResult | { delete: true; id?: string }
