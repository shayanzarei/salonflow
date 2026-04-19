export type ErrorsSection = {
  title: string;
  dashboardDescription: string;
  globalDescription: string;
  digestRef: string;
  errorId: string;
  tryAgain: string;
  contactSupport: string;
  backToHome: string;
  footerNote: string;
  goHomeAria: string;
  notFoundTitle: string;
  notFoundBody: string;
  notFoundBack: string;
  notFoundContact: string;
  notFoundFooter: string;
  notFoundHomeAria: string;
};

export const errorsEn: ErrorsSection = {
  title: "Something went wrong",
  dashboardDescription:
    "This page ran into an unexpected error. You can try reloading it — your data is safe and unaffected.",
  globalDescription:
    "An unexpected error occurred. This has been noted and we'll look into it. You can try again or go back to the home page.",
  digestRef: "Ref:",
  errorId: "Error ID:",
  tryAgain: "Try again",
  contactSupport: "Contact support",
  backToHome: "← Back to home",
  footerNote: "Error 500 · SoloHub — Built with care in the Netherlands 🇳🇱",
  goHomeAria: "Go to SoloHub home",
  notFoundTitle: "Page not found",
  notFoundBody:
    "The page you're looking for doesn't exist or may have been moved. Double-check the URL, or head back to safety.",
  notFoundBack: "← Back to home",
  notFoundContact: "Contact support",
  notFoundFooter:
    "Error 404 · SoloHub — Built with care in the Netherlands 🇳🇱",
  notFoundHomeAria: "Go to SoloHub home",
};

export const errorsNl: ErrorsSection = {
  title: "Er ging iets mis",
  dashboardDescription:
    "Deze pagina kreeg een onverwachte fout. Probeer opnieuw te laden — je gegevens zijn veilig en ongewijzigd.",
  globalDescription:
    "Er is een onverwachte fout opgetreden. Dit is genoteerd. Probeer het opnieuw of ga terug naar de startpagina.",
  digestRef: "Ref:",
  errorId: "Fout-ID:",
  tryAgain: "Opnieuw proberen",
  contactSupport: "Contact opnemen",
  backToHome: "← Terug naar home",
  footerNote: "Fout 500 · SoloHub — Met zorg gebouwd in Nederland 🇳🇱",
  goHomeAria: "Naar SoloHub home",
  notFoundTitle: "Pagina niet gevonden",
  notFoundBody:
    "Deze pagina bestaat niet of is verplaatst. Controleer de URL of ga terug.",
  notFoundBack: "← Terug naar home",
  notFoundContact: "Neem contact op",
  notFoundFooter: "Fout 404 · SoloHub — Met zorg gebouwd in Nederland 🇳🇱",
  notFoundHomeAria: "Naar SoloHub home",
};
