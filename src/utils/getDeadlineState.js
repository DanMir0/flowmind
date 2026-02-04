export function getDeadlineState(deadline) {
  if (!deadline) return {
    state: 'none',
    label: null,
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(deadline)
  due.setHours(0, 0, 0, 0)

  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      state: 'overdue',
      label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`
    }
  }
  if (diffDays === 0) {
    return {
      state: 'soon',
      label: 'Due today',
    }
  }

  if (diffDays <= 3) {
    return {
      state: 'soon',
      label: `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`,
    }
  }

  return {
    state: 'normal',
    label: null,
  }
}
