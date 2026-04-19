export type MarketingFaqItem = { q: string; a: string };

export type MarketingFaqSection = {
  title: string;
  items: MarketingFaqItem[];
};

export type MarketingSection = {
  contactHeroTitle: string;
  contactHeroSubtitle: string;
  contactPromiseTitle: string;
  contactPromiseBody: string;
  contactAvgResponseLabel: string;
  contactAvgResponseValue: string;
  contactDirectTitle: string;
  contactWhatsAppTitle: string;
  contactWhatsAppBody: string;
  contactStartChat: string;
  contactReadFaqs: string;
  contactPrivacyLink: string;
  contactFormTitle: string;
  contactFirstName: string;
  contactLastName: string;
  contactWorkEmail: string;
  contactTopicLabel: string;
  contactTopicPlaceholder: string;
  contactTopicSales: string;
  contactTopicSupport: string;
  contactTopicBilling: string;
  contactTopicOther: string;
  contactMessageLabel: string;
  contactMessagePlaceholder: string;
  contactSending: string;
  contactSend: string;
  contactSuccessTitle: string;
  contactErrorTitle: string;
  contactFormDisclaimerPrefix: string;
  contactThanksSent: string;
  contactFailedSend: string;
  phFirstName: string;
  phLastName: string;
  phWorkEmail: string;
  faqPageTitle: string;
  faqPageSubtitle: string;
  faqSections: MarketingFaqSection[];
  pricingPaymentReceivedTitle: string;
  pricingPaymentReceivedBody: string;
  pricingCheckoutCancelledTitle: string;
  pricingCheckoutCancelledBody: string;
  pricingCheckoutFailedTitle: string;
  pricingCheckoutFailedBody: string;
  pricingUnableCheckout: string;
  pricingHeroTitle: string;
  pricingHeroSubtitle: string;
  pricingMonthly: string;
  pricingAnnually: string;
  pricingSave20: string;
  pricingToggleAria: string;
  pricingMostPopular: string;
  pricingRedirecting: string;
  pricingGetStarted: string;
  pricingSuffixMo: string;
  pricingSuffixYr: string;
  pricingTrialEyebrow: string;
  pricingTrialTitle: string;
  pricingTrialBody: string;
  pricingBookDemo: string;
  pricingStartTrial: string;
  pricingCompareTitle: string;
  pricingCompareSubtitle: string;
  pricingTableFeature: string;
  pricingFaqTitle: string;
  pricingFaqSubtitle: string;
  pricingFaqs: MarketingFaqItem[];
};

const faqSectionsEn: MarketingFaqSection[] = [
  {
    title: "1. Switching from Fresha or Salonized",
    items: [
      {
        q: "How easy is it to switch from Fresha or Salonized?",
        a: "It is incredibly simple. We offer a free migration service where we help you manually move your client list and service data to SoloHub. Most businesses are up and running in less than 10 minutes.",
      },
      {
        q: "Will you suddenly change your prices like other platforms?",
        a: "No. We have a Locked for Life promise for our Early Bird members. Our trust pledge also guarantees that we will never change pricing without at least 6 months prior notice.",
      },
      {
        q: "Do you charge a commission fee per booking?",
        a: "Absolutely not. Unlike marketplaces that can take up to 20% of your revenue, SoloHub is a management tool with a flat monthly fee. You keep 100% of what you earn.",
      },
    ],
  },
  {
    title: "2. Pricing and Plans",
    items: [
      {
        q: "Do your prices include BTW (VAT)?",
        a: "As standard for B2B services in the Netherlands, prices shown on our website exclude 21% BTW. This is clearly calculated and added on your monthly invoice.",
      },
      {
        q: "What is a Founding Member or Early Bird account?",
        a: "These are special accounts for our first 200 customers. By joining early, you lock in a significantly lower monthly rate for the lifetime of your account.",
      },
      {
        q: "Can I pay annually to save money?",
        a: "Yes. Choosing annual billing saves you approximately 20% compared to paying monthly.",
      },
    ],
  },
  {
    title: "3. Features and Team Management",
    items: [
      {
        q: "Can each of my staff members have their own login?",
        a: "Yes. Starting with the Hub plan, you can have up to 5 staff members, each with their own dedicated staff portal login and personal schedule.",
      },
      {
        q: "Does the automated reminder system really prevent no-shows?",
        a: "Yes. Our system sends reminders at 48h, 24h, and 2h before each appointment. For most users, preventing even one no-show per month covers the software cost.",
      },
      {
        q: "Can I use my own custom domain for the website?",
        a: "All plans include a free solohub.io subdomain. Our Pro plan lets you connect your own custom domain (for example, www.jouwsalon.nl) for a fully professional look.",
      },
    ],
  },
  {
    title: "4. Trust, Legal and Support",
    items: [
      {
        q: "Is SoloHub a Dutch company?",
        a: "Yes. SoloHub B.V. is fully registered with the Dutch Chamber of Commerce (KVK). We are built in the Netherlands specifically for the Dutch service market.",
      },
      {
        q: "How do you handle data and privacy (AVG/GDPR)?",
        a: "We take AVG compliance seriously. Personal data is hosted on secure EU servers (Frankfurt). We also provide a formal Data Processing Agreement (DPA/Verwerkersovereenkomst) in our terms.",
      },
      {
        q: "What kind of support do you offer?",
        a: "You get a direct line to the founders. We aim to respond to every support ticket within 2 hours during Dutch business hours. No chatbots, just real people who built the tool.",
      },
    ],
  },
  {
    title: "5. Trial and Cancellation",
    items: [
      {
        q: "Do I need a credit card to start the trial?",
        a: "No. You can try SoloHub for 14 days without entering any credit card details.",
      },
      {
        q: "What happens if I want to cancel?",
        a: "You can cancel anytime with no hidden fees or long-term contracts. You keep access to your features until the end of your current billing period.",
      },
    ],
  },
];

