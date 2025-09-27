// features/plants/domain/plants.labels.ts
import type { Sunlight, WaterNeed, Soil, SowingMethod, Env, Cultivation } from './plants.types'

/* =========================================================
 * Bas-interfaces för meta
 * =======================================================*/
export interface BasicMeta {
  label: string
  icon?: string          // Material Symbol
  short?: string         // 1–2 rader
  tip?: string           // tooltip
}

export interface LevelMeta extends BasicMeta {
  scale?: number         // 1..N för UI (pips/staplar)
}

/* =========================================================
 * Ljus (sol)
 * =======================================================*/
export const SUNLIGHT_META: Record<Sunlight, LevelMeta> = {
  shade:          { label: 'Skugga',      icon: 'filter_drama',      short: 'Skugga större delen av dagen.', scale: 1 },
  partial_shade:  { label: 'Halvskugga', icon: 'partly_cloudy_day', short: 'Sol/ljus några timmar.',        scale: 2 },
  full_sun:       { label: 'Full sol',    icon: 'sunny',             short: 'Sol större delen av dagen.',    scale: 3 },
} as const

export const SUNLIGHT_LABEL: Record<Sunlight, string> = {
  shade: SUNLIGHT_META.shade.label,
  partial_shade: SUNLIGHT_META.partial_shade.label,
  full_sun: SUNLIGHT_META.full_sun.label,
} as const

/* =========================================================
 * Odlingssätt (kort)
 * =======================================================*/
export const CULTIVATION_LABEL: Record<Cultivation, string> = {
  field:     'Friland',
  greenhouse:'Växthus',
  bed:       'Pallkrage',
  container: 'Kruka',
  indoor:    'Inomhus',
} as const

/* =========================================================
 * Vatten
 * =======================================================*/
export const WATER_META: Record<WaterNeed, LevelMeta> = {
  low:       { label: 'Lite vatten',      icon: 'water_drop',    short: 'Tål torrare perioder.',                  scale: 1 },
  moderate:  { label: 'Lagom med vatten', icon: 'humidity_mid',  short: 'Jämn fukt, låt ytan torka lätt.',        scale: 2 },
  high:      { label: 'Mycket vatten',    icon: 'humidity_high', short: 'Håll jämnt fuktigt - torkar snabbt ut.', scale: 3 },
} as const

export const WATER_LABEL: Record<WaterNeed, string> = {
  low: WATER_META.low.label,
  moderate: WATER_META.moderate.label,
  high: WATER_META.high.label,
} as const

/* =========================================================
 * Jord – etiketter
 * =======================================================*/
export const SOIL_LABEL: Record<Soil, string> = {
  seed: 'Såjord (S-jord)',
  planting: 'Planteringsjord',
  garden: 'Trädgårdsjord (bas/förbättring)',
  bloom: 'Blomjord',
  veg_herb: 'Grönsaks- & örtjord',
  tomato_chili: 'Tomat- & chilijord',
  ericaceous: 'Surjord (rhododendron m.fl.)',
  rose_perennial: 'Ros- & perennjord',
  pelargon: 'Pelargonjord',
  orchid: 'Orkidéjord',
  citrus_mediterranean: 'Citrus- & medelhavsjord',
  u_soil: 'U-jord (urna/kruka)',
  p_soil: 'P-jord (proffs)',
  lawn_dress: 'Dressjord (gräsmatta)',
  hydroponic: 'Hydroponisk odling',
} as const

/* =========================================================
 * Nivåtyper för jord-meta
 * (exporterade så de kan användas i annan kod)
 * =======================================================*/
export type Nutrient = 'low' | 'medium' | 'high' | 'very_high'
export type Drainage = 'low' | 'medium' | 'high'
export type PH = 'acid' | 'neutral' | 'wide'

