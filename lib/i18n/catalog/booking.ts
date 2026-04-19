export type BookingSection = {
  back: string;
  backToWebsite: string;
  chooseServiceTitle: string;
  chooseServiceSubtitle: string;
  minutesShort: string;
  chooseStaffTitle: string;
  selectedLabel: string;
  chooseTimeTitle: string;
  withStaff: string;
  confirmTitle: string;
  confirmSubtitle: string;
  summaryHeading: string;
  rowService: string;
  rowDate: string;
  rowTime: string;
  rowDuration: string;
  rowLocation: string;
  rowTotal: string;
  durationMinsShort: string;
  durationMinutes: string;
  yourDetails: string;
  yourDetailsHint: string;
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  phoneOptional: string;
  placeholderName: string;
  placeholderEmail: string;
  placeholderPhone: string;
  confirmPolicyNotice: string;
  confirmBookingCta: string;
  progress: {
    service: string;
    staff: string;
    time: string;
    confirm: string;
    allCompleteMobile: string;
    stepMobile: string;
  };
  timePicker: {
    selectDate: string;
    availableTimes: string;
    loadingAvailability: string;
    loadError: string;
    noSlots: string;
    legendSelected: string;
    legendToday: string;
    legendUnavailable: string;
    legendBooked: string;
    morning: string;
    afternoon: string;
    evening: string;
    titleBooked: string;
    titlePast: string;
    bookedBadge: string;
    continueCta: string;
    weekdayShort: string[];
  };
  success: {
    title: string;
    subtitle: string;
    yourAppointment: string;
    withStaffPrefix: string;
    dateLabel: string;
    timeLabel: string;
    durationLabel: string;
    totalLabel: string;
    locationLabel: string;
    backToHome: string;
    addGoogleCalendar: string;
    share: string;
    shareWhatsappTemplate: string;
    calendarEventDefault: string;
  };
  cancel: {
    alreadyTitle: string;
    alreadyBody: string;
    cancelTitle: string;
    cancelBody: string;
    appointmentDetails: string;
    withStaffPrefix: string;
    date: string;
    time: string;
    duration: string;
    location: string;
    minutesUnit: string;
    policyTitle: string;
    policyBody: string;
    keepAppointment: string;
    confirmCancel: string;
    reschedulePrompt: string;
    rescheduleLink: string;
  };
};

export const bookingEn: BookingSection = {
  back: "← Back",
  backToWebsite: "← Back to website",
  chooseServiceTitle: "Choose a service",
  chooseServiceSubtitle: "Select the treatment that's perfect for you",
  minutesShort: "{n} min",
  chooseStaffTitle: "Choose a staff member",
  selectedLabel: "Selected:",
  chooseTimeTitle: "Choose a time",
  withStaff: "with",
  confirmTitle: "Confirm your booking",
  confirmSubtitle: "Review your appointment details before confirming",
  summaryHeading: "Booking Summary",
  rowService: "Service",
  rowDate: "Date",
  rowTime: "Time",
  rowDuration: "Duration",
  rowLocation: "Location",
  rowTotal: "Total",
  durationMinsShort: "{n} mins",
  durationMinutes: "{n} minutes",
  yourDetails: "Your details",
  yourDetailsHint: "Enter your information to complete the booking",
  fullName: "Full name",
  emailAddress: "Email address",
  phoneNumber: "Phone number",
  phoneOptional: "(optional)",
  placeholderName: "Sarah Johnson",
  placeholderEmail: "sarah@example.com",
  placeholderPhone: "+31 6 12345678",
  confirmPolicyNotice:
    "By confirming, you agree to our cancellation policy. Free cancellation up to 24 hours before your appointment.",
  confirmBookingCta: "Confirm booking →",
  progress: {
    service: "Service",
    staff: "Staff",
    time: "Time",
    confirm: "Confirm",
    allCompleteMobile: "All steps complete — you're booked",
    stepMobile: "Step {step} of {total}: {label}",
  },
  timePicker: {
    selectDate: "Select a date",
    availableTimes: "Available times",
    loadingAvailability: "Checking availability…",
    loadError: "Could not load availability. Please try again.",
    noSlots: "No available slots for this date",
    legendSelected: "Selected",
    legendToday: "Today",
    legendUnavailable: "Unavailable",
    legendBooked: "Already booked",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    titleBooked: "Already booked",
    titlePast: "Time has passed",
    bookedBadge: "Booked",
    continueCta: "Continue to confirmation →",
    weekdayShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  },
  success: {
    title: "Booking confirmed",
    subtitle:
      "We've sent a confirmation email with all the details. We can't wait to see you!",
    yourAppointment: "Your appointment",
    withStaffPrefix: "with",
    dateLabel: "Date",
    timeLabel: "Time",
    durationLabel: "Duration",
    totalLabel: "Total",
    locationLabel: "Location",
    backToHome: "Back to home",
    addGoogleCalendar: "Add to Google Calendar",
    share: "Share",
    shareWhatsappTemplate: "I just booked at {salon}!",
    calendarEventDefault: "Appointment",
  },
  cancel: {
    alreadyTitle: "Already cancelled",
    alreadyBody: "This appointment has already been cancelled.",
    cancelTitle: "Cancel appointment?",
    cancelBody:
      "Are you sure you want to cancel this booking? This action cannot be undone.",
    appointmentDetails: "Appointment Details",
    withStaffPrefix: "with",
    date: "Date",
    time: "Time",
    duration: "Duration",
    location: "Location",
    minutesUnit: "{n} minutes",
    policyTitle: "Cancellation Policy",
    policyBody:
      "Cancellations made less than 24 hours before your appointment may be subject to a cancellation fee.",
    keepAppointment: "← Keep appointment",
    confirmCancel: "✕ Yes, cancel",
    reschedulePrompt: "Need to reschedule instead?",
    rescheduleLink: "Choose a new time",
  },
};