const faqSectionsNl: MarketingFaqSection[] = [
  {
    title: "1. Overstappen van Fresha of Salonized",
    items: [
      {
        q: "Hoe makkelijk is overstappen van Fresha of Salonized?",
        a: "Heel eenvoudig. We bieden een gratis migratieservice: we helpen je handmatig je klantenlijst en dienstgegevens naar SoloHub te verplaatsen. De meeste ondernemers zijn binnen 10 minuten live.",
      },
      {
        q: "Veranderen jullie de prijzen plotseling, zoals andere platforms?",
        a: "Nee. Early Bird-leden hebben een Locked for Life-belofte. We geven minimaal 6 maanden voorafgaand aan prijswijzigingen bericht.",
      },
      {
        q: "Rekenen jullie commissie per boeking?",
        a: "Nee. Anders dan marktplaatsen die tot 20% van je omzet nemen, is SoloHub een beheertool voor een vast maandbedrag. Jij houdt 100% van wat je verdient.",
      },
    ],
  },
  {
    title: "2. Prijzen en pakketten",
    items: [
      {
        q: "Zijn jullie prijzen inclusief BTW?",
        a: "Zoals gebruikelijk bij B2B-diensten in Nederland tonen we prijzen exclusief 21% BTW. Op je factuur wordt dit duidelijk verrekend.",
      },
      {
        q: "Wat is een Founding Member- of Early Bird-account?",
        a: "Speciale accounts voor onze eerste 200 klanten. Door vroeg mee te doen, vergrendel je een lager maandtarief voor de looptijd van je account.",
      },
      {
        q: "Kan ik jaarlijks betalen om te besparen?",
        a: "Ja. Jaarlijkse betaling bespaart ongeveer 20% ten opzichte van maandelijks.",
      },
    ],
  },
  {
    title: "3. Functies en teambeheer",
    items: [
      {
        q: "Kan elk teamlid een eigen login krijgen?",
        a: "Ja. Vanaf het Hub-pakket tot 5 medewerkers, elk met eigen medewerkersportaal en persoonlijke agenda.",
      },
      {
        q: "Voorkomt het automatische herinneringssysteem echt no-shows?",
        a: "Ja. We sturen herinneringen op 48u, 24u en 2u voor de afspraak. Voor veel gebruikers betaalt één voorkomen no-show al de software.",
      },
      {
        q: "Kan ik een eigen domein voor de website gebruiken?",
        a: "Alle pakketten bevatten een gratis solohub.io-subdomein. Met Pro koppel je je eigen domein (bijv. www.jouwsalon.nl).",
      },
    ],
  },
  {
    title: "4. Vertrouwen, juridisch en support",
    items: [
      {
        q: "Is SoloHub een Nederlands bedrijf?",
        a: "Ja. SoloHub B.V. staat ingeschreven bij de KVK. We bouwen in Nederland voor de Nederlandse dienstverleningsmarkt.",
      },
      {
        q: "Hoe gaan jullie om met data en privacy (AVG)?",
        a: "AVG nemen we serieus. Persoonsgegevens staan op beveiligde EU-servers (Frankfurt). In onze voorwaarden vind je een verwerkersovereenkomst.",
      },
      {
        q: "Welke support bieden jullie?",
        a: "Je hebt een directe lijn met de founders. We streven ernaar binnen 2 uur te reageren tijdens Nederlandse kantooruren. Geen chatbots.",
      },
    ],
  },
  {
    title: "5. Proefperiode en opzeggen",
    items: [
      {
        q: "Heb ik een creditcard nodig voor de proefperiode?",
        a: "Nee. Je kunt SoloHub 14 dagen proberen zonder creditcardgegevens.",
      },
      {
        q: "Wat als ik wil opzeggen?",
        a: "Opzeggen kan altijd, zonder verborgen kosten of lange contracten. Je behoudt toegang tot het einde van je betaalperiode.",
      },
    ],
  },
];

