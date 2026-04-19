export type AuthFlowSection = {
  backToLogin: string;
  forgotTitle: string;
  forgotSubtitle: string;
  forgotEmailPlaceholder: string;
  forgotEmailHint: string;
  forgotDoneMessage: string;
  forgotSendLink: string;
  forgotSending: string;
  forgotSecurityTitle: string;
  forgotSecurityBody: string;
  forgotSendErrorFallback: string;
  resetTitle: string;
  resetSubtitle: string;
  resetInvalidToken: string;
  resetNewPassword: string;
  resetConfirmPassword: string;
  resetPlaceholderNew: string;
  resetPlaceholderConfirm: string;
  hideConfirmPassword: string;
  showConfirmPassword: string;
  resetDoneRedirecting: string;
  resetUpdatePassword: string;
  resetSaving: string;
  resetErrorFallback: string;
  signupTermsError: string;
  verifyAllSetTitle: string;
  verifyAllSetBody: string;
  verifyGoWorkspace: string;
  verifyErrExpiredTitle: string;
  verifyErrExpiredBody: string;
  verifyErrAlreadyUsedTitle: string;
  verifyErrAlreadyUsedBody: string;
  verifyErrInvalidTokenTitle: string;
  verifyErrInvalidTokenBody: string;
  verifyErrMissingTokenTitle: string;
  verifyErrMissingTokenBody: string;
  verifyErrServerTitle: string;
  verifyErrServerBody: string;
  verifyErrDefaultTitle: string;
  verifyErrDefaultBody: string;
  verifyStepCreate: string;
  verifyStepVerify: string;
  verifyStepTrial: string;
  verifyCheckInbox: string;
  verifyYourEmailFallback: string;
  verifyInboxBody: string;
  verifyResendSent: string;
  verifyResendPrompt: string;
  verifyResendLink: string;
  verifySpamHint: string;
  verifyWhatsWaiting: string;
  verifyPerk1Label: string;
  verifyPerk1Sub: string;
  verifyPerk2Label: string;
  verifyPerk2Sub: string;
  verifyPerk3Label: string;
  verifyPerk3Sub: string;
  verifyTrialFooter: string;
  verifyResendPlaceholder: string;
  verifyResendSend: string;
  verifyResending: string;
  verifyAlreadyFooter: string;
  verifySignIn: string;
  verifyContactSupport: string;
  verifyResendErrorGeneric: string;
  verifyResendErrorUnknown: string;
  verifyHomeAria: string;
};

