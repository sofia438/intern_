export type Dictionary = {
  nav: {
    tagline: string;
    dashboard: string;
    visitorIntelligence: string;
    leadFinder: string;
    imageSearch: string;
    tradeDatabases: string;
    contactFinder: string;
    emailCampaigns: string;
    reports: string;
    billing: string;
    admin: string;
    settings: string;
    generateLeads: string;
    helpCenter: string;
    contactSupport: string;
  };
  header: {
    searchPlaceholder: string;
    marketplace: string;
    documentation: string;
    enterprisePlan: string;
    logout: string;
  };
  dashboardPage: {
    title: string;
    subtitle: string;
    last30Days: string;
    exportReport: string;
    totalLeadsFound: string;
    newLeadsToday: string;
    emailsSent: string;
    countriesReached: string;
    activeCampaigns: string;
    globalLeadDistribution: string;
    globalLeadDistributionSubtitle: string;
    leadsByIndustry: string;
    leadsByIndustrySubtitle: string;
    viewAllIndustries: string;
    recentActivity: string;
    monthlyGrowth: string;
    monthlyGrowthSubtitle: string;
    performanceOverview: string;
    performanceOverviewSubtitle: string;
  };
  simplePages: Record<
    "image" | "trade" | "contact" | "email" | "templates" | "builder" | "sequences" | "reports" | "admin" | "settings",
    { title: string; subtitle: string }
  >;
  settings: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    noMatch: string;
    tabs: {
      profile: string;
      chatbot: string;
      usage: string;
      languages: string;
    };
  };
  languagePicker: {
    heading: string;
    subtitle: string;
    searchPlaceholder: string;
    comingSoon: string;
  };
  common: {
    unknown: string;
    save: string;
    saving: string;
    cancel: string;
    edit: string;
    delete: string;
    adding: string;
    yes: string;
    no: string;
    exportExcel: string;
    noPriorPeriod: string;
    vsPriorPeriod: string;
    filters: { label: string; empty: string; remove: string; addPlaceholder: string; reset: string; apply: string };
    range: { "1d": string; "7d": string; "30d": string; "90d": string };
    status: {
      searchJob: { PENDING: string; RUNNING: string; COMPLETED: string; FAILED: string };
      campaign: { DRAFT: string; SENDING: string; COMPLETED: string; FAILED: string };
      recipient: { PENDING: string; SENDING: string; SENT: string; FAILED: string; UNSUBSCRIBED: string };
      invoice: { PAID: string };
    };
  };
  visitorPage: {
    title: string;
    subtitle: string;
    exportData: string;
    visitorsToday: string;
    last24Hours: string;
    identifiedCompanies: string;
    withKnownOrg: string;
    countries: string;
    globalReach: string;
    returnVisitors: string;
    visitedMoreThanOnce: string;
    tableCompany: string;
    tableCountry: string;
    tableCity: string;
    tableDevice: string;
    tableLastVisit: string;
    tableVisits: string;
    emptyState: string;
    today: string;
    yesterday: string;
  };
  geoDistribution: {
    title: string;
    visitorsAcrossCountries: string;
    refreshing: string;
    emptyTitle: string;
    emptySubtitle: string;
    countriesTab: string;
    citiesTab: string;
    visitorsTooltip: string;
    shareTooltip: string;
    noVisitsTooltip: string;
    fewerVisitors: string;
    moreVisitors: string;
    noDataForView: string;
    other: string;
    range: {
      "24h": string;
      "7d": string;
      "30d": string;
      "90d": string;
      all: string;
    };
  };
  leadFinderPage: {
    title: string;
    subtitle: string;
    recentSearches: string;
    noSearchesInRange: string;
    maps: string;
    website: string;
    resultsCount: string;
  };
  leadFinderTabs: {
    websiteSearch: string;
    mapsSearch: string;
  };
  leadFinderForm: {
    selectCountries: string;
    countrySelected: string;
    countriesSelected: string;
    searchCountriesPlaceholder: string;
    noCountriesMatch: string;
    defineYourProduct: string;
    savedProduct: string;
    customNewProduct: string;
    productName: string;
    productNamePlaceholder: string;
    oemNumber: string;
    oemNumberPlaceholder: string;
    hsCode: string;
    hsCodePlaceholder: string;
    targetIndustry: string;
    targetIndustryPlaceholder: string;
    productImage: string;
    usingSavedImage: string;
    uploadDifferentImage: string;
    importYourImage: string;
    dragOrClickToUpload: string;
    identifyingImage: string;
    detectedProduct: string;
    category: string;
    partNumber: string;
    brand: string;
    notDetected: string;
    imageAnalyzeError: string;
    competitorBrands: string;
    competitorBrandsPlaceholder: string;
    removeBrand: string;
    potentialCustomerWebsites: string;
    potentialCustomerWebsitesPlaceholder: string;
    removePotentialCustomerWebsite: string;
    relatedIndustries: string;
    suggestWithAi: string;
    thinking: string;
    suggestError: string;
    searchEngine: string;
    selectedCount: string;
    noneSelected: string;
    google: string;
    bing: string;
    yandex: string;
    starting: string;
    startSearch: string;
    targetCountries: string;
  };
  leadFinderResults: {
    filterCountry: string;
    filterHasEmail: string;
    filterEmailType: string;
    filterHasPhone: string;
    filterHasWebsite: string;
    filterHasContact: string;
    companyEmailOnly: string;
    personalEmail: string;
    companiesFound: string;
    companiesFoundOf: string;
    searchCompaniesPlaceholder: string;
    noMatch: string;
    tableCompany: string;
    tableWebsite: string;
    tableContact: string;
    tableTitle: string;
    tableRecommendedEmail: string;
    tableConfidence: string;
    tableCountry: string;
    tableEmail: string;
    tablePhone: string;
    tableScore: string;
    tableWebsiteType: string;
    tableMatchReason: string;
    websiteTypeAll: string;
    websiteTypeCompany: string;
    websiteTypeEcommerce: string;
  };
  leadFinderResultsPoll: {
    stillRunning: string;
  };
  leadFinderResultsPage: {
    findContacts: string;
    findingContacts: string;
    searchFailed: string;
    unknownError: string;
    searching: string;
    noResultsFound: string;
  };
  mapsSearchForm: {
    findBusinesses: string;
    countries: string;
    selectedCount: string;
    selectCountries: string;
    searchCountriesPlaceholder: string;
    noCountriesMatch: string;
    removeCountry: string;
    cityPerCountry: string;
    cityOptional: string;
    keywords: string;
    keywordsPlaceholder: string;
    industry: string;
    industryPlaceholder: string;
    starting: string;
    searchMaps: string;
  };
  mapsResults: {
    filterHasEmail: string;
    filterHasWebsite: string;
    filterHasPhone: string;
    filterMinRating: string;
    filterCategory: string;
    starsSuffix: string;
    noCategoriesInResults: string;
    businessesFound: string;
    businessesFoundOf: string;
    searchBusinessesPlaceholder: string;
    noMatch: string;
    tableCompany: string;
    tableCategory: string;
    tablePhone: string;
    tableEmail: string;
    tableOpeningHours: string;
    tableAddress: string;
    tableCountry: string;
    tableRating: string;
    website: string;
  };
  contactFinder: {
    title: string;
    subtitle: string;
    startTitle: string;
    emptyState: string;
    companiesFound: string;
    contactsFound: string;
    findingContacts: string;
    viewResults: string;
    findContacts: string;
  };
  emailCampaignsPage: {
    title: string;
    subtitle: string;
    startNewCampaign: string;
    emptyState: string;
    companiesFound: string;
    buildCampaign: string;
    pastCampaigns: string;
    noCampaignsInRange: string;
    recipientsCount: string;
  };
  newCampaignForm: {
    composeEmail: string;
    fromName: string;
    fromNamePlaceholder: string;
    fromEmail: string;
    fromEmailPlaceholder: string;
    fromEmailHelp: string;
    subject: string;
    subjectPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    messageHelp: string;
    attachment: string;
    sendRate: string;
    creating: string;
    reviewCampaign: string;
    recipients: string;
    noUsableEmails: string;
  };
  newCampaignPage: {
    title: string;
  };
  campaignDetailPage: {
    recipientsTitle: string;
    recipientsCount: string;
    startSending: string;
    exportReport: string;
    campaignFailed: string;
    sendingProgress: string;
    tableCompany: string;
    tableEmail: string;
    tableSentTime: string;
    tableStatus: string;
  };
  reportsPage: {
    title: string;
    subtitle: string;
    leadPerformance: string;
    visitorIntelligence: string;
    emailPerformance: string;
    chatbotPerformance: string;
    searchPerformance: string;
    planUsage: string;
    performanceOverview: string;
    totalLeads: string;
    websiteVisitors: string;
    identifiedCompanies: string;
    countriesReached: string;
    emailsSent: string;
    activeCampaigns: string;
    conversations: string;
    qualifiedLeads: string;
    fallbackRate: string;
    conversionRate: string;
    totalSearches: string;
    totalResults: string;
    completed: string;
    failed: string;
    thisPeriod: string;
    ofVisitorMessages: string;
    qualifiedLeadsOverConversations: string;
    websiteAndMapsSearches: string;
    avgPerSearch: string;
    searchesLabel: string;
    leadGenerationTrend: string;
    leadsByCountry: string;
    leadsBySearchType: string;
    websiteVisitorTrend: string;
    topCountries: string;
    returnVisitorAnalysis: string;
    campaignPerformance: string;
    emailStatus: string;
    emailsSentTrend: string;
    searchTrend: string;
    searchResultsByType: string;
    noSearchesForPeriod: string;
    noVisitorLocationsYet: string;
    noVisitorsForPeriod: string;
    noEmailActivityForPeriod: string;
    tableCountry: string;
    tableVisitors: string;
    tableShare: string;
    returning: string;
    newLabel: string;
    sent: string;
    unsubscribed: string;
    currentPlan: string;
    noActivePlan: string;
    monthlyUsage: string;
    usageSearches: string;
    usageLeads: string;
    usageEmails: string;
    usageChatbot: string;
    scoreDisclaimer: string;
    scoreOutOf100: string;
    scoreFootnote: string;
  };
  reportsFilterBar: {
    range: { today: string; "7d": string; "30d": string; "90d": string; this_month: string; last_month: string; all: string };
    exportReport: string;
    allCountries: string;
    allSearchTypes: string;
    websiteSearch: string;
    mapsSearch: string;
    allCampaigns: string;
    allProducts: string;
    leadSourceChatbot: string;
    leadSourceChatbotTitle: string;
    clearFilters: string;
  };
  reportsCharts: {
    noDataForPeriod: string;
    limitReached: string;
    critical: string;
    warning: string;
    normal: string;
    notIncluded: string;
  };
  billingPage: {
    title: string;
    subtitleNoSub: string;
    subtitleSubscribed: string;
    currentPlanSummary: string;
    changePlan: string;
    planName: string;
    billingCycle: string;
    monthly: string;
    planCost: string;
    status: string;
    active: string;
    canceled: string;
    nextBillingDate: string;
    paymentMethod: string;
    expires: string;
    change: string;
    noPaymentMethod: string;
    invoices: string;
    billingHistory: string;
    tableInvoiceId: string;
    tableBillingDate: string;
    tablePlan: string;
    tableAmount: string;
    tableStatus: string;
    noInvoicesYet: string;
    download: string;
  };
  billingPlansPage: {
    title: string;
    subtitle: string;
  };
  billingCheckoutPage: {
    title: string;
    subtitle: string;
    planSuffix: string;
    perMonth: string;
    subtotal: string;
    taxVat: string;
    taxCalculated: string;
    totalToday: string;
  };
  billingSuccessPage: {
    title: string;
    subtitle: string;
    plan: string;
    billing: string;
    nextBillingDate: string;
    goToBilling: string;
  };
  planCards: {
    mostPopular: string;
    perMonth: string;
    currentPlan: string;
    choosePlan: string;
  };
  checkoutForm: {
    testModeTitle: string;
    testModeBody: string;
    billingInformation: string;
    fullName: string;
    country: string;
    address: string;
    city: string;
    postalCode: string;
    taxId: string;
    billingEmail: string;
    paymentMethod: string;
    creditDebitCard: string;
    cardNumber: string;
    cardholderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
    agreeTerms: string;
    processing: string;
    payNow: string;
  };
  cancelSubscriptionButton: {
    cancelSubscription: string;
    confirmHeading: string;
    confirmBody: string;
    keepSubscription: string;
    canceling: string;
  };
  settingsExtra: {
    accountDetails: string;
    fullNameLabel: string;
    email: string;
    company: string;
    role: string;
    roleAdmin: string;
    roleMember: string;
    companyInfo: string;
    companyInfoSubtitle: string;
    products: string;
    productsSubtitle: string;
    referenceWebsites: string;
    referenceWebsitesSubtitle: string;
    websiteTracking: string;
    websiteTrackingSubtitle: string;
    chatbotIdentity: string;
    chatbotIdentitySubtitle: string;
    chatbotKnowledge: string;
    chatbotKnowledgeSubtitle: string;
    embedOnWebsite: string;
    embedOnWebsiteSubtitle: string;
    chatbotActivity: string;
    chatbotActivitySubtitle: string;
    conversations: string;
    leads: string;
    searchJobsRun: string;
    searchJobsRunNote: string;
    emailsSent: string;
    emailsSentNote: string;
    chatbotConversations: string;
    chatbotConversationsNote: string;
    leadsCaptured: string;
    leadsCapturedNote: string;
    teamMembers: string;
    teamMembersNote: string;
    languagesNote: string;
  };
  chatbotSettingsForm: {
    enableChatbot: string;
    assistantName: string;
    themeColor: string;
    greetingMessage: string;
    quickActions: string;
    saving: string;
    save: string;
  };
  chatbotKnowledgeForm: {
    companyKnowledge: string;
    placeholder: string;
    helpText: string;
    saving: string;
    save: string;
  };
  companyProfileForm: {
    companyName: string;
    companyWebsite: string;
    websitePlaceholder: string;
    saving: string;
    save: string;
  };
  productsManager: {
    productNamePlaceholder: string;
    englishNamePlaceholder: string;
    hsCodePlaceholder: string;
    editProduct: string;
    deleteProduct: string;
    saving: string;
    cancel: string;
    adding: string;
    addProduct: string;
    noHsCode: string;
  };
  referenceWebsitesManager: {
    editWebsite: string;
    deleteWebsite: string;
    saving: string;
    cancel: string;
    websitePlaceholder: string;
    adding: string;
    addWebsite: string;
  };
  profileSetup: {
    welcomeTitle: string;
    signingUpAs: string;
    fullName: string;
    fullNamePlaceholder: string;
    companyName: string;
    companyNamePlaceholder: string;
    companyWebsite: string;
    companyWebsitePlaceholder: string;
    websiteHelp: string;
    noCompanyWebsite: string;
    saving: string;
    continueButton: string;
    step2Title: string;
    step2Subtitle: string;
    products: string;
    referenceWebsites: string;
    continueToDashboard: string;
  };
  notificationBell: {
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
    ariaLabel: string;
    heading: string;
    empty: string;
  };
  headerSearch: {
    searching: string;
    noMatch: string;
  };
  chatbotConversationsPage: {
    title: string;
    subtitle: string;
    emptyState: string;
    visitorLabel: string;
    startedLastActive: string;
    leadCaptured: string;
    messagesCount: string;
  };
  chatbotConversationDetailPage: {
    title: string;
    subtitleVisitor: string;
    capturedLead: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    transcript: string;
    qualifiedLead: string;
    fallback: string;
  };
  chatbotLeadsPage: {
    title: string;
    subtitle: string;
    emptyState: string;
    tableName: string;
    tableEmail: string;
    tablePhone: string;
    tableCompany: string;
    tableInterest: string;
    tableQuantity: string;
    tableCountry: string;
    tableDate: string;
    viewChat: string;
  };
  leadDetailPage: {
    addNote: string;
    saveLead: string;
    aiScore: string;
    highPriority: string;
    lastUpdated: string;
    summary: string;
    companyProfile: string;
    annualRevenue: string;
    employees: string;
    founded: string;
    activityTimeline: string;
    timelineTracking: string;
    aiPredictiveInsights: string;
    buyingProbability: string;
    importProbability: string;
    predictiveNote: string;
    verifiedContacts: string;
    directEmailVerified: string;
    exportAllContacts: string;
  };
  simplePageBody: {
    exportPdf: string;
    newButton: string;
    overview: string;
    overviewText: string;
    priorityQueue: string;
    tableCompany: string;
    tableSignal: string;
    tableCountry: string;
    tableChannel: string;
    tableScore: string;
    aiAssistant: string;
    recommendedAction: string;
    recommendedActionText: string;
    applyRecommendation: string;
  };
  tradeDatabasesBody: {
    comingSoon: string;
    comingSoonText: string;
  };
};

