// app/features/budget/budget.model.ts

// Grundtyper
export type PersonId = 'mikael' | 'jessica'
export type EntryType = 'cost' | 'income'
export type MoneyCents = number

// Kategorier
export enum Category {
	// Inkomster
	Income = 'income',
	IncomeSalary = 'income-salary',
	IncomeBenefits = 'income-benefits',
	IncomeOther = 'income-other',

	// Boende & drift
	Housing = 'housing',
	UtilitiesElectricity = 'utilities-electricity',
	UtilitiesWaterSewer = 'utilities-water-sewer',
	UtilitiesHeating = 'utilities-heating',
	HomeMaintenance = 'home-maintenance',
	FurnitureAppliances = 'furniture-appliances',

	// Mat & hushåll
	Food = 'food',
	DiningOut = 'dining-out',
	Household = 'household',

	// Transport
	VehicleFuel = 'vehicle-fuel',
	VehicleMaintenance = 'vehicle-maintenance',
	VehicleTaxTollsParking = 'vehicle-tax-tolls-parking',
	PublicTransport = 'public-transport',

	// Ekonomi
	Loans = 'loans',
	Insurance = 'insurance',
	Savings = 'savings',
	BankFees = 'bank-fees',

	// IT & abonnemang
	IT = 'it',
	Subscriptions = 'subscriptions',

	// Personligt & hälsa
	Clothing = 'clothing',
	Healthcare = 'healthcare',
	Pharmacy = 'pharmacy',
	Dental = 'dental',
	Beauty = 'beauty',
	SportsGym = 'sports-gym',

	// Barn & husdjur
	Children = 'children',
	Pets = 'pets',

	// Fritid & resor
	Entertainment = 'entertainment',
	Hobbies = 'hobbies',
	TravelHoliday = 'travel-holiday',
	GiftsCharity = 'gifts-charity',

	// Hem & trädgård
	GardenOutdoor = 'garden-outdoor',

	// Övrigt
	Other = 'other',
}

export const CATEGORY_LABEL: Record<Category, string> = {
	// Inkomster
	[Category.Income]: 'Inkomst',
	[Category.IncomeSalary]: 'Lön',
	[Category.IncomeBenefits]: 'Ersättningar',
	[Category.IncomeOther]: 'Övriga inkomster',

	// Boende & drift
	[Category.Housing]: 'Boende (fastighet, hyra, avgift)',
	[Category.UtilitiesElectricity]: 'El',
	[Category.UtilitiesWaterSewer]: 'Vatten & avlopp',
	[Category.UtilitiesHeating]: 'Uppvärmning',
	[Category.HomeMaintenance]: 'Husunderhåll',
	[Category.FurnitureAppliances]: 'Möbler & vitvaror',

	// Mat & hushåll
	[Category.Food]: 'Mat',
	[Category.DiningOut]: 'Uteätande',
	[Category.Household]: 'Hushåll',

	// Transport
	[Category.VehicleFuel]: 'Bränsle',
	[Category.VehicleMaintenance]: 'Bilservice',
	[Category.VehicleTaxTollsParking]: 'Skatt/Tullar/Parkering',
	[Category.PublicTransport]: 'Kollektivtrafik',

	// Ekonomi
	[Category.Loans]: 'Lån',
	[Category.Insurance]: 'Försäkringar',
	[Category.Savings]: 'Sparande',
	[Category.BankFees]: 'Bankavgifter',

	// IT & abonnemang
	[Category.IT]: 'IT',
	[Category.Subscriptions]: 'Abonnemang',

	// Personligt & hälsa
	[Category.Clothing]: 'Kläder',
	[Category.Healthcare]: 'Vård',
	[Category.Pharmacy]: 'Apotek',
	[Category.Dental]: 'Tandvård',
	[Category.Beauty]: 'Skönhet',
	[Category.SportsGym]: 'Träning',

	// Barn & husdjur
	[Category.Children]: 'Barn',
	[Category.Pets]: 'Husdjur',

	// Fritid & resor
	[Category.Entertainment]: 'Underhållning',
	[Category.Hobbies]: 'Hobby',
	[Category.TravelHoliday]: 'Resor',
	[Category.GiftsCharity]: 'Gåvor & välgörenhet',

	// Hem & trädgård
	[Category.GardenOutdoor]: 'Trädgård',

	// Övrigt
	[Category.Other]: 'Övrigt',
}

// Valbara listor
export const INCOME_CATEGORIES: Category[] = [
	Category.Income,
	Category.IncomeSalary,
	Category.IncomeBenefits,
	Category.IncomeOther,
]

export const EXPENSE_CATEGORIES: Category[] = [
	Category.Housing,
	Category.UtilitiesElectricity,
	Category.UtilitiesWaterSewer,
	Category.UtilitiesHeating,
	Category.HomeMaintenance,
	Category.FurnitureAppliances,
	Category.Food,
	Category.DiningOut,
	Category.Household,
	Category.VehicleFuel,
	Category.VehicleMaintenance,
	Category.VehicleTaxTollsParking,
	Category.PublicTransport,
	Category.Loans,
	Category.Insurance,
	Category.Savings,
	Category.BankFees,
	Category.IT,
	Category.Subscriptions,
	Category.Clothing,
	Category.Healthcare,
	Category.Pharmacy,
	Category.Dental,
	Category.Beauty,
	Category.SportsGym,
	Category.Children,
	Category.Pets,
	Category.Entertainment,
	Category.Hobbies,
	Category.TravelHoliday,
	Category.GiftsCharity,
	Category.GardenOutdoor,
	Category.Other,
]

// (valfritt) Grupper för snyggare select
export type CategoryGroup = { label: string; items: Category[] }

export const INCOME_CATEGORY_GROUPS: CategoryGroup[] = [{ label: 'Inkomster', items: INCOME_CATEGORIES }]

export const EXPENSE_CATEGORY_GROUPS: CategoryGroup[] = [
	{
		label: 'Boende & drift',
		items: [
			Category.Housing,
			Category.UtilitiesElectricity,
			Category.UtilitiesWaterSewer,
			Category.UtilitiesHeating,
			Category.HomeMaintenance,
			Category.FurnitureAppliances,
		],
	},
	{ label: 'Mat & hushåll', items: [Category.Food, Category.DiningOut, Category.Household] },
	{
		label: 'Transport',
		items: [
			Category.VehicleFuel,
			Category.VehicleMaintenance,
			Category.VehicleTaxTollsParking,
			Category.PublicTransport,
		],
	},
	{ label: 'Sparande', items: [Category.Savings] },
	{ label: 'Ekonomi', items: [Category.Loans, Category.Insurance, Category.BankFees] },
	{ label: 'IT & abonnemang', items: [Category.IT, Category.Subscriptions] },
	{
		label: 'Personligt & hälsa',
		items: [
			Category.Clothing,
			Category.Healthcare,
			Category.Pharmacy,
			Category.Dental,
			Category.Beauty,
			Category.SportsGym,
		],
	},
	{ label: 'Barn & husdjur', items: [Category.Children, Category.Pets] },
	{
		label: 'Fritid & resor',
		items: [Category.Entertainment, Category.Hobbies, Category.TravelHoliday, Category.GiftsCharity],
	},
	{ label: 'Hem & trädgård', items: [Category.GardenOutdoor] },
	{ label: 'Övrigt', items: [Category.Other] },
]

// Firestore-entry
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