export const authFlowEn: AuthFlowSection = {
  backToLogin: "Back to login",
  forgotTitle: "Reset your password",
  forgotSubtitle:
    "Enter your email address and we'll send you a link to reset your password.",
  forgotEmailPlaceholder: "you@company.com",
  forgotEmailHint: "We'll send a password reset link to this email address",
  forgotDoneMessage:
    "If an account exists for this email, a reset link has been sent.",
  forgotSendLink: "Send Reset Link",
  forgotSending: "Sending...",
  forgotSecurityTitle: "Security Notice",
  forgotSecurityBody:
    "For your security, if you didn't request this password reset, please ignore this message or contact our support team immediately.",
  forgotSendErrorFallback: "Unable to send reset link.",
  resetTitle: "Set a new password",
  resetSubtitle: "Choose a strong new password for your account.",
  resetInvalidToken:
    "This reset link is invalid. Please request a new one.",
  resetNewPassword: "New Password",
  resetConfirmPassword: "Confirm New Password",
  resetPlaceholderNew: "Enter new password",
  resetPlaceholderConfirm: "Confirm new password",
  hideConfirmPassword: "Hide confirm password",
  showConfirmPassword: "Show confirm password",
  resetDoneRedirecting: "Password updated. Redirecting to login...",
  resetUpdatePassword: "Update Password",
  resetSaving: "Saving...",
  resetErrorFallback: "Unable to reset password.",
  signupTermsError:
    "Please accept the Terms of Service and Privacy Policy to continue.",
  verifyAllSetTitle: "You're all set!",
  verifyAllSetBody:
    "Your email is confirmed and your 14-day free trial has started. Everything is ready — just sign in.",
  verifyGoWorkspace: "Go to my workspace →",
  verifyErrExpiredTitle: "Link expired",
  verifyErrExpiredBody:
    "Verification links expire after 24 hours. Enter your email below and we'll send a fresh one.",
  verifyErrAlreadyUsedTitle: "Already used",
  verifyErrAlreadyUsedBody:
    "This link has already been used. If your account isn't active yet, request a new link.",
  verifyErrInvalidTokenTitle: "Invalid link",
  verifyErrInvalidTokenBody:
    "This link doesn't look right — it may have been copied incorrectly. Request a new one below.",
  verifyErrMissingTokenTitle: "Missing token",
  verifyErrMissingTokenBody:
    "The link is incomplete. Try clicking the button in your email again, or request a new one.",
  verifyErrServerTitle: "Something went wrong",
  verifyErrServerBody:
    "A server error occurred. Please try again or contact support.",
  verifyErrDefaultTitle: "Verification failed",
  verifyErrDefaultBody: "Something went wrong with your verification link.",
  verifyStepCreate: "Create account",
  verifyStepVerify: "Verify email",
  verifyStepTrial: "Start trial",
  verifyCheckInbox: "Check your inbox",
  verifyYourEmailFallback: "your email address",
  verifyInboxBody:
    "We sent a verification link to that address. Click it to activate your account and start your free trial.",
  verifyResendSent:
    "✓ New link sent — check your inbox (and spam folder).",
  verifyResendPrompt: "Didn't receive it?",
  verifyResendLink: "Resend the email",
  verifySpamHint: "or check your spam folder.",
  verifyWhatsWaiting: "What's waiting for you",
  verifyPerk1Label: "Professional website",
  verifyPerk1Sub: "Live in minutes",
  verifyPerk2Label: "Smart booking calendar",
  verifyPerk2Sub: "24/7 self-service",
  verifyPerk3Label: "Automated invoicing",
  verifyPerk3Sub: "Get paid faster",
  verifyTrialFooter:
    "All included in your 14-day free trial · No credit card needed",
  verifyResendPlaceholder: "your@email.com",
  verifyResendSend: "Resend verification email",
  verifyResending: "Sending…",
  verifyAlreadyFooter: "Already verified?",
  verifySignIn: "Sign in",
  verifyContactSupport: "Contact support",
  verifyResendErrorGeneric: "Could not resend email.",
  verifyResendErrorUnknown: "Something went wrong. Please try again.",
  verifyHomeAria: "Go to SoloHub home",
};

