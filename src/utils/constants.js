export const ROLES = {
  ADMIN: "admin",
  OPERATOR: "operator",
  PUBLIC: "public",
}

export const EQUIPMENT_TYPES = {
  CAMERA: "camera",
  SENSOR: "sensor",
  ALARM: "alarm",
  GATE: "gate",
  LIGHT: "light",
}

export const OBJECT_TYPES = {
  STRUCTURE: "structure",
  GATE: "gate",
  FENCE: "fence",
  VEHICLE: "vehicle",
  PERSON: "person",
}

export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  OPERATIONAL: "operational",
  OFFLINE: "offline",
  ONLINE: "online",
  RECORDING: "recording",
  PENDING: "pending",
  COMPLETED: "completed",
}

export const REPORT_TYPES = {
  SECURITY: "security",
  EQUIPMENT: "equipment",
  INCIDENT: "incident",
  MAINTENANCE: "maintenance",
}

export const API_ENDPOINTS = {
  AUTH: "/api/auth",
  ZONES: "/api/zones",
  OBJECTS: "/api/objects",
  EQUIPMENT: "/api/equipment",
  CAMERAS: "/api/cameras",
  REPORTS: "/api/reports",
  USERS: "/api/users",
}