export const bookingNl: BookingSection = {
  back: "← Terug",
  backToWebsite: "← Terug naar website",
  chooseServiceTitle: "Kies een behandeling",
  chooseServiceSubtitle: "Selecteer de behandeling die bij je past",
  minutesShort: "{n} min",
  chooseStaffTitle: "Kies een medewerker",
  selectedLabel: "Gekozen:",
  chooseTimeTitle: "Kies een tijd",
  withStaff: "met",
  confirmTitle: "Bevestig je afspraak",
  confirmSubtitle: "Controleer de gegevens voordat je bevestigt",
  summaryHeading: "Overzicht afspraak",
  rowService: "Behandeling",
  rowDate: "Datum",
  rowTime: "Tijd",
  rowDuration: "Duur",
  rowLocation: "Locatie",
  rowTotal: "Totaal",
  durationMinsShort: "{n} min",
  durationMinutes: "{n} minuten",
  yourDetails: "Jouw gegevens",
  yourDetailsHint: "Vul je gegevens in om de afspraak te voltooien",
  fullName: "Volledige naam",
  emailAddress: "E-mailadres",
  phoneNumber: "Telefoonnummer",
  phoneOptional: "(optioneel)",
  placeholderName: "Jan de Vries",
  placeholderEmail: "jan@voorbeeld.nl",
  placeholderPhone: "+31 6 12345678",
  confirmPolicyNotice:
    "Door te bevestigen ga je akkoord met het annuleringsbeleid. Gratis annuleren tot 24 uur voor je afspraak.",
  confirmBookingCta: "Afspraak bevestigen →",
  progress: {
    service: "Dienst",
    staff: "Medewerker",
    time: "Tijd",
    confirm: "Bevestigen",
    allCompleteMobile: "Alle stappen voltooid — je bent geboekt",
    stepMobile: "Stap {step} van {total}: {label}",
  },
  timePicker: {
    selectDate: "Kies een datum",
    availableTimes: "Beschikbare tijden",
    loadingAvailability: "Beschikbaarheid laden…",
    loadError: "Kon beschikbaarheid niet laden. Probeer het opnieuw.",
    noSlots: "Geen beschikbare tijden op deze datum",
    legendSelected: "Geselecteerd",
    legendToday: "Vandaag",
    legendUnavailable: "Niet beschikbaar",
    legendBooked: "Al geboekt",
    morning: "Ochtend",
    afternoon: "Middag",
    evening: "Avond",
    titleBooked: "Al geboekt",
    titlePast: "Tijd verstreken",
    bookedBadge: "Bezet",
    continueCta: "Verder naar bevestiging →",
    weekdayShort: ["zo", "ma", "di", "wo", "do", "vr", "za"],
  },
  success: {
    title: "Afspraak bevestigd",
    subtitle:
      "We hebben een bevestigingsmail gestuurd met alle details. We zien je graag!",
    yourAppointment: "Jouw afspraak",
    withStaffPrefix: "met",
    dateLabel: "Datum",
    timeLabel: "Tijd",
    durationLabel: "Duur",
    totalLabel: "Totaal",
    locationLabel: "Locatie",
    backToHome: "Terug naar home",
    addGoogleCalendar: "Toevoegen aan Google Agenda",
    share: "Delen",
    shareWhatsappTemplate: "Ik heb net geboekt bij {salon}!",
    calendarEventDefault: "Afspraak",
  },
  cancel: {
    alreadyTitle: "Al geannuleerd",
    alreadyBody: "Deze afspraak is al geannuleerd.",
    cancelTitle: "Afspraak annuleren?",
    cancelBody:
      "Weet je zeker dat je deze boeking wilt annuleren? Dit kan niet ongedaan worden gemaakt.",
    appointmentDetails: "Afspraakgegevens",
    withStaffPrefix: "met",
    date: "Datum",
    time: "Tijd",
    duration: "Duur",
    location: "Locatie",
    minutesUnit: "{n} minuten",
    policyTitle: "Annuleringsbeleid",
    policyBody:
      "Annuleringen minder dan 24 uur voor je afspraak kunnen annuleringskosten met zich meebrengen.",
    keepAppointment: "← Afspraak behouden",
    confirmCancel: "✕ Ja, annuleren",
    reschedulePrompt: "Wil je liever verzetten?",
    rescheduleLink: "Nieuwe tijd kiezen",
  },
};