const pricingFaqsEn: MarketingFaqItem[] = [
  {
    q: "Is this price inclusive of VAT?",
    a: "As is standard for B2B SaaS in the Netherlands, all prices are displayed excluding 21% BTW.",
  },
  {
    q: "Can each staff member have their own login?",
    a: "Yes. Starting from our Hub plan, each team member gets a dedicated staff portal to manage their own schedules.",
  },
  {
    q: 'What is the "Locked for Life" promise?',
    a: "Early adopters are protected from future price increases. If you sign up during our launch phase, your monthly rate will stay the same even as we add more features.",
  },
  {
    q: "Do you charge commission on my bookings?",
    a: "No. Unlike competitors who take a percentage of your new clients, SoloHub charges a flat monthly fee so you keep 100% of your earnings.",
  },
  {
    q: "Do I need a credit card to start my 14-day trial?",
    a: "No. You can set up your website and start taking bookings immediately without entering any payment details.",
  },
  {
    q: "How easy is it to move my data from another tool?",
    a: "If you are currently using WhatsApp, paper, or another platform like Fresha, we provide migration assistance to help you move your core data quickly.",
  },
  {
    q: "Can my staff see my business revenue?",
    a: "No. Staff access is limited to their own schedule and notes. Sensitive financial data stays restricted to the owner dashboard.",
  },
  {
    q: "Do I need to buy a separate domain for my website?",
    a: "Every plan includes a free solohub.io subdomain. If your package includes custom domain support, you can connect your own brand domain too.",
  },
  {
    q: "Is there really no fee for new clients?",
    a: "Correct. SoloHub is a management tool, not a commission marketplace. You pay a flat monthly fee and keep every cent you earn.",
  },
];

const pricingFaqsNl: MarketingFaqItem[] = [
  {
    q: "Is deze prijs inclusief BTW?",
    a: "Zoals gebruikelijk bij B2B-SaaS in Nederland tonen we alle prijzen exclusief 21% BTW.",
  },
  {
    q: "Kan elk teamlid een eigen login krijgen?",
    a: "Ja. Vanaf ons Hub-pakket krijgt elk teamlid een eigen medewerkersportaal voor de eigen agenda.",
  },
  {
    q: 'Wat is de "Locked for Life"-belofte?',
    a: "Vroege gebruikers zijn beschermd tegen prijsstijgingen. Meld je aan in de launchfase en je maandtarief blijft gelijk terwijl we uitbreiden.",
  },
  {
    q: "Rekenen jullie commissie op mijn boekingen?",
    a: "Nee. Anders dan aanbieders die een percentage van nieuwe klanten nemen, rekent SoloHub een vast maandbedrag; jij houdt 100% van je inkomsten.",
  },
  {
    q: "Heb ik een creditcard nodig voor de proefperiode van 14 dagen?",
    a: "Nee. Je kunt direct je site en boekingen opzetten zonder betaalgegevens.",
  },
  {
    q: "Hoe makkelijk is data verplaatsen vanuit een andere tool?",
    a: "Gebruik je WhatsApp, papier of bijvoorbeeld Fresha, dan helpen we met migratie zodat je kerngegevens snel over zijn.",
  },
  {
    q: "Kunnen medewerkers mijn omzet zien?",
    a: "Nee. Medewerkers zien alleen eigen agenda en notities. Financiële data blijft bij het eigenaarsdashboard.",
  },
  {
    q: "Moet ik een apart domein kopen voor mijn website?",
    a: "Elk pakket heeft een gratis solohub.io-subdomein. Ondersteunt je pakket een eigen domein, dan koppel je je merkdomein.",
  },
  {
    q: "Is er echt geen fee voor nieuwe klanten?",
    a: "Klopt. SoloHub is een beheertool, geen commissiemarktplaats. Je betaalt een vast maandbedrag en houdt alles wat je verdient.",
  },
];

