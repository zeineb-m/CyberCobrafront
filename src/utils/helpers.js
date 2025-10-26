export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatDateTime = (date) => {
  return `${formatDate(date)} ${formatTime(date)}`
}

export const getStatusColor = (status) => {
  const colors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    operational: "bg-green-100 text-green-800",
    offline: "bg-red-100 text-red-800",
    online: "bg-green-100 text-green-800",
    recording: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

export const getStatusBadgeClass = (status) => {
  const baseClass = "px-3 py-1 rounded-full text-sm font-medium"
  return `${baseClass} ${getStatusColor(status)}`
}

export const truncateText = (text, length = 50) => {
  if (text.length <= length) return text
  return `${text.substring(0, length)}...`
}

export const generateId = (prefix = "id") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return (...args) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
