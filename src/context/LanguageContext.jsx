"use client"

import { createContext, useContext, useState, useEffect } from "react"

const LanguageContext = createContext()

const translations = {
  en: {
    // Navigation
    features: "Features",
    pricing: "Pricing",
    signIn: "Sign In",
    getStarted: "Get Started",
    
    // Home Page
    trustedBy: "Trusted by 50+ Government Agencies",
    heroTitle: "Next-Gen Cybersecurity",
    heroSubtitle: "for Government",
    heroDescription: "Advanced threat detection, real-time zone management, and comprehensive security monitoring for critical infrastructure",
    startFreeTrial: "Start Free Trial",
    viewDemo: "View Demo",
    
    // Stats
    uptime: "Uptime",
    eventsDay: "Events/Day",
    support: "Support",
    agencies: "Agencies",
    
    // Features Section
    enterpriseSecurity: "Enterprise-Grade Security",
    comprehensiveTools: "Comprehensive tools designed for government and critical infrastructure protection",
    
    zoneManagement: "Zone Management",
    zoneDesc: "Real-time monitoring and control of sensitive areas with automated alerts and comprehensive audit trails",
    
    cameraNetwork: "Camera Network",
    cameraDesc: "Integrated surveillance with AI-powered threat detection and live feed management",
    
    advancedAnalytics: "Advanced Analytics",
    analyticsDesc: "Deep insights with customizable reports, statistical analysis, and predictive modeling",
    
    equipmentTracking: "Equipment Tracking",
    equipmentDesc: "Complete lifecycle management of security equipment with automated maintenance scheduling",
    
    userManagement: "User Management",
    userDesc: "Granular role-based access control with multi-factor authentication and session management",
    
    securityFirst: "Security First",
    securityDesc: "Military-grade encryption, zero-trust architecture, and compliance with international standards",
    
    // CTA
    readyToSecure: "Ready to",
    secureText: "Secure",
    yourInfrastructure: "Your Infrastructure?",
    joinAgencies: "Join government agencies worldwide using CyberCobra for advanced security monitoring and threat prevention",
    
    // Footer
    allRights: "Ministry of Interior. All rights reserved.",
    
    // Dashboard
    welcomeBack: "Welcome back,",
    securityOverview: "Here's your security overview for today",
    activeZones: "Active Zones",
    camerasOnline: "Cameras Online",
    equipmentStatus: "Equipment Status",
    pendingReports: "Pending Reports",
    fromLastMonth: "from last month",
    
    zoneActivity: "Zone Activity",
    systemPerformance: "System Performance",
    last30Days: "Last 30 days",
    realtimeMonitoring: "Real-time monitoring",
    recentActivity: "Recent Activity",
    viewAll: "View All",
    
    // Admin Pages
    userManagementTitle: "User Management",
    manageUsers: "Manage system users and permissions",
    addUser: "Add User",
    searchUsers: "Search users by name or email...",
    
    name: "Name",
    email: "Email",
    role: "Role",
    status: "Status",
    lastLogin: "Last Login",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    
    addNewUser: "Add New User",
    editUser: "Edit User",
    fullName: "Full Name",
    emailAddress: "Email Address",
    publicUser: "Public User",
    securityOperator: "Security Operator",
    systemAdministrator: "System Administrator",
    updateUser: "Update User",
    cancel: "Cancel",
    
    zonesTitle: "Zones Sensibles",
    monitorZones: "Monitor and manage sensitive zones",
    addZone: "Add Zone",
    searchZones: "Search zones...",
    
    addNewZone: "Add New Zone",
    editZone: "Edit Zone",
    zoneName: "Zone Name",
    description: "Description",
    active: "Active",
    inactive: "Inactive",
    updateZone: "Update Zone",
    
    // Auth
    welcomeBackAuth: "Welcome Back",
    signInToPlatform: "Sign in to CyberCobra Platform",
    password: "Password",
    signingIn: "Signing in...",
    demoAccounts: "Demo Accounts",
    fullAccess: "Full system access",
    zoneEquipment: "Zone & equipment management",
    viewOnly: "View-only access",
    dontHaveAccount: "Don't have an account?",
    createAccount: "Create Account",
    sslEncrypted: "Secured with 256-bit SSL encryption",
    
    // Register
    createAccountTitle: "Create Account",
    joinPlatform: "Join CyberCobra Platform",
    organization: "Organization",
    confirmPassword: "Confirm Password",
    agreeToTerms: "I agree to the",
    termsOfService: "Terms of Service",
    and: "and",
    privacyPolicy: "Privacy Policy",
    creatingAccount: "Creating Account...",
    alreadyHaveAccount: "Already have an account?",
  },
  
  ar: {
    // Navigation
    features: "المميزات",
    pricing: "الأسعار",
    signIn: "تسجيل الدخول",
    getStarted: "ابدأ الآن",
    
    // Home Page
    trustedBy: "موثوق به من قبل أكثر من 50 وكالة حكومية",
    heroTitle: "الأمن السيبراني من الجيل التالي",
    heroSubtitle: "للحكومة",
    heroDescription: "كشف التهديدات المتقدم، إدارة المناطق في الوقت الفعلي، ومراقبة أمنية شاملة للبنية التحتية الحيوية",
    startFreeTrial: "ابدأ تجربة مجانية",
    viewDemo: "عرض تجريبي",
    
    // Stats
    uptime: "وقت التشغيل",
    eventsDay: "حدث/يوم",
    support: "الدعم",
    agencies: "وكالة",
    
    // Features Section
    enterpriseSecurity: "أمان على مستوى المؤسسات",
    comprehensiveTools: "أدوات شاملة مصممة لحماية الحكومة والبنية التحتية الحيوية",
    
    zoneManagement: "إدارة المناطق",
    zoneDesc: "مراقبة وتحكم في الوقت الفعلي للمناطق الحساسة مع تنبيهات تلقائية وسجلات تدقيق شاملة",
    
    cameraNetwork: "شبكة الكاميرات",
    cameraDesc: "مراقبة متكاملة مع كشف التهديدات بالذكاء الاصطناعي وإدارة البث المباشر",
    
    advancedAnalytics: "تحليلات متقدمة",
    analyticsDesc: "رؤى عميقة مع تقارير قابلة للتخصيص وتحليل إحصائي ونمذجة تنبؤية",
    
    equipmentTracking: "تتبع المعدات",
    equipmentDesc: "إدارة دورة الحياة الكاملة لمعدات الأمان مع جدولة الصيانة التلقائية",
    
    userManagement: "إدارة المستخدمين",
    userDesc: "التحكم الدقيق في الوصول القائم على الأدوار مع المصادقة متعددة العوامل وإدارة الجلسات",
    
    securityFirst: "الأمان أولاً",
    securityDesc: "تشفير عسكري، بنية عدم الثقة، والامتثال للمعايير الدولية",
    
    // CTA
    readyToSecure: "هل أنت مستعد",
    secureText: "لتأمين",
    yourInfrastructure: "بنيتك التحتية؟",
    joinAgencies: "انضم إلى الوكالات الحكومية في جميع أنحاء العالم باستخدام CyberCobra للمراقبة الأمنية المتقدمة ومنع التهديدات",
    
    // Footer
    allRights: "وزارة الداخلية. جميع الحقوق محفوظة.",
    
    // Dashboard
    welcomeBack: "مرحباً بعودتك،",
    securityOverview: "إليك نظرة عامة على الأمان لليوم",
    activeZones: "المناطق النشطة",
    camerasOnline: "الكاميرات المتصلة",
    equipmentStatus: "حالة المعدات",
    pendingReports: "التقارير المعلقة",
    fromLastMonth: "من الشهر الماضي",
    
    zoneActivity: "نشاط المنطقة",
    systemPerformance: "أداء النظام",
    last30Days: "آخر 30 يوماً",
    realtimeMonitoring: "المراقبة في الوقت الفعلي",
    recentActivity: "النشاط الأخير",
    viewAll: "عرض الكل",
    
    // Admin Pages
    userManagementTitle: "إدارة المستخدمين",
    manageUsers: "إدارة مستخدمي النظام والصلاحيات",
    addUser: "إضافة مستخدم",
    searchUsers: "البحث عن المستخدمين بالاسم أو البريد الإلكتروني...",
    
    name: "الاسم",
    email: "البريد الإلكتروني",
    role: "الدور",
    status: "الحالة",
    lastLogin: "آخر تسجيل دخول",
    actions: "الإجراءات",
    edit: "تعديل",
    delete: "حذف",
    
    addNewUser: "إضافة مستخدم جديد",
    editUser: "تعديل المستخدم",
    fullName: "الاسم الكامل",
    emailAddress: "عنوان البريد الإلكتروني",
    publicUser: "مستخدم عام",
    securityOperator: "مشغل أمني",
    systemAdministrator: "مدير النظام",
    updateUser: "تحديث المستخدم",
    cancel: "إلغاء",
    
    zonesTitle: "المناطق الحساسة",
    monitorZones: "مراقبة وإدارة المناطق الحساسة",
    addZone: "إضافة منطقة",
    searchZones: "البحث عن المناطق...",
    
    addNewZone: "إضافة منطقة جديدة",
    editZone: "تعديل المنطقة",
    zoneName: "اسم المنطقة",
    description: "الوصف",
    active: "نشط",
    inactive: "غير نشط",
    updateZone: "تحديث المنطقة",
    
    // Auth
    welcomeBackAuth: "مرحباً بعودتك",
    signInToPlatform: "تسجيل الدخول إلى منصة CyberCobra",
    password: "كلمة المرور",
    signingIn: "جاري تسجيل الدخول...",
    demoAccounts: "حسابات تجريبية",
    fullAccess: "وصول كامل للنظام",
    zoneEquipment: "إدارة المناطق والمعدات",
    viewOnly: "عرض فقط",
    dontHaveAccount: "ليس لديك حساب؟",
    createAccount: "إنشاء حساب",
    sslEncrypted: "محمي بتشفير SSL 256 بت",
    
    // Register
    createAccountTitle: "إنشاء حساب",
    joinPlatform: "انضم إلى منصة CyberCobra",
    organization: "المنظمة",
    confirmPassword: "تأكيد كلمة المرور",
    agreeToTerms: "أوافق على",
    termsOfService: "شروط الخدمة",
    and: "و",
    privacyPolicy: "سياسة الخصوصية",
    creatingAccount: "جاري إنشاء الحساب...",
    alreadyHaveAccount: "هل لديك حساب بالفعل؟",
  },
  
  fr: {
    // Navigation
    features: "Fonctionnalités",
    pricing: "Tarifs",
    signIn: "Se connecter",
    getStarted: "Commencer",
    
    // Home Page
    trustedBy: "Approuvé par plus de 50 agences gouvernementales",
    heroTitle: "Cybersécurité de Nouvelle Génération",
    heroSubtitle: "pour le Gouvernement",
    heroDescription: "Détection avancée des menaces, gestion des zones en temps réel et surveillance de sécurité complète pour les infrastructures critiques",
    startFreeTrial: "Commencer l'essai gratuit",
    viewDemo: "Voir la démo",
    
    // Stats
    uptime: "Disponibilité",
    eventsDay: "Événements/Jour",
    support: "Support",
    agencies: "Agences",
    
    // Features Section
    enterpriseSecurity: "Sécurité de Niveau Entreprise",
    comprehensiveTools: "Outils complets conçus pour la protection gouvernementale et des infrastructures critiques",
    
    zoneManagement: "Gestion des Zones",
    zoneDesc: "Surveillance et contrôle en temps réel des zones sensibles avec alertes automatisées et pistes d'audit complètes",
    
    cameraNetwork: "Réseau de Caméras",
    cameraDesc: "Surveillance intégrée avec détection des menaces par IA et gestion des flux en direct",
    
    advancedAnalytics: "Analyses Avancées",
    analyticsDesc: "Insights approfondis avec rapports personnalisables, analyse statistique et modélisation prédictive",
    
    equipmentTracking: "Suivi des Équipements",
    equipmentDesc: "Gestion complète du cycle de vie des équipements de sécurité avec planification automatique de la maintenance",
    
    userManagement: "Gestion des Utilisateurs",
    userDesc: "Contrôle d'accès granulaire basé sur les rôles avec authentification multi-facteurs et gestion des sessions",
    
    securityFirst: "Sécurité d'Abord",
    securityDesc: "Cryptage de niveau militaire, architecture zéro-trust et conformité aux normes internationales",
    
    // CTA
    readyToSecure: "Prêt à",
    secureText: "Sécuriser",
    yourInfrastructure: "Votre Infrastructure?",
    joinAgencies: "Rejoignez les agences gouvernementales du monde entier utilisant CyberCobra pour la surveillance de sécurité avancée et la prévention des menaces",
    
    // Footer
    allRights: "Ministère de l'Intérieur. Tous droits réservés.",
    
    // Dashboard
    welcomeBack: "Bon retour,",
    securityOverview: "Voici votre aperçu de sécurité pour aujourd'hui",
    activeZones: "Zones Actives",
    camerasOnline: "Caméras En Ligne",
    equipmentStatus: "État des Équipements",
    pendingReports: "Rapports En Attente",
    fromLastMonth: "du mois dernier",
    
    zoneActivity: "Activité des Zones",
    systemPerformance: "Performance du Système",
    last30Days: "30 derniers jours",
    realtimeMonitoring: "Surveillance en temps réel",
    recentActivity: "Activité Récente",
    viewAll: "Voir Tout",
    
    // Admin Pages
    userManagementTitle: "Gestion des Utilisateurs",
    manageUsers: "Gérer les utilisateurs et les permissions du système",
    addUser: "Ajouter un Utilisateur",
    searchUsers: "Rechercher des utilisateurs par nom ou e-mail...",
    
    name: "Nom",
    email: "E-mail",
    role: "Rôle",
    status: "Statut",
    lastLogin: "Dernière Connexion",
    actions: "Actions",
    edit: "Modifier",
    delete: "Supprimer",
    
    addNewUser: "Ajouter un Nouvel Utilisateur",
    editUser: "Modifier l'Utilisateur",
    fullName: "Nom Complet",
    emailAddress: "Adresse E-mail",
    publicUser: "Utilisateur Public",
    securityOperator: "Opérateur de Sécurité",
    systemAdministrator: "Administrateur Système",
    updateUser: "Mettre à Jour l'Utilisateur",
    cancel: "Annuler",
    
    zonesTitle: "Zones Sensibles",
    monitorZones: "Surveiller et gérer les zones sensibles",
    addZone: "Ajouter une Zone",
    searchZones: "Rechercher des zones...",
    
    addNewZone: "Ajouter une Nouvelle Zone",
    editZone: "Modifier la Zone",
    zoneName: "Nom de la Zone",
    description: "Description",
    active: "Actif",
    inactive: "Inactif",
    updateZone: "Mettre à Jour la Zone",
    
    // Auth
    welcomeBackAuth: "Bon Retour",
    signInToPlatform: "Connectez-vous à la plateforme CyberCobra",
    password: "Mot de passe",
    signingIn: "Connexion en cours...",
    demoAccounts: "Comptes de Démonstration",
    fullAccess: "Accès complet au système",
    zoneEquipment: "Gestion des zones et équipements",
    viewOnly: "Accès en lecture seule",
    dontHaveAccount: "Vous n'avez pas de compte?",
    createAccount: "Créer un Compte",
    sslEncrypted: "Sécurisé avec un cryptage SSL 256 bits",
    
    // Register
    createAccountTitle: "Créer un Compte",
    joinPlatform: "Rejoignez la plateforme CyberCobra",
    organization: "Organisation",
    confirmPassword: "Confirmer le Mot de Passe",
    agreeToTerms: "J'accepte les",
    termsOfService: "Conditions d'utilisation",
    and: "et",
    privacyPolicy: "Politique de confidentialité",
    creatingAccount: "Création du compte...",
    alreadyHaveAccount: "Vous avez déjà un compte?",
  },
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("language")
    if (stored && ["en", "ar", "fr"].includes(stored)) {
      setLanguage(stored)
      if (stored === "ar") {
        document.documentElement.dir = "rtl"
      } else {
        document.documentElement.dir = "ltr"
      }
    }
  }, [])

  const changeLanguage = (lang) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
    if (lang === "ar") {
      document.documentElement.dir = "rtl"
    } else {
      document.documentElement.dir = "ltr"
    }
  }

  const t = (key) => {
    return translations[language][key] || key
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, mounted }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