export const marketingEn: MarketingSection = {
  contactHeroTitle: "Contact the Founders",
  contactHeroSubtitle:
    "Whether you have a question about the multi-template website builder, staff portals, or the automated reminders, you have a direct line to the people who built the platform.",
  contactPromiseTitle: "Our Promise",
  contactPromiseBody:
    "We are a small, dedicated team based in the Netherlands. We aim to respond to all inquiries within 1 business day. Your success is our priority because your feedback directly drives our product roadmap.",
  contactAvgResponseLabel: "Average response time:",
  contactAvgResponseValue: "Under 4 hours",
  contactDirectTitle: "Direct Contact",
  contactWhatsAppTitle: "WhatsApp Chat",
  contactWhatsAppBody:
    "Chat with our support team in real-time via WhatsApp.",
  contactStartChat: "Start Chat",
  contactReadFaqs: "Read FAQs",
  contactPrivacyLink: "Privacy Policy",
  contactFormTitle: "Send us a message",
  contactFirstName: "First Name",
  contactLastName: "Last Name",
  contactWorkEmail: "Work Email",
  contactTopicLabel: "How can we help?",
  contactTopicPlaceholder: "Select a topic...",
  contactTopicSales: "Sales Inquiry",
  contactTopicSupport: "Technical Support",
  contactTopicBilling: "Billing Question",
  contactTopicOther: "Other",
  contactMessageLabel: "Message",
  contactMessagePlaceholder: "Tell us more about your inquiry...",
  contactSending: "Sending...",
  contactSend: "Send Message",
  contactSuccessTitle: "Message sent successfully",
  contactErrorTitle: "Could not send message",
  contactFormDisclaimerPrefix: "By submitting this form, you agree to our",
  contactThanksSent: "Thanks! Your message has been sent.",
  contactFailedSend: "Failed to send message",
  phFirstName: "Jane",
  phLastName: "Doe",
  phWorkEmail: "jane@company.com",
  faqPageTitle: "Frequently Asked Questions",
  faqPageSubtitle:
    "Got a question about SoloHub? Whether you're a solo professional looking to save time on admin or managing a growing team, you'll find the answers here. No chatbots—just honest answers from the founders.",
  faqSections: faqSectionsEn,
  pricingPaymentReceivedTitle:
    "Payment received. Thank you for subscribing to SoloHub.",
  pricingPaymentReceivedBody:
    "If you paid with iDEAL or another bank redirect, activation may finish shortly after Stripe webhook confirmation.",
  pricingCheckoutCancelledTitle: "Checkout was cancelled.",
  pricingCheckoutCancelledBody:
    "No charge was made. You can choose a plan and try again anytime.",
  pricingCheckoutFailedTitle: "Payment did not complete successfully.",
  pricingCheckoutFailedBody:
    "You were not charged. Please retry checkout or contact us for help.",
  pricingUnableCheckout: "Unable to start checkout. Please try again.",
  pricingHeroTitle: "Simple, Professional Pricing",
  pricingHeroSubtitle:
    "No commission, no hidden fees. All prices exclude 21% BTW.",
  pricingMonthly: "Monthly",
  pricingAnnually: "Annually",
  pricingSave20: "Save 20%",
  pricingToggleAria: "Toggle annual pricing",
  pricingMostPopular: "Most Popular",
  pricingRedirecting: "Redirecting...",
  pricingGetStarted: "Get Started",
  pricingSuffixMo: "/mo",
  pricingSuffixYr: "/yr",
  pricingTrialEyebrow: "Why a 14-day trial?",
  pricingTrialTitle: "See the value first, then decide with confidence",
  pricingTrialBody:
    "We want you to experience exactly how much time SoloHub saves before you pay a cent. During your trial, you get full access to your professional website, automated reminders, and staff portals. If it's not the perfect fit, you can walk away anytime, no questions asked.",
  pricingBookDemo: "Book a Demo",
  pricingStartTrial: "Start Free Trial",
  pricingCompareTitle: "Compare plans in detail",
  pricingCompareSubtitle: "Find the perfect plan for your business needs.",
  pricingTableFeature: "Feature",
  pricingFaqTitle: "Frequently Asked Questions",
  pricingFaqSubtitle: "Everything you need to know about billing and plans.",
  pricingFaqs: pricingFaqsEn,
};

