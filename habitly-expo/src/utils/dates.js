export function getLast7Days() {
  const days = []
  const today = new Date()
  const dayNames  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push({
      iso:     d.toISOString().split('T')[0],
      dayName: dayNames[d.getDay()],
      dayNum:  d.getDate(),
      month:   monthNames[d.getMonth()],
      isToday: i === 0,
    })
  }
  return days
}

export function formatDate(isoString) {
  const d = new Date(isoString)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  return {
    full:    `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`,
    short:   `${d.getDate()} ${months[d.getMonth()]}`,
    dayName: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()],
    dayNum:  d.getDate(),
    month:   months[d.getMonth()],
  }
}
