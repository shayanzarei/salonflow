export type DashboardBookingsSection = {
  title: string;
  totalTemplate: string;
  addBooking: string;
  filterAll: string;
  filterConfirmed: string;
  filterPending: string;
  filterCancelled: string;
  searchPlaceholder: string;
  colClient: string;
  colService: string;
  colStaff: string;
  colDateTime: string;
  colStatus: string;
  colPrice: string;
  colAction: string;
  noBookings: string;
  view: string;
  show: string;
  ofResultsTemplate: string;
  statusConfirmed: string;
  statusPending: string;
  statusCancelled: string;
  minShort: string;
};

export type DashboardCustomersSection = {
  title: string;
  totalCustomers: string;
  allTime: string;
  newThisMonth: string;
  growthVsLastMonth: string;
  averageSpend: string;
  perCustomer: string;
  tabAll: string;
  tabVip: string;
  tabNew: string;
  tabNewSuffix: string;
  tabAtRisk: string;
  tabAtRiskSuffix: string;
  emptyNoClientsTitle: string;
  emptyNoClientsBody: string;
  addFirstBooking: string;
  setupBookingSite: string;
  emptyFilter: string;
  colClient: string;
  colContact: string;
  colVisits: string;
  colLastVisit: string;
  colTotalSpent: string;
  colStatus: string;
  colAction: string;
  view: string;
  visitsTemplate: string;
  visitsSubline: string;
  bookingsWord: string;
  showingRangeTemplate: string;
  viewHistory: string;
  growthLineTemplate: string;
  statusVip: string;
  statusRegular: string;
  statusNew: string;
  statusAtRisk: string;
  today: string;
  oneDayAgo: string;
  daysAgoTemplate: string;
};

export type DashboardReportsSection = {
  loading: string;
  loadFailed: string;
  genericError: string;
  title: string;
  subtitle: string;
  completeAllTemplate: string;
  finalizing: string;
  statToday: string;
  statWeek: string;
  statMonth: string;
  completedAppointmentsOne: string;
  completedAppointmentsMany: string;
  todayAppointmentsTitle: string;
  todayAppointmentsHint: string;
  allDone: string;
  emptyTodayTitle: string;
  emptyTodayBody: string;
  minShort: string;
  statusCompleted: string;
  statusNoShow: string;
  statusCancelled: string;
  done: string;
  noShow: string;
  explainer: string;
};

export type DashboardChromeSection = {
  closeNavMenu: string;
  openNavMenu: string;
  planLineTemplate: string;
};

export type DashboardSection = {
  bookings: DashboardBookingsSection;
  customers: DashboardCustomersSection;
  reports: DashboardReportsSection;
  chrome: DashboardChromeSection;
};

export const dashboardEn: DashboardSection = {
  bookings: {
    title: "Bookings",
    totalTemplate: "{n} Total",
    addBooking: "Add Booking",
    filterAll: "All",
    filterConfirmed: "Confirmed",
    filterPending: "Pending",
    filterCancelled: "Cancelled",
    searchPlaceholder: "Search client, service...",
    colClient: "Client",
    colService: "Service",
    colStaff: "Staff",
    colDateTime: "Date & Time",
    colStatus: "Status",
    colPrice: "Price",
    colAction: "Action",
    noBookings: "No bookings found.",
    view: "View",
    show: "Show",
    ofResultsTemplate: "of {n} results",
    statusConfirmed: "Confirmed",
    statusPending: "Pending",
    statusCancelled: "Cancelled",
    minShort: "{n} min",
  },
  customers: {
    title: "Customers",
    totalCustomers: "Total Customers",
    allTime: "All time",
    newThisMonth: "New This Month",
    growthVsLastMonth: "vs last month",
    averageSpend: "Average Spend",
    perCustomer: "Per customer",
    tabAll: "All Customers",
    tabVip: "VIP",
    tabNew: "New",
    tabNewSuffix: "(this month)",
    tabAtRisk: "At Risk",
    tabAtRiskSuffix: "(60+ days)",
    emptyNoClientsTitle: "No clients yet",
    emptyNoClientsBody:
      "Clients appear here automatically when they book through your website. You can also add bookings manually to start building your client history.",
    addFirstBooking: "+ Add first booking",
    setupBookingSite: "Set up booking site →",
    emptyFilter: "No clients match this filter.",
    colClient: "Client",
    colContact: "Contact",
    colVisits: "Visits",
    colLastVisit: "Last Visit",
    colTotalSpent: "Total Spent",
    colStatus: "Status",
    colAction: "Action",
    view: "View",
    visitsTemplate: "{n} visits",
    visitsSubline: "total visits",
    bookingsWord: "bookings",
    showingRangeTemplate: "Showing {from}–{to} of {total} customers",
    viewHistory: "View History",
    growthLineTemplate: "{arrow} {n}% {vs}",
    statusVip: "VIP",
    statusRegular: "Regular",
    statusNew: "New",
    statusAtRisk: "At Risk",
    today: "Today",
    oneDayAgo: "1 day ago",
    daysAgoTemplate: "{n} days ago",
  },
  reports: {
    loading: "Loading revenue data…",
    loadFailed: "Failed to load revenue data",
    genericError: "Something went wrong.",
    title: "Revenue & Day Overview",
    subtitle: "Finalize today's appointments and track your earnings.",
    completeAllTemplate: "✓ Complete all {n} remaining",
    finalizing: "Finalizing…",
    statToday: "Today",
    statWeek: "This week",
    statMonth: "This month",
    completedAppointmentsOne: "{n} completed appointment",
    completedAppointmentsMany: "{n} completed appointments",
    todayAppointmentsTitle: "Today's appointments",
    todayAppointmentsHint:
      "Mark each appointment when the client is done or didn't show up.",
    allDone: "All done ✓",
    emptyTodayTitle: "No appointments scheduled for today",
    emptyTodayBody:
      "Once clients book appointments, they will appear here so you can finalize them at the end of the day.",
    minShort: "{n} min",
    statusCompleted: "✓ Completed",
    statusNoShow: "No-show",
    statusCancelled: "Cancelled",
    done: "✓ Done",
    noShow: "No-show",
    explainer:
      "How it works: Mark appointments as Done when the client has received their service and paid. Mark No-show if they didn't arrive. Only completed appointments count toward your revenue totals. Revenue numbers refresh automatically after bulk finalize.",
  },
  chrome: {
    closeNavMenu: "Close navigation menu",
    openNavMenu: "Open navigation menu",
    planLineTemplate: "{tier} Plan",
  },
};