export const marketingNl: MarketingSection = {
  contactHeroTitle: "Neem contact op met de founders",
  contactHeroSubtitle:
    "Vragen over de website-builder, medewerkersportalen of automatische herinneringen? Je praat direct met de mensen die het platform bouwen.",
  contactPromiseTitle: "Onze belofte",
  contactPromiseBody:
    "We zijn een klein, betrokken team in Nederland. We streven ernaar binnen 1 werkdag te reageren. Jouw succes stuurt onze roadmap.",
  contactAvgResponseLabel: "Gemiddelde responstijd:",
  contactAvgResponseValue: "Binnen 4 uur",
  contactDirectTitle: "Direct contact",
  contactWhatsAppTitle: "WhatsApp-chat",
  contactWhatsAppBody:
    "Chat realtime met ons team via WhatsApp.",
  contactStartChat: "Start chat",
  contactReadFaqs: "Lees FAQ",
  contactPrivacyLink: "Privacybeleid",
  contactFormTitle: "Stuur ons een bericht",
  contactFirstName: "Voornaam",
  contactLastName: "Achternaam",
  contactWorkEmail: "Werk e-mail",
  contactTopicLabel: "Waarmee kunnen we helpen?",
  contactTopicPlaceholder: "Kies een onderwerp...",
  contactTopicSales: "Salesvraag",
  contactTopicSupport: "Technische ondersteuning",
  contactTopicBilling: "Facturatie",
  contactTopicOther: "Anders",
  contactMessageLabel: "Bericht",
  contactMessagePlaceholder: "Vertel meer over je vraag...",
  contactSending: "Bezig met versturen...",
  contactSend: "Verstuur bericht",
  contactSuccessTitle: "Bericht succesvol verstuurd",
  contactErrorTitle: "Bericht kon niet worden verstuurd",
  contactFormDisclaimerPrefix: "Door dit formulier te versturen ga je akkoord met ons",
  contactThanksSent: "Bedankt! Je bericht is verstuurd.",
  contactFailedSend: "Bericht versturen mislukt",
  phFirstName: "Jan",
  phLastName: "Jansen",
  phWorkEmail: "jan@bedrijf.nl",
  faqPageTitle: "Veelgestelde vragen",
  faqPageSubtitle:
    "Vraag over SoloHub? Of je nu alleen werkt of een team hebt: hier vind je antwoorden. Geen chatbots — eerlijke antwoorden van de founders.",
  faqSections: faqSectionsNl,
  pricingPaymentReceivedTitle:
    "Betaling ontvangen. Bedankt voor je SoloHub-abonnement.",
  pricingPaymentReceivedBody:
    "Betaalde je met iDEAL of een andere bank-redirect, dan kan activatie kort na bevestiging door Stripe nog afronden.",
  pricingCheckoutCancelledTitle: "Afrekenen geannuleerd.",
  pricingCheckoutCancelledBody:
    "Er is niets afgeschreven. Kies een pakket en probeer het opnieuw wanneer je wilt.",
  pricingCheckoutFailedTitle: "Betaling niet voltooid.",
  pricingCheckoutFailedBody:
    "Je bent niet belast. Probeer opnieuw af te rekenen of neem contact op.",
  pricingUnableCheckout:
    "Afrekenen starten lukt niet. Probeer het opnieuw.",
  pricingHeroTitle: "Eenvoudige, professionele prijzen",
  pricingHeroSubtitle:
    "Geen commissie, geen verborgen kosten. Alle prijzen exclusief 21% BTW.",
  pricingMonthly: "Maandelijks",
  pricingAnnually: "Jaarlijks",
  pricingSave20: "Bespaar 20%",
  pricingToggleAria: "Schakel tussen maand- en jaartarief",
  pricingMostPopular: "Populairste",
  pricingRedirecting: "Doorsturen...",
  pricingGetStarted: "Aan de slag",
  pricingSuffixMo: "/mnd",
  pricingSuffixYr: "/jr",
  pricingTrialEyebrow: "Waarom 14 dagen proberen?",
  pricingTrialTitle: "Eerst waarde zien, daarna met vertrouwen kiezen",
  pricingTrialBody:
    "We willen dat je voelt hoeveel tijd SoloHub bespaart voordat je betaalt. Tijdens de proefperiode heb je volledige toegang tot je site, herinneringen en medewerkersportalen. Past het niet, dan stop je — geen gedoe.",
  pricingBookDemo: "Demo boeken",
  pricingStartTrial: "Start gratis proefperiode",
  pricingCompareTitle: "Vergelijk pakketten in detail",
  pricingCompareSubtitle: "Vind het pakket dat bij je bedrijf past.",
  pricingTableFeature: "Functie",
  pricingFaqTitle: "Veelgestelde vragen",
  pricingFaqSubtitle: "Alles over facturatie en pakketten.",
  pricingFaqs: pricingFaqsNl,
};