/* === Meta-tabeller för nivåer === */
export const NUTRIENT_META: Record<Nutrient, LevelMeta> = {
  low:       { label: 'Låg näring',        icon: 'compost',       short: 'Magert – bra för frösådd & känsliga rötter.',  scale: 1 },
  medium:    { label: 'Måttlig näring',    icon: 'eco',           short: 'Basnivå för mycket prydnad & grönsaker.',      scale: 2 },
  high:      { label: 'Hög näring',        icon: 'local_florist', short: 'Krävande växter, aktiv tillväxt.',             scale: 3 },
  very_high: { label: 'Mycket hög näring', icon: 'spa',           short: 'Tungt näringskrävande (t.ex. tomat/chili).',   scale: 4 },
} as const
export const NUTRIENT_LABEL: Record<Nutrient, string> = {
  low: NUTRIENT_META.low.label,
  medium: NUTRIENT_META.medium.label,
  high: NUTRIENT_META.high.label,
  very_high: NUTRIENT_META.very_high.label,
} as const

export const DRAINAGE_META: Record<Drainage, LevelMeta> = {
  low:    { label: 'Låg dränering',     icon: 'water_drop', short: 'Håller vatten länge (risk för blöta rötter).', scale: 1 },
  medium: { label: 'Måttlig dränering', icon: 'water_drop', short: 'Balans mellan fukthållning & luft.',           scale: 2 },
  high:   { label: 'Hög dränering',     icon: 'water_drop', short: 'Rinner igenom snabbt (oftare vattning).',      scale: 3 },
} as const
export const DRAINAGE_LABEL: Record<Drainage, string> = {
  low: DRAINAGE_META.low.label,
  medium: DRAINAGE_META.medium.label,
  high: DRAINAGE_META.high.label,
} as const

export interface PhMeta extends BasicMeta { range?: string }
export const PH_META: Record<PH, PhMeta> = {
  acid:    { label: 'Sur jord',  icon: 'science', range: 'ca pH 4.5–6.0', short: 'Rhododendron, blåbär, azalea m.fl.' },
  neutral: { label: 'Neutral',   icon: 'science', range: 'ca pH 6.5–7.5', short: 'Fungerar för de flesta växter.' },
  wide:    { label: 'Brett pH',  icon: 'science', range: 'ca pH 5.5–7.5', short: 'Tolerant blandning med brett spann.' },
} as const
export const PH_LABEL: Record<PH, string> = {
  acid: PH_META.acid.label,
  neutral: PH_META.neutral.label,
  wide: PH_META.wide.label,
} as const

/* =========================================================
 * Jord – full meta
 * =======================================================*/
export interface SoilMeta {
  label: string
  nutrient: Nutrient
  drainage: Drainage
  ph: PH
  typicalUses?: readonly string[]
  tooltip?: string
}