const en: Dictionary = {
  nav: {
    tagline: "Enterprise Tier",
    dashboard: "Dashboard",
    visitorIntelligence: "Visitor Intelligence",
    leadFinder: "Lead Finder",
    imageSearch: "Image Search",
    tradeDatabases: "Trade Databases",
    contactFinder: "Contact Finder",
    emailCampaigns: "Email Campaigns",
    reports: "Reports",
    billing: "Billing",
    admin: "Admin",
    settings: "Settings",
    generateLeads: "Generate Leads",
    helpCenter: "Help Center",
    contactSupport: "Contact Support",
  },
  header: {
    searchPlaceholder: "Search leads, databases, or companies...",
    marketplace: "Marketplace",
    documentation: "Documentation",
    enterprisePlan: "Enterprise Plan",
    logout: "Log out",
  },
  dashboardPage: {
    title: "Dashboard Overview",
    subtitle: "Global export lead metrics and real-time intelligence for the last 30 days.",
    last30Days: "Last 30 Days",
    exportReport: "Export Report",
    totalLeadsFound: "Total Leads Found",
    newLeadsToday: "New Leads Today",
    emailsSent: "Emails Sent",
    countriesReached: "Countries Reached",
    activeCampaigns: "Active Campaigns",
    globalLeadDistribution: "Global Lead Distribution",
    globalLeadDistributionSubtitle: "Real-time visualization of lead intensity and connection routes.",
    leadsByIndustry: "Leads by Industry",
    leadsByIndustrySubtitle: "Distribution across primary sectors.",
    viewAllIndustries: "View all industries →",
    recentActivity: "Recent Activity",
    monthlyGrowth: "Monthly Growth",
    monthlyGrowthSubtitle: "Lead acquisition trend analysis.",
    performanceOverview: "Performance Overview",
    performanceOverviewSubtitle: "Key metrics at a glance.",
  },
  simplePages: {
    image: { title: "Image Search", subtitle: "Find visual matches, product photos, and supplier signals from product images." },
    trade: { title: "Trade Databases", subtitle: "Browse verified import/export datasets and customs intelligence." },
    contact: { title: "Contact Finder", subtitle: "Discover verified decision makers and direct outreach channels." },
    email: { title: "Email Campaigns", subtitle: "Create, launch, and measure export sales campaigns." },
    templates: { title: "Template Gallery", subtitle: "Reusable outreach templates by region and industry." },
    builder: { title: "Campaign Builder", subtitle: "Build a personalized campaign for selected leads." },
    sequences: { title: "Sequences", subtitle: "Automated follow-up flows for export prospecting." },
    reports: { title: "Reports", subtitle: "Export performance, lead quality, and campaign analytics." },
    admin: { title: "Admin", subtitle: "User management, activity controls, and account governance." },
    settings: { title: "Settings", subtitle: "Workspace preferences, integrations, security, and profile." },
  },
  settings: {
    title: "Settings",
    subtitle: "Manage your account and workspace configuration.",
    searchPlaceholder: "Search settings...",
    noMatch: "No settings match",
    tabs: {
      profile: "Profile",
      chatbot: "Chatbot Setting",
      usage: "Usage",
      languages: "Languages",
    },
  },
  languagePicker: {
    heading: "Choose your language",
    subtitle: "This changes the language of the GlobalExpo dashboard, and the language your AI chatbot replies to visitors in.",
    searchPlaceholder: "Search languages...",
    comingSoon: "Coming soon",
  },
  common: {
    unknown: "Unknown",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    adding: "Adding…",
    yes: "Yes",
    no: "No",
    exportExcel: "Export Excel",
    noPriorPeriod: "No prior period",
    vsPriorPeriod: "vs prior period",
    filters: {
      label: "Filters",
      empty: "No filters added yet.",
      remove: "Remove filter",
      addPlaceholder: "+ Add Filter",
      reset: "Reset",
      apply: "Apply Filters",
    },
    range: { "1d": "1d", "7d": "7d", "30d": "30d", "90d": "90d" },
    status: {
      searchJob: { PENDING: "Pending", RUNNING: "Running", COMPLETED: "Completed", FAILED: "Failed" },
      campaign: { DRAFT: "Draft", SENDING: "Sending", COMPLETED: "Completed", FAILED: "Failed" },
      recipient: { PENDING: "⏳ Pending", SENDING: "⏳ Sending", SENT: "✅ Sent", FAILED: "❌ Failed", UNSUBSCRIBED: "Unsubscribed" },
      invoice: { PAID: "Paid" },
    },
  },
  visitorPage: {
    title: "Visitor Intelligence",
    subtitle: "Real-time identification and intent tracking of global business visitors.",
    exportData: "Export Data",
    visitorsToday: "Visitors Today",
    last24Hours: "Last 24 hours",
    identifiedCompanies: "Identified Companies",
    withKnownOrg: "With known organization",
    countries: "Countries",
    globalReach: "Global reach",
    returnVisitors: "Return Visitors",
    visitedMoreThanOnce: "Visited more than once",
    tableCompany: "Company",
    tableCountry: "Country",
    tableCity: "City",
    tableDevice: "Device",
    tableLastVisit: "Last Visit",
    tableVisits: "Visits",
    emptyState: "No visitors identified yet. Embed your tracking script from Settings to start collecting data.",
    today: "Today",
    yesterday: "Yesterday",
  },
  geoDistribution: {
    title: "Geographic Distribution",
    visitorsAcrossCountries: "{count} visitors across {countries} countries",
    refreshing: "· refreshing…",
    emptyTitle: "No visitor locations yet.",
    emptySubtitle: "Once visitors start using your website, their geographic distribution will appear here.",
    countriesTab: "Countries",
    citiesTab: "Cities",
    visitorsTooltip: "Visitors: {count}",
    shareTooltip: "Share: {percentage}%",
    noVisitsTooltip: "No visits yet",
    fewerVisitors: "Fewer visitors",
    moreVisitors: "More",
    noDataForView: "No data for this view.",
    other: "Other",
    range: {
      "24h": "Last 24 Hours",
      "7d": "Last 7 Days",
      "30d": "Last 30 Days",
      "90d": "Last 90 Days",
      all: "All Time",
    },
  },
  leadFinderPage: {
    title: "AI Lead Finder",
    subtitle: "Find companies importing or distributing your product, worldwide.",
    recentSearches: "Recent Searches",
    noSearchesInRange: "No searches in the last {range}.",
    maps: "Maps",
    website: "Website",
    resultsCount: "{count} results",
  },
  leadFinderTabs: {
    websiteSearch: "Website Search",
    mapsSearch: "Maps Search",
  },
  leadFinderForm: {
    selectCountries: "Select countries",
    countrySelected: "1 country selected",
    countriesSelected: "{count} countries selected",
    searchCountriesPlaceholder: "Search countries...",
    noCountriesMatch: "No countries match.",
    defineYourProduct: "Define Your Product",
    savedProduct: "Saved Product",
    customNewProduct: "Custom / New Product",
    productName: "Product Name",
    productNamePlaceholder: "e.g. Brake Pad",
    oemNumber: "OEM Number / Serial",
    oemNumberPlaceholder: "e.g. 04465-0K240",
    hsCode: "HS Code (6-12 digits)",
    hsCodePlaceholder: "e.g. 870830",
    targetIndustry: "Target Industry (optional)",
    targetIndustryPlaceholder: "e.g. Automotive Aftermarket",
    productImage: "Product Image (optional)",
    usingSavedImage: "Using saved product image",
    uploadDifferentImage: "Upload a different image instead",
    importYourImage: "Import your image",
    dragOrClickToUpload: "Drag or click to upload",
    identifyingImage: "Identifying image…",
    detectedProduct: "Detected product",
    category: "Category",
    partNumber: "Part number",
    brand: "Brand",
    notDetected: "Not detected",
    imageAnalyzeError: "Couldn't analyze that image, continuing without it.",
    competitorBrands: "Competitor Brands (optional)",
    competitorBrandsPlaceholder: "e.g. Bosch",
    removeBrand: "Remove {brand}",
    potentialCustomerWebsites: "Potential Customer Websites (optional)",
    potentialCustomerWebsitesPlaceholder: "e.g. https://example-importer.com",
    removePotentialCustomerWebsite: "Remove {site}",
    relatedIndustries: "Related Industries (optional)",
    suggestWithAi: "Suggest with AI",
    thinking: "Thinking…",
    suggestError: "Couldn't generate suggestions, try again.",
    searchEngine: "Search Engine",
    selectedCount: "{count} selected",
    noneSelected: "none selected",
    google: "Google",
    bing: "Bing",
    yandex: "Yandex",
    starting: "Starting…",
    startSearch: "Start Search →",
    targetCountries: "Target Countries",
  },
  leadFinderResults: {
    filterCountry: "Country",
    filterHasEmail: "Has Email",
    filterEmailType: "Email Type",
    filterHasPhone: "Has Phone",
    filterHasWebsite: "Has Website",
    filterHasContact: "Has Contact",
    companyEmailOnly: "Company Email Only",
    personalEmail: "Personal Email",
    companiesFound: "{count} Companies Found",
    companiesFoundOf: "{count} of {total} Companies Found",
    searchCompaniesPlaceholder: "Search companies...",
    noMatch: "No companies match your search/filters.",
    tableCompany: "Company",
    tableWebsite: "Website",
    tableContact: "Contact",
    tableTitle: "Title",
    tableRecommendedEmail: "Recommended Email",
    tableConfidence: "Confidence",
    tableCountry: "Country",
    tableEmail: "Email",
    tablePhone: "Phone",
    tableScore: "Score",
    tableWebsiteType: "Website Type",
    tableMatchReason: "Match Reason",
    websiteTypeAll: "All",
    websiteTypeCompany: "Company Websites",
    websiteTypeEcommerce: "E-commerce",
  },
  leadFinderResultsPoll: {
    stillRunning: "This search is still running — the page will refresh automatically.",
  },
  leadFinderResultsPage: {
    findContacts: "Find Contacts →",
    findingContacts: "Finding contacts…",
    searchFailed: "Search failed: {error}",
    unknownError: "Unknown error",
    searching: "Searching…",
    noResultsFound: "No results found for this search.",
  },
  mapsSearchForm: {
    findBusinesses: "Find Businesses on Maps",
    countries: "Countries",
    selectedCount: "{count} selected",
    selectCountries: "Select countries",
    searchCountriesPlaceholder: "Search countries...",
    noCountriesMatch: "No countries match.",
    removeCountry: "Remove {name}",
    cityPerCountry: "City per country (optional)",
    cityOptional: "City (optional)",
    keywords: "Keyword(s)",
    keywordsPlaceholder: "e.g. CNC Machining",
    industry: "Industry",
    industryPlaceholder: "e.g. Manufacturing",
    starting: "Starting…",
    searchMaps: "Search Maps →",
  },
  mapsResults: {
    filterHasEmail: "Has Email",
    filterHasWebsite: "Has Website",
    filterHasPhone: "Has Phone",
    filterMinRating: "Minimum Rating",
    filterCategory: "Category",
    starsSuffix: "{rating}+ stars",
    noCategoriesInResults: "No categories in these results.",
    businessesFound: "{count} Businesses Found",
    businessesFoundOf: "{count} of {total} Businesses Found",
    searchBusinessesPlaceholder: "Search businesses...",
    noMatch: "No businesses match your search/filters.",
    tableCompany: "Company",
    tableCategory: "Category",
    tablePhone: "Phone",
    tableEmail: "Email",
    tableOpeningHours: "Opening Hours",
    tableAddress: "Address",
    tableCountry: "Country",
    tableRating: "Rating",
    website: "Website",
  },
  contactFinder: {
    title: "Contact Finder",
    subtitle: "Discover verified decision makers and direct outreach channels.",
    startTitle: "Start Contact Finder",
    emptyState: "Run a Website Search from Lead Finder and let it complete before finding contacts.",
    companiesFound: "{count} companies found",
    contactsFound: "{count} contacts found",
    findingContacts: "Finding contacts…",
    viewResults: "View Results →",
    findContacts: "Find Contacts →",
  },
  emailCampaignsPage: {
    title: "Email Campaigns",
    subtitle: "Send personalized introduction emails to the companies you've found.",
    startNewCampaign: "Start a New Campaign",
    emptyState: "Run a Website Search from Lead Finder and let it complete before starting a campaign.",
    companiesFound: "{count} companies found",
    buildCampaign: "Build Campaign →",
    pastCampaigns: "Past Campaigns",
    noCampaignsInRange: "No campaigns in the last {range}.",
    recipientsCount: "{count} recipients",
  },
  newCampaignForm: {
    composeEmail: "Compose Email",
    fromName: "From Name",
    fromNamePlaceholder: "e.g. XYZ Automotive",
    fromEmail: "From Email",
    fromEmailPlaceholder: "e.g. sales@yourdomain.com",
    fromEmailHelp: "The From Email's domain must already be verified in your Resend account, or sending will fail.",
    subject: "Subject",
    subjectPlaceholder: "e.g. Automotive Brake Parts Manufacturer",
    message: "Message",
    messagePlaceholder: "Hello {{name}},\n\nWe are XYZ Automotive, a manufacturer of brake pads.\n\nWe would like to introduce our products to {{company}}.\n\nBest regards,\nXYZ Automotive",
    messageHelp: "Use `{{name}}` and `{{company}}` — AI will also generate a few reworded variants automatically so every send doesn't look identical.",
    attachment: "Catalog Attachment (optional)",
    sendRate: "Send Rate (emails/minute)",
    creating: "Creating…",
    reviewCampaign: "Review Campaign →",
    recipients: "Recipients ({count} selected)",
    noUsableEmails: "None of these companies have a usable email address.",
  },
  newCampaignPage: {
    title: "New Campaign",
  },
  campaignDetailPage: {
    recipientsTitle: "Recipients",
    recipientsCount: "{count} recipients",
    startSending: "Start Sending →",
    exportReport: "Export Report",
    campaignFailed: "Campaign failed: {error}",
    sendingProgress: "Sending… {sent} sent, {failed} failed, {remaining} remaining.",
    tableCompany: "Company",
    tableEmail: "Email",
    tableSentTime: "Sent Time",
    tableStatus: "Status",
  },
  reportsPage: {
    title: "Reports",
    subtitle: "Centralized view of company activity and performance across GlobalExpo AI.",
    leadPerformance: "Lead Performance",
    visitorIntelligence: "Visitor Intelligence",
    emailPerformance: "Email Performance",
    chatbotPerformance: "Chatbot Performance",
    searchPerformance: "Search Performance",
    planUsage: "Plan Usage",
    performanceOverview: "Performance Overview",
    totalLeads: "Total Leads",
    websiteVisitors: "Website Visitors",
    identifiedCompanies: "Identified Companies",
    countriesReached: "Countries Reached",
    emailsSent: "Emails Sent",
    activeCampaigns: "Active Campaigns",
    conversations: "Conversations",
    qualifiedLeads: "Qualified Leads",
    fallbackRate: "Fallback Rate",
    conversionRate: "Conversion Rate",
    totalSearches: "Total Searches",
    totalResults: "Total Results",
    completed: "Completed",
    failed: "Failed",
    thisPeriod: "This period",
    ofVisitorMessages: "Of visitor messages",
    qualifiedLeadsOverConversations: "Qualified leads / conversations",
    websiteAndMapsSearches: "{website} website · {maps} maps",
    avgPerSearch: "{avg} avg / search",
    searchesLabel: "Searches",
    leadGenerationTrend: "Lead Generation Trend",
    leadsByCountry: "Leads by Country",
    leadsBySearchType: "Leads by Search Type",
    websiteVisitorTrend: "Website Visitor Trend",
    topCountries: "Top Countries",
    returnVisitorAnalysis: "Return Visitor Analysis",
    campaignPerformance: "Campaign Performance",
    emailStatus: "Email Status",
    emailsSentTrend: "Emails Sent Trend",
    searchTrend: "Search Trend",
    searchResultsByType: "Search Results by Type",
    noSearchesForPeriod: "No searches for this period.",
    noVisitorLocationsYet: "No visitor locations yet.",
    noVisitorsForPeriod: "No visitors for this period.",
    noEmailActivityForPeriod: "No email activity for this period.",
    tableCountry: "Country",
    tableVisitors: "Visitors",
    tableShare: "Share",
    returning: "Returning",
    newLabel: "New",
    sent: "Sent",
    unsubscribed: "Unsubscribed",
    currentPlan: "Current plan: {plan}",
    noActivePlan: "No active plan",
    monthlyUsage: "Monthly usage",
    usageSearches: "Searches",
    usageLeads: "Leads",
    usageEmails: "Emails",
    usageChatbot: "Chatbot",
    scoreDisclaimer: "Internal calculated score — not an industry benchmark",
    scoreOutOf100: "{score} / 100",
    scoreFootnote: "Averages search completion rate, email delivery rate, chatbot conversion rate, and visitor return rate for the selected period.",
  },
  reportsFilterBar: {
    range: { today: "Today", "7d": "Last 7 Days", "30d": "Last 30 Days", "90d": "Last 90 Days", this_month: "This Month", last_month: "Last Month", all: "All Time" },
    exportReport: "Export Report",
    allCountries: "All Countries",
    allSearchTypes: "All Search Types",
    websiteSearch: "Website Search",
    mapsSearch: "Maps Search",
    allCampaigns: "All Campaigns",
    allProducts: "All Products",
    leadSourceChatbot: "Lead Source: Chatbot",
    leadSourceChatbotTitle: "Every lead in this workspace currently comes from the AI chatbot",
    clearFilters: "Clear filters",
  },
  reportsCharts: {
    noDataForPeriod: "No data for this period.",
    limitReached: "Limit reached",
    critical: "Critical",
    warning: "Warning",
    normal: "Normal",
    notIncluded: "not included",
  },
  billingPage: {
    title: "Billing",
    subtitleNoSub: "Choose the plan that fits your business. You can change your plan at any time.",
    subtitleSubscribed: "Effortlessly handle your billing and invoices right here.",
    currentPlanSummary: "Current Plan Summary",
    changePlan: "Change Plan",
    planName: "Plan Name",
    billingCycle: "Billing Cycle",
    monthly: "Monthly",
    planCost: "Plan Cost",
    status: "Status",
    active: "Active",
    canceled: "Canceled",
    nextBillingDate: "Next billing date: {date}",
    paymentMethod: "Payment Method",
    expires: "Expires {month}/{year}",
    change: "Change",
    noPaymentMethod: "No payment method on file.",
    invoices: "Invoices",
    billingHistory: "Your billing history.",
    tableInvoiceId: "Invoice ID",
    tableBillingDate: "Billing Date",
    tablePlan: "Plan",
    tableAmount: "Amount",
    tableStatus: "Status",
    noInvoicesYet: "No invoices yet.",
    download: "Download",
  },
  billingPlansPage: {
    title: "Change Plan",
    subtitle: "Pick a new plan below. Your billing updates immediately.",
  },
  billingCheckoutPage: {
    title: "Complete Your Purchase",
    subtitle: "Review your plan and payment details before completing your subscription.",
    planSuffix: "Plan",
    perMonth: "/ month",
    subtotal: "Subtotal",
    taxVat: "Tax / VAT",
    taxCalculated: "Calculated based on billing information",
    totalToday: "Total today",
  },
  billingSuccessPage: {
    title: "Payment Successful",
    subtitle: "Your {plan} plan is now active.",
    plan: "Plan",
    billing: "Billing",
    nextBillingDate: "Next billing date",
    goToBilling: "Go to Billing →",
  },
  planCards: {
    mostPopular: "Most Popular",
    perMonth: "/ month",
    currentPlan: "Current Plan",
    choosePlan: "Choose {plan}",
  },
  checkoutForm: {
    testModeTitle: "Test mode.",
    testModeBody: "No real payment provider is connected yet. Use `4242 4242 4242 4242` for a successful test payment, `4000 0000 0000 0002` for a decline, or `4000 0000 0000 9995` for insufficient funds. Any future expiry date and any 3-digit CVC work.",
    billingInformation: "Billing Information",
    fullName: "Full Name / Company Name",
    country: "Country",
    address: "Address",
    city: "City",
    postalCode: "Postal Code",
    taxId: "Tax / VAT Number (optional)",
    billingEmail: "Billing Email",
    paymentMethod: "Payment Method",
    creditDebitCard: "💳 Credit / Debit Card",
    cardNumber: "Card Number",
    cardholderName: "Cardholder Name",
    expiryMonth: "Expiry Month",
    expiryYear: "Expiry Year",
    cvc: "CVC",
    agreeTerms: "I agree to the Terms of Service and Subscription Policy. Your subscription will renew automatically every month — you can cancel at any time from the Billing page.",
    processing: "Processing…",
    payNow: "Pay ${price} / month",
  },
  cancelSubscriptionButton: {
    cancelSubscription: "Cancel Subscription",
    confirmHeading: "Cancel {plan} Subscription?",
    confirmBody: "Your subscription will remain active until the end of the current billing period.",
    keepSubscription: "Keep Subscription",
    canceling: "Canceling…",
  },
  settingsExtra: {
    accountDetails: "Account Details",
    fullNameLabel: "Full Name",
    email: "Email",
    company: "Company",
    role: "Role",
    roleAdmin: "You can manage company-wide settings and billing.",
    roleMember: "You have standard member access.",
    companyInfo: "Company Information",
    companyInfoSubtitle: "Used as context when searching for potential customers.",
    products: "Products",
    productsSubtitle: "Saved products can be selected as defaults when starting a Lead Finder search.",
    referenceWebsites: "Reference Websites",
    referenceWebsitesSubtitle: "Sites that give extra context about the kind of companies you're looking for.",
    websiteTracking: "Website Tracking",
    websiteTrackingSubtitle: "Embed this script on your website to identify visiting companies.",
    chatbotIdentity: "AI Chatbot Identity & Status",
    chatbotIdentitySubtitle: "Control whether the chatbot is live and how it presents itself to visitors.",
    chatbotKnowledge: "AI Chatbot Knowledge Base",
    chatbotKnowledgeSubtitle: "Give the chatbot information about your company so it can answer visitors accurately.",
    embedOnWebsite: "Embed on Your Website",
    embedOnWebsiteSubtitle: "Paste this snippet before the closing </body> tag of your website to add the chatbot.",
    chatbotActivity: "Chatbot Activity",
    chatbotActivitySubtitle: "Conversations and leads collected by your AI chatbot.",
    conversations: "Conversations →",
    leads: "Leads →",
    searchJobsRun: "Search Jobs Run",
    searchJobsRunNote: "Website + Maps searches",
    emailsSent: "Emails Sent",
    emailsSentNote: "Across all campaigns",
    chatbotConversations: "Chatbot Conversations",
    chatbotConversationsNote: "Total visitor conversations",
    leadsCaptured: "Leads Captured",
    leadsCapturedNote: "From the AI chatbot",
    teamMembers: "Team Members",
    teamMembersNote: "Active workspace users",
    languagesNote: "This also sets the language your AI chatbot replies to visitors in — one language setting for your whole account.",
  },
  chatbotSettingsForm: {
    enableChatbot: "Enable the chatbot on your website",
    assistantName: "Assistant Name",
    themeColor: "Theme Color",
    greetingMessage: "Greeting Message",
    quickActions: "Quick Actions (one per line)",
    saving: "Saving…",
    save: "Save Chatbot Settings",
  },
  chatbotKnowledgeForm: {
    companyKnowledge: "Company Knowledge",
    placeholder: "Describe your company for the AI chatbot: products, services, industries, countries/markets served, certifications, business hours, contact info, FAQs, etc.",
    helpText: "The chatbot uses this text to answer visitor questions. Leave it blank and it will answer generically.",
    saving: "Saving…",
    save: "Save Knowledge",
  },
  companyProfileForm: {
    companyName: "Company Name",
    companyWebsite: "Company Website",
    websitePlaceholder: "https://example.com",
    saving: "Saving…",
    save: "Save Company Info",
  },
  productsManager: {
    productNamePlaceholder: "Product Name",
    englishNamePlaceholder: "English Product Name",
    hsCodePlaceholder: "GTIP / HS Code",
    editProduct: "Edit",
    deleteProduct: "Delete",
    saving: "Saving…",
    cancel: "Cancel",
    adding: "Adding…",
    addProduct: "Add Product",
    noHsCode: "No HS code",
  },
  referenceWebsitesManager: {
    editWebsite: "Edit website",
    deleteWebsite: "Delete website",
    saving: "Saving…",
    cancel: "Cancel",
    websitePlaceholder: "https://example.com",
    adding: "Adding…",
    addWebsite: "Add Website",
  },
  profileSetup: {
    welcomeTitle: "Welcome to GlobalExpo",
    signingUpAs: "You're signing up with {email}",
    fullName: "Full name",
    fullNamePlaceholder: "Your full name",
    companyName: "Company name",
    companyNamePlaceholder: "e.g., Acme Corp",
    companyWebsite: "Company website",
    companyWebsitePlaceholder: "e.g., acme.com",
    websiteHelp: "This helps us personalize your workspace.",
    noCompanyWebsite: "No company website",
    saving: "Saving…",
    continueButton: "Continue",
    step2Title: "Tell us what you sell",
    step2Subtitle: "Add your products and any reference websites. This will be used when searching for potential customers.",
    products: "Products",
    referenceWebsites: "Reference Websites",
    continueToDashboard: "Continue to Dashboard",
  },
  notificationBell: {
    justNow: "just now",
    minutesAgo: "{n}m ago",
    hoursAgo: "{n}h ago",
    daysAgo: "{n}d ago",
    ariaLabel: "Notifications",
    heading: "Notifications",
    empty: "No notifications yet",
  },
  headerSearch: {
    searching: "Searching…",
    noMatch: "No leads or companies match \"{query}\".",
  },
  chatbotConversationsPage: {
    title: "Chatbot Conversations",
    subtitle: "Every conversation the AI chatbot has had with your website visitors.",
    emptyState: "No conversations yet. Once your chatbot is enabled and embedded, conversations will show up here.",
    visitorLabel: "Visitor {id}",
    startedLastActive: "Started {started} · Last active {lastActive}",
    leadCaptured: "Lead captured",
    messagesCount: "{count} messages",
  },
  chatbotConversationDetailPage: {
    title: "Conversation",
    subtitleVisitor: "Visitor {id} · Started {date}",
    capturedLead: "Captured Lead",
    name: "Name",
    email: "Email",
    phone: "Phone",
    company: "Company",
    transcript: "Transcript",
    qualifiedLead: "Qualified lead",
    fallback: "Fallback",
  },
  chatbotLeadsPage: {
    title: "Chatbot Leads",
    subtitle: "Contacts collected by the AI chatbot from qualified conversations.",
    emptyState: "No leads yet. Leads appear here once a visitor submits their contact details in the chatbot.",
    tableName: "Name",
    tableEmail: "Email",
    tablePhone: "Phone",
    tableCompany: "Company",
    tableInterest: "Interest",
    tableQuantity: "Quantity",
    tableCountry: "Country",
    tableDate: "Date",
    viewChat: "View chat →",
  },
  leadDetailPage: {
    addNote: "Add Note",
    saveLead: "Save Lead",
    aiScore: "AI Score",
    highPriority: "High Priority",
    lastUpdated: "Last updated: 2 hours ago",
    summary: "TransGlobal Logistics has shown a 45% increase in cross-border trade queries in the last 30 days. Their tech stack and revenue growth suggest high readiness.",
    companyProfile: "Company Profile",
    annualRevenue: "Annual Revenue",
    employees: "Employees",
    founded: "Founded",
    activityTimeline: "Activity Timeline",
    timelineTracking: "AI automated tracking · Oct 24",
    aiPredictiveInsights: "AI Predictive Insights",
    buyingProbability: "Buying Probability",
    importProbability: "Import Probability",
    predictiveNote: "Operations mirror Maersk and DHL Logistics hubs in Northern Europe.",
    verifiedContacts: "Verified Contacts",
    directEmailVerified: "Direct Email Verified",
    exportAllContacts: "Export All Contacts",
  },
  simplePageBody: {
    exportPdf: "Export PDF",
    newButton: "New",
    overview: "Overview",
    overviewText: "This screen follows the same GlobalExport AI system: sharp cards, monospace labels, black primary actions, and acid yellow AI states.",
    priorityQueue: "Priority Queue",
    tableCompany: "Company",
    tableSignal: "Signal",
    tableCountry: "Country",
    tableChannel: "Channel",
    tableScore: "Score",
    aiAssistant: "AI Assistant",
    recommendedAction: "Recommended next action",
    recommendedActionText: "Prioritize companies with recent buyer intent and matching HS-code demand.",
    applyRecommendation: "Apply Recommendation",
  },
  tradeDatabasesBody: {
    comingSoon: "Coming soon",
    comingSoonText: "Verified import/export datasets and customs intelligence will appear here once trade database search is available.",
  },
};

export default en;