export const authFlowNl: AuthFlowSection = {
  backToLogin: "Terug naar inloggen",
  forgotTitle: "Stel je wachtwoord opnieuw in",
  forgotSubtitle:
    "Vul je e-mailadres in en we sturen je een link om je wachtwoord te resetten.",
  forgotEmailPlaceholder: "jij@bedrijf.nl",
  forgotEmailHint:
    "We sturen een wachtwoord-resetlink naar dit e-mailadres",
  forgotDoneMessage:
    "Als er een account voor dit e-mailadres bestaat, is er een resetlink verstuurd.",
  forgotSendLink: "Stuur resetlink",
  forgotSending: "Bezig met versturen...",
  forgotSecurityTitle: "Beveiligingsmelding",
  forgotSecurityBody:
    "Als je deze reset niet hebt aangevraagd, negeer dit bericht of neem direct contact op met ons supportteam.",
  forgotSendErrorFallback: "Resetlink kon niet worden verstuurd.",
  resetTitle: "Nieuw wachtwoord instellen",
  resetSubtitle: "Kies een sterk nieuw wachtwoord voor je account.",
  resetInvalidToken:
    "Deze resetlink is ongeldig. Vraag een nieuwe aan.",
  resetNewPassword: "Nieuw wachtwoord",
  resetConfirmPassword: "Bevestig nieuw wachtwoord",
  resetPlaceholderNew: "Nieuw wachtwoord",
  resetPlaceholderConfirm: "Bevestig nieuw wachtwoord",
  hideConfirmPassword: "Bevestiging verbergen",
  showConfirmPassword: "Bevestiging tonen",
  resetDoneRedirecting:
    "Wachtwoord bijgewerkt. Je wordt doorgestuurd naar inloggen...",
  resetUpdatePassword: "Wachtwoord bijwerken",
  resetSaving: "Opslaan...",
  resetErrorFallback: "Wachtwoord kon niet worden gereset.",
  signupTermsError:
    "Ga akkoord met de Servicevoorwaarden en het Privacybeleid om verder te gaan.",
  verifyAllSetTitle: "Helemaal klaar!",
  verifyAllSetBody:
    "Je e-mail is bevestigd en je gratis proefperiode van 14 dagen is gestart. Alles staat klaar — log nu in.",
  verifyGoWorkspace: "Naar mijn werkruimte →",
  verifyErrExpiredTitle: "Link verlopen",
  verifyErrExpiredBody:
    "Verificatielinks verlopen na 24 uur. Vul hieronder je e-mail in en we sturen een nieuwe.",
  verifyErrAlreadyUsedTitle: "Al gebruikt",
  verifyErrAlreadyUsedBody:
    "Deze link is al gebruikt. Als je account nog niet actief is, vraag dan een nieuwe link aan.",
  verifyErrInvalidTokenTitle: "Ongeldige link",
  verifyErrInvalidTokenBody:
    "Deze link klopt niet — misschien verkeerd gekopieerd. Vraag hieronder een nieuwe aan.",
  verifyErrMissingTokenTitle: "Token ontbreekt",
  verifyErrMissingTokenBody:
    "De link is onvolledig. Klik opnieuw op de knop in je e-mail of vraag een nieuwe link aan.",
  verifyErrServerTitle: "Er ging iets mis",
  verifyErrServerBody:
    "Er is een serverfout opgetreden. Probeer het opnieuw of neem contact op.",
  verifyErrDefaultTitle: "Verificatie mislukt",
  verifyErrDefaultBody:
    "Er ging iets mis met je verificatielink.",
  verifyStepCreate: "Account aanmaken",
  verifyStepVerify: "E-mail verifiëren",
  verifyStepTrial: "Proefperiode starten",
  verifyCheckInbox: "Check je inbox",
  verifyYourEmailFallback: "je e-mailadres",
  verifyInboxBody:
    "We hebben een verificatielink naar dat adres gestuurd. Klik erop om je account te activeren en je gratis proefperiode te starten.",
  verifyResendSent:
    "✓ Nieuwe link verstuurd — check je inbox (en spam).",
  verifyResendPrompt: "Niets ontvangen?",
  verifyResendLink: "E-mail opnieuw versturen",
  verifySpamHint: "of check je spammap.",
  verifyWhatsWaiting: "Dit wacht op je",
  verifyPerk1Label: "Professionele website",
  verifyPerk1Sub: "Live binnen minuten",
  verifyPerk2Label: "Slimme agenda",
  verifyPerk2Sub: "24/7 zelf boeken",
  verifyPerk3Label: "Geautomatiseerde facturatie",
  verifyPerk3Sub: "Sneller betaald krijgen",
  verifyTrialFooter:
    "Alles inbegrepen in je proefperiode van 14 dagen · Geen creditcard nodig",
  verifyResendPlaceholder: "jij@email.nl",
  verifyResendSend: "Verificatiemail opnieuw versturen",
  verifyResending: "Bezig met versturen…",
  verifyAlreadyFooter: "Al geverifieerd?",
  verifySignIn: "Inloggen",
  verifyContactSupport: "Neem contact op",
  verifyResendErrorGeneric: "E-mail kon niet opnieuw worden verstuurd.",
  verifyResendErrorUnknown:
    "Er ging iets mis. Probeer het opnieuw.",
  verifyHomeAria: "Naar SoloHub home",
};
