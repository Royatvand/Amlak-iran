// Shared helpers for listing display (site + admin)
const has = v => v !== null && v !== undefined && v !== ''

export const isClosed = p => p?.availability === 'closed'
export const closedLabel = p => (p?.deal_type === 'خرید' ? 'فروخته شد' : 'اجاره رفت')

export function amenityLabels(p) {
  const out = []
  if (has(p?.floor)) out.push(Number(p.floor) === 0 ? 'همکف' : 'طبقه ' + Number(p.floor).toLocaleString('fa-IR'))
  if (has(p?.building_age)) out.push(Number(p.building_age) === 0 ? 'نوساز' : Number(p.building_age).toLocaleString('fa-IR') + ' سال ساخت')
  if (p?.parking) out.push('پارکینگ')
  if (p?.elevator) out.push('آسانسور')
  if (p?.storage) out.push('انباری')
  return out
}

// Closed (sold / rented) listings go after available ones; newest first within each group.
export const sortHomes = (a, b) => Number(isClosed(a)) - Number(isClosed(b)) || (Number(b.id) || 0) - (Number(a.id) || 0)
