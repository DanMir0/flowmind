export function getDeadlineState(deadline) {
  if (!deadline) return 'none'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(deadline)
  due.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue'
  if (diffDays <= 3) return 'soon'

  return 'normal'
}
