// features/plants/domain/plants.keys.ts
import type { Sunlight, WaterNeed, Soil, SowingMethod, Amendment, Grade, Month1_12, Cultivation } from './plants.types'

/** 1–12 som literal-typer (praktiskt för validering/iteration) */
export const MONTHS_1_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const satisfies readonly Month1_12[]

/** Betygsskalan 1–5 */
export const GRADE_VALUES = [1, 2, 3, 4, 5] as const satisfies readonly Grade[]
export const MAX_GRADE = 5 as const satisfies Grade

/** Ljuskrav */
export const SUNLIGHT = ['shade', 'partial_shade', 'full_sun'] as const satisfies readonly Sunlight[]

/** Vattenbehov */
export const WATER_NEED = ['low', 'moderate', 'high'] as const satisfies readonly WaterNeed[]

/** Odlingssätt (kort) */
export const CULTIVATION = [
	'field',
	'greenhouse',
	'bed',
	'container',
	'indoor',
] as const satisfies readonly Cultivation[]

/** Jordtyper */
export const SOIL = [
	'seed',
	'planting',
	'garden',
	'bloom',
	'veg_herb',
	'tomato_chili',
	'ericaceous',
	'rose_perennial',
	'pelargon',
	'orchid',
	'citrus_mediterranean',
	'u_soil',
	'p_soil',
	'lawn_dress',
	'hydroponic',
] as const satisfies readonly Soil[]

/** Såmetoder */
export const SOWING = ['indoor', 'direct', 'hotbed', 'coldframe'] as const satisfies readonly SowingMethod[]

/** Jordtillsatser / “kompisar” */
export const AMENDMENTS = [
	'bark_mulch',
	'bark_mould',
	'leca',
	'biochar',
	'sand',
	'clay',
	'pumice',
	'peat',
	'peat_free',
] as const satisfies readonly Amendment[]

/** Förslag på växttyper (för autocomplete) */
// prettier-ignore
export const PLANT_TYPE_SUGGESTIONS = [
  // –– Grönsaker (frukt/blad/rot) ––
  'Tomat','Körsbärstomat','Chili','Paprika','Aubergine',
  'Gurka','Zucchini','Pumpa','Vintersquash','Spagettipumpa',
  'Melon','Vattenmelon','Majs',
  'Sallat','Spenat','Ruccola','Vintersallat (maché)','Pak choi','Mizuna','Tatsoi','Mangold',
  'Broccoli','Blomkål','Romanesco','Brysselkål','Grönkål','Svartkål','Vitkål','Rödkål','Savoykål','Kålrabbi',
  'Morot','Palsternacka','Rödbeta','Gulbeta','Kålrot','Rädisor','Rättika (daikon)',
  'Selleri (stjälk)','Rotselleri','Fänkål','Kronärtskocka','Sparris','Rabarber',
  'Potatis','Sötpotatis','Jordärtskocka','Pepparrot',
  'Lök (gul/röd)','Schalottenlök','Vitlök','Purjolök','Salladslök','Gräslök',
  'Ärta (socker/märg)','Brytböna','Vaxböna','Kokböna','Bondböna','Sojaböna (edamame)',
  'Tomatillo','Physalis','Okra',

  // –– Örter/kryddor ––
  'Basilika','Dill','Persilja','Koriander','Timjan','Rosmarin','Oregano','Mejram',
  'Dragon','Salvia','Mynta','Citronmeliss','Lagerblad','Kamomill','Lavendel',

  // –– Bär ––
  'Jordgubbe','Smultron','Hallon','Björnbär','Blåbär','Lingon',
  'Svarta vinbär','Röda vinbär','Vita vinbär','Krusbär','Aronia','Havtorn','Blåbärstry (haskap)','Tranbär',

  // –– Frukt ––
  'Äpple','Päron','Plommon','Körsbär','Persika','Aprikos','Nektarin','Kvitten',
  'Fikon','Vindruva','Kiwi','Banan',

  // –– Prydnad (lite bas) ––
  'Solros','Ringblomma','Tagetes','Blomsterärt','Vallmo','Dahlia',
  'Ros','Tulpan','Narciss','Krokus','Allium (prydnad)','Iris','Lilja','Pion','Rudbeckia (solhatt)','Funkia (hosta)',
] as const;