export const SOIL_META: Record<Soil, SoilMeta> = {
  seed:                 { label: SOIL_LABEL.seed,                 nutrient: 'low',       drainage: 'high',   ph: 'neutral', typicalUses: ['Frösådd', 'Sticklingar', 'Förodling inomhus'], tooltip: 'Finkornig, näringsfattig jord som skyddar späda rötter.' },
  planting:             { label: SOIL_LABEL.planting,             nutrient: 'medium',    drainage: 'medium', ph: 'wide',    typicalUses: ['Pallkrage', 'Rabatter', 'Buskar & träd'] },
  garden:               { label: SOIL_LABEL.garden,               nutrient: 'medium',    drainage: 'medium', ph: 'wide',    typicalUses: ['Jordförbättring', 'Plantering i mark'] },
  bloom:                { label: SOIL_LABEL.bloom,                nutrient: 'high',      drainage: 'medium', ph: 'neutral', typicalUses: ['Blommande krukväxter'] },
  veg_herb:             { label: SOIL_LABEL.veg_herb,             nutrient: 'high',      drainage: 'medium', ph: 'neutral', typicalUses: ['Sallat', 'Örter', 'Rotfrukter'] },
  tomato_chili:         { label: SOIL_LABEL.tomato_chili,         nutrient: 'very_high', drainage: 'medium', ph: 'neutral', typicalUses: ['Tomat', 'Chili', 'Paprika'] },
  ericaceous:           { label: SOIL_LABEL.ericaceous,           nutrient: 'medium',    drainage: 'high',   ph: 'acid',    typicalUses: ['Rhododendron', 'Azalea', 'Blåbär', 'Ljung'] },
  rose_perennial:       { label: SOIL_LABEL.rose_perennial,       nutrient: 'high',      drainage: 'medium', ph: 'neutral', typicalUses: ['Rosor', 'Klematis', 'Perenner'] },
  pelargon:             { label: SOIL_LABEL.pelargon,             nutrient: 'high',      drainage: 'medium', ph: 'neutral', typicalUses: ['Pelargoner', 'Sommarblommor'] },
  orchid:               { label: SOIL_LABEL.orchid,               nutrient: 'low',       drainage: 'high',   ph: 'neutral', typicalUses: ['Orkidéer (epifyter)'] },
  citrus_mediterranean: { label: SOIL_LABEL.citrus_mediterranean, nutrient: 'high',      drainage: 'high',   ph: 'acid',    typicalUses: ['Citrus', 'Oliv', 'Fikon', 'Lager'] },
  u_soil:               { label: SOIL_LABEL.u_soil,               nutrient: 'very_high', drainage: 'medium', ph: 'neutral', typicalUses: ['Stora krukväxter', 'Hungriga ettåringar'] },
  p_soil:               { label: SOIL_LABEL.p_soil,               nutrient: 'very_high', drainage: 'medium', ph: 'neutral', typicalUses: ['Professionell odling'] },
  lawn_dress:           { label: SOIL_LABEL.lawn_dress,           nutrient: 'medium',    drainage: 'high',   ph: 'neutral', typicalUses: ['Gräsmatta (dressning, stödsådd)'] },
  hydroponic:           { label: SOIL_LABEL.hydroponic,           nutrient: 'low',       drainage: 'high',   ph: 'neutral', typicalUses: ['Hydroponisk odling'] },
} as const

/* =========================================================
 * Såmetoder
 * =======================================================*/
export const SOWING_LABEL = {
  indoor: 'Försådd',
  direct: 'Direktsådd',
  coldframe: 'Kallbänk / Växthus',
  hotbed: 'Varmbänk / Drivbänk',
} as const;

export interface SowingMeta extends BasicMeta {
  env: Env
}

export const SOWING_META: Record<SowingMethod, SowingMeta> = {
  indoor:    { label: SOWING_LABEL.indoor,    icon: 'home',                  env: 'indoors',            short: 'Så inomhus, plantera ut senare.', },
  direct:    { label: SOWING_LABEL.direct,    icon: 'yard',                  env: 'outdoors',           short: 'Så direkt på växtplatsen.',       },
  hotbed:    { label: SOWING_LABEL.hotbed,    icon: 'local_fire_department', env: 'outdoors_sheltered', short: 'Uppvärmd bädd för tidig start.',  },
  coldframe: { label: SOWING_LABEL.coldframe, icon: 'device_thermostat',     env: 'outdoors_sheltered', short: 'Kallbänk/växthus utan värme.',    },
} as const

/* =========================================================
 * Månadsnamn (svenska)
 * =======================================================*/
export const MONTH_LABEL_SV: Record<1|2|3|4|5|6|7|8|9|10|11|12, string> = {
  1:'Januari', 2:'Februari', 3:'Mars', 4:'April', 5:'Maj', 6:'Juni',
  7:'Juli', 8:'Augusti', 9:'September', 10:'Oktober', 11:'November', 12:'December',
} as const

export const MONTH_LABEL_SV_SHORT: Record<1|2|3|4|5|6|7|8|9|10|11|12, string> = {
  1:'Jan', 2:'Feb', 3:'Mar', 4:'Apr', 5:'Maj', 6:'Jun',
  7:'Jul', 8:'Aug', 9:'Sep', 10:'Okt', 11:'Nov', 12:'Dec',
} as const