export const dashboardNl: DashboardSection = {
  bookings: {
    title: "Afspraken",
    totalTemplate: "{n} totaal",
    addBooking: "Afspraak toevoegen",
    filterAll: "Alle",
    filterConfirmed: "Bevestigd",
    filterPending: "In afwachting",
    filterCancelled: "Geannuleerd",
    searchPlaceholder: "Zoek klant, dienst...",
    colClient: "Klant",
    colService: "Dienst",
    colStaff: "Medewerker",
    colDateTime: "Datum & tijd",
    colStatus: "Status",
    colPrice: "Prijs",
    colAction: "Actie",
    noBookings: "Geen afspraken gevonden.",
    view: "Bekijk",
    show: "Toon",
    ofResultsTemplate: "van {n} resultaten",
    statusConfirmed: "Bevestigd",
    statusPending: "In afwachting",
    statusCancelled: "Geannuleerd",
    minShort: "{n} min",
  },
  customers: {
    title: "Klanten",
    totalCustomers: "Totaal klanten",
    allTime: "Volledige periode",
    newThisMonth: "Nieuw deze maand",
    growthVsLastMonth: "t.o.v. vorige maand",
    averageSpend: "Gemiddelde besteding",
    perCustomer: "Per klant",
    tabAll: "Alle klanten",
    tabVip: "VIP",
    tabNew: "Nieuw",
    tabNewSuffix: "(deze maand)",
    tabAtRisk: "Risico",
    tabAtRiskSuffix: "(60+ dagen)",
    emptyNoClientsTitle: "Nog geen klanten",
    emptyNoClientsBody:
      "Klanten verschijnen hier automatisch wanneer ze via je website boeken. Je kunt ook handmatig afspraken toevoegen om je klantgeschiedenis op te bouwen.",
    addFirstBooking: "+ Eerste afspraak toevoegen",
    setupBookingSite: "Boekingssite instellen →",
    emptyFilter: "Geen klanten voor dit filter.",
    colClient: "Klant",
    colContact: "Contact",
    colVisits: "Bezoeken",
    colLastVisit: "Laatste bezoek",
    colTotalSpent: "Totaal besteed",
    colStatus: "Status",
    colAction: "Actie",
    view: "Bekijk",
    visitsTemplate: "{n} bezoeken",
    visitsSubline: "bezoeken totaal",
    bookingsWord: "afspraken",
    showingRangeTemplate: "Toont {from}–{to} van {total} klanten",
    viewHistory: "Geschiedenis",
    growthLineTemplate: "{arrow} {n}% {vs}",
    statusVip: "VIP",
    statusRegular: "Regulier",
    statusNew: "Nieuw",
    statusAtRisk: "Risico",
    today: "Vandaag",
    oneDayAgo: "1 dag geleden",
    daysAgoTemplate: "{n} dagen geleden",
  },
  reports: {
    loading: "Omzetgegevens laden…",
    loadFailed: "Kon omzetgegevens niet laden",
    genericError: "Er is iets misgegaan.",
    title: "Omzet & dagoverzicht",
    subtitle: "Rond de afspraken van vandaag af en volg je omzet.",
    completeAllTemplate: "✓ Alle {n} resterende afronden",
    finalizing: "Bezig met afronden…",
    statToday: "Vandaag",
    statWeek: "Deze week",
    statMonth: "Deze maand",
    completedAppointmentsOne: "{n} voltooide afspraak",
    completedAppointmentsMany: "{n} voltooide afspraken",
    todayAppointmentsTitle: "Afspraken van vandaag",
    todayAppointmentsHint:
      "Markeer elke afspraak wanneer de klant klaar is of niet is verschenen.",
    allDone: "Alles af ✓",
    emptyTodayTitle: "Geen afspraken gepland voor vandaag",
    emptyTodayBody:
      "Zodra klanten boeken, verschijnen ze hier zodat je ze aan het eind van de dag kunt afronden.",
    minShort: "{n} min",
    statusCompleted: "✓ Voltooid",
    statusNoShow: "Niet verschenen",
    statusCancelled: "Geannuleerd",
    done: "✓ Klaar",
    noShow: "Niet verschenen",
    explainer:
      "Zo werkt het: markeer afspraken als Klaar wanneer de klant de behandeling heeft gehad en betaald. Markeer Niet verschenen als ze niet komen. Alleen voltooide afspraken tellen mee voor je omzet. Cijfers verversen automatisch na bulk afronden.",
  },
  chrome: {
    closeNavMenu: "Navigatiemenu sluiten",
    openNavMenu: "Navigatiemenu openen",
    planLineTemplate: "{tier}-abonnement",
  },
};
