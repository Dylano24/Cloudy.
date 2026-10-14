export type HelpLink = { label: string; href: string };
export type HelpEntry = { id: string; title: string; answer: string; keywords: string[]; links: HelpLink[]; source: string };
export type HelpResult = { kind: 'answer' | 'clarify' | 'unknown'; entries: HelpEntry[] };

function normalize(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Retrieve approved prose only. This function never generates an answer. */
export function findHelp(question: string): HelpResult {
  if (!question.trim() || question.length > 1000) return { kind: 'unknown', entries: [] };
  const query = normalize(question);
  if (/\bignore (?:all )?(?:previous )?instructions\b/.test(query)) return { kind: 'unknown', entries: [] };
  const padded = ` ${query} `;
  const ranked = helpEntries.map(entry => {
    const score = entry.keywords.reduce((total, keyword) => {
      const phrase = normalize(keyword);
      if (!padded.includes(` ${phrase} `)) return total;
      return total + (phrase.includes(' ') ? 30 + phrase.split(' ').length : 12);
    }, 0);
    return { entry, score };
  }).filter(match => match.score > 0).sort((a, b) => b.score - a.score);

  if (!ranked.length) return { kind: 'unknown', entries: [] };
  const best = ranked[0];
  const candidates = ranked.filter(match => match.score >= best.score - 5).slice(0, 4).map(match => match.entry);
  // A refusal such as "I don't want a refund" is not a refund request.
  // Missing deliveries and outages necessarily contain negative wording.
  const negative = /\b(?:not|dont|don t|no|niet|geen)\b/.test(query);
  if (candidates.length > 1 || (negative && !['missing-delivery', 'service-availability'].includes(best.entry.id))) {
    return { kind: 'clarify', entries: candidates };
  }
  return { kind: 'answer', entries: [best.entry] };
}

// Legal prose is copied verbatim from the approved website pages. No external knowledge.
export const helpEntries: HelpEntry[] = [
  {
    "id": "missing-delivery",
    "title": "Product not received",
    "answer": "Cloudy’s Store terms say digital products are normally delivered immediately after successful payment, except for technical or processing issues. Delivery also requires the correct linked account or purchase information. Check that your payment succeeded and that you used the correct account details.",
    "keywords": [
      "not received",
      "not receive",
      "did not get",
      "didnt receive",
      "haven't received",
      "have not received",
      "never received",
      "purchase is missing",
      "product is missing",
      "kit is missing",
      "niet ontvangen",
      "niet gekregen",
      "niet geleverd",
      "aankoop ontbreekt",
      "where is my order",
      "where is my purchase",
      "waar is mijn bestelling"
    ],
    "links": [
      {
        "label": "Contact Cloudy support",
        "href": "/support"
      },
      {
        "label": "Open Discord",
        "href": "https://discord.gg/EGDVMmmSzF"
      },
      {
        "label": "Payments and delivery terms",
        "href": "/terms-of-sale"
      }
    ],
    "source": "Store terms of sale · 3. Payments and Delivery; Support & Help"
  },
  {
    "id": "store",
    "title": "Store & products",
    "answer": "Browse the Cloudy Store to see the available digital products, servers and kits. Open a product for its current details, then add it to your basket. The product page and checkout show the current purchase information.",
    "keywords": [
      "store",
      "shop",
      "buy",
      "purchase",
      "product",
      "products",
      "kit",
      "kits",
      "price",
      "prices",
      "cost",
      "kopen",
      "winkel",
      "aankoop",
      "producten",
      "prijs",
      "prijzen"
    ],
    "links": [
      {
        "label": "Visit the store",
        "href": "/shop"
      }
    ],
    "source": "Store; product pages; homepage"
  },
  {
    "id": "basket",
    "title": "Your basket",
    "answer": "Open your basket to review the products you have selected and continue to checkout.",
    "keywords": [
      "basket",
      "cart",
      "shopping cart",
      "winkelmand",
      "winkelmandje",
      "mandje"
    ],
    "links": [
      {
        "label": "Open basket",
        "href": "/cart"
      },
      {
        "label": "Visit the store",
        "href": "/shop"
      }
    ],
    "source": "Website basket"
  },
  {
    "id": "checkout",
    "title": "Checkout & payment",
    "answer": "Start checkout from your basket. Follow the checkout steps and provide the account information required for your selected product. Cloudy’s Store terms require accurate purchase information for delivery.",
    "keywords": [
      "checkout",
      "pay",
      "payment",
      "payments",
      "betalen",
      "betaling",
      "afrekenen"
    ],
    "links": [
      {
        "label": "Open basket",
        "href": "/cart"
      },
      {
        "label": "Open checkout",
        "href": "/checkout"
      },
      {
        "label": "Store terms of sale",
        "href": "/terms-of-sale"
      }
    ],
    "source": "Checkout; Store terms of sale · 3. Payments and Delivery"
  },
  {
    "id": "payment-methods",
    "title": "Payment methods",
    "answer": "The homepage lists Visa, Mastercard, PayPal, Apple Pay and Google Pay. Check the available options at checkout for your purchase.",
    "keywords": [
      "payment methods",
      "payment method",
      "paypal",
      "visa",
      "mastercard",
      "apple pay",
      "google pay",
      "betaalmethoden",
      "betaalmethode"
    ],
    "links": [
      {
        "label": "Open basket",
        "href": "/cart"
      }
    ],
    "source": "Homepage · Secure payments"
  },
  {
    "id": "appeal",
    "title": "Appeal a moderation action",
    "answer": "Use the Appeal page to request a review of a Discord or Rust server moderation action.",
    "keywords": [
      "appeal",
      "appeals",
      "ban",
      "banned",
      "mute",
      "unban",
      "beroep",
      "bezwaar",
      "verbannen",
      "ban appeal"
    ],
    "links": [
      {
        "label": "Open appeal form",
        "href": "/appeal"
      }
    ],
    "source": "Appeal page"
  },
  {
    "id": "support",
    "title": "Contact support",
    "answer": "The Support & Help page directs you to the official Cloudy Discord to contact the community and support team.",
    "keywords": [
      "support",
      "help",
      "contact",
      "staff",
      "team",
      "ticket",
      "tickets",
      "hulp",
      "ondersteuning",
      "medewerker"
    ],
    "links": [
      {
        "label": "Support & Help",
        "href": "/support"
      },
      {
        "label": "Join Cloudy Discord",
        "href": "https://discord.gg/EGDVMmmSzF"
      }
    ],
    "source": "Support & Help page"
  },
  {
    "id": "discord",
    "title": "Join Cloudy Discord",
    "answer": "Join the official Cloudy Discord for server updates, community news and support.",
    "keywords": [
      "discord",
      "discord invite",
      "discord link",
      "community",
      "join discord"
    ],
    "links": [
      {
        "label": "Join Cloudy Discord",
        "href": "https://discord.gg/EGDVMmmSzF"
      }
    ],
    "source": "Homepage · Join the community; Support & Help"
  },
  {
    "id": "servers",
    "title": "Servers & kits",
    "answer": "The homepage’s Rust card links to the Store to view servers and kits. Open the Store for the current available options. Server connection details and schedules are not loaded in this assistant; use the official Discord for those details.",
    "keywords": [
      "server",
      "servers",
      "rust",
      "connect",
      "connection",
      "server ip",
      "server address",
      "verbinden",
      "servernaam",
      "server name"
    ],
    "links": [
      {
        "label": "View servers & kits",
        "href": "/shop"
      },
      {
        "label": "Open Cloudy Discord",
        "href": "https://discord.gg/EGDVMmmSzF"
      }
    ],
    "source": "Homepage · Rust; Store"
  },
  {
    "id": "discord-rules",
    "title": "Discord & Rust rules",
    "answer": "The Terms of Service refer to separate official Discord Rules and Rust Server Rules. Their full text is not loaded in this website assistant, so I cannot state specific gameplay or Discord rules. Please read the official rules in Cloudy Discord.",
    "keywords": [
      "rules",
      "rule",
      "discord rules",
      "rust rules",
      "server rules",
      "regeltjes",
      "regels",
      "regel"
    ],
    "links": [
      {
        "label": "Open Cloudy Discord",
        "href": "https://discord.gg/EGDVMmmSzF"
      },
      {
        "label": "Terms of service",
        "href": "/terms"
      }
    ],
    "source": "Terms of Service · 1. Introduction; existing Cloudy FAQ assistant source list"
  },
  {
    "id": "faq",
    "title": "FAQ & Discord assistant",
    "answer": "The Cloudy Discord has a FAQ support assistant with an “Ask a question” button. Its full FAQ content is not loaded in this website assistant. Open the official Discord for the existing FAQ and assistant.",
    "keywords": [
      "faq",
      "assistant",
      "faq assistant",
      "veelgestelde vragen"
    ],
    "links": [
      {
        "label": "Open Cloudy Discord",
        "href": "https://discord.gg/EGDVMmmSzF"
      }
    ],
    "source": "Existing Cloudy FAQ assistant · src/services/faqAiService.js"
  },
  {
    "id": "zorp",
    "title": "ZORP Guide",
    "answer": "The existing Cloudy FAQ assistant uses an official ZORP Guide. That guide’s contents are not loaded in this website assistant, so I cannot provide its commands or protection rules. Open the official Cloudy Discord to read the ZORP Guide.",
    "keywords": [
      "zorp",
      "zorp guide",
      "zone protection",
      "zone-protection"
    ],
    "links": [
      {
        "label": "Open Cloudy Discord",
        "href": "https://discord.gg/EGDVMmmSzF"
      }
    ],
    "source": "Existing Cloudy FAQ assistant source list · ZORP Guide"
  },
  {
    "id": "sale-introduction",
    "title": "Introduction",
    "answer": "These Store terms of sale (\"Store terms\") govern all purchases made through our online store, including digital products, subscriptions, virtual content, and any other service offered through our platform.\n\nBy making a purchase, you agree to these Store terms.",
    "keywords": [
      "terms of sale",
      "store terms",
      "store conditions",
      "verkoopvoorwaarden",
      "terms"
    ],
    "links": [
      {
        "label": "Store terms of sale",
        "href": "/terms-of-sale"
      },
      {
        "label": "Contact support",
        "href": "/support"
      }
    ],
    "source": "Store terms of sale · 1. Introduction"
  },
  {
    "id": "sale-digital-products",
    "title": "Digital products and services",
    "answer": "All products available through our store are digital services provided online.\n\nThese products may include, but are not limited to:\n\nSubscriptions;\nEquipment, items, or content directly usable in game;\nDigital rewards;\nAny other virtual service or benefit related to our services.\n\nDigital products are not physical goods and do not involve the delivery of any real world items.",
    "keywords": [
      "digital products",
      "physical goods",
      "digital services",
      "digitale producten",
      "physical",
      "fysiek"
    ],
    "links": [
      {
        "label": "Store terms of sale",
        "href": "/terms-of-sale"
      },
      {
        "label": "Contact support",
        "href": "/support"
      }
    ],
    "source": "Store terms of sale · 2. Digital products and services"
  },
  {
    "id": "sale-delivery",
    "title": "Payments and Delivery",
    "answer": "Payments are processed through the payment providers available on our store.\n\nOnce payment has been successfully completed, the purchased digital product or service is normally delivered immediately through our Services, except in the event of a technical issue, processing error, or any other situation beyond our reasonable control.\n\nDelivery also requires that the user has correctly linked their account or provided the information necessary for the purchased service to function properly.\n\nThe user is responsible for ensuring that the information provided during the purchase is accurate.",
    "keywords": [
      "delivery",
      "levering",
      "payment processing",
      "how long",
      "hoe lang",
      "delivered",
      "geleverd"
    ],
    "links": [
      {
        "label": "Store terms of sale",
        "href": "/terms-of-sale"
      },
      {
        "label": "Contact support",
        "href": "/support"
      }
    ],
    "source": "Store terms of sale · 3. Payments and Delivery"
  },
  {
    "id": "sale-one-time",
    "title": "One time purchases",
    "answer": "Some products available in our store may be offered as one time purchases, requiring a single payment without automatic renewal.\n\nThese products may include, without limitation, permanent access, passes, equipment, items, or any other digital content available through our Services.\n\nOnce the purchase has been completed and the product has been delivered, the user retains access to this content according to the conditions defined at the time of purchase, except in cases where changes are necessary for technical, security, maintenance, service evolution reasons, or in cases of abuse, fraud, or violation of our Terms or Rules.\n\nA one time purchase does not constitute a subscription and does not involve recurring payments.",
    "keywords": [
      "one time",
      "one-time",
      "permanent access",
      "single payment",
      "eenmalig"
    ],
    "links": [
      {
        "label": "Store terms of sale",
        "href": "/terms-of-sale"
      },
      {
        "label": "Contact support",
        "href": "/support"
      }
    ],
    "source": "Store terms of sale · 4. One time purchases"
  },
  {
    "id": "sale-subscriptions",
    "title": "Subscriptions and Cancellation",
    "answer": "Some products may be offered as recurring subscriptions.\n\nSubscriptions are automatically renewed according to the selected billing period unless cancelled by the user before the next renewal date.\n\nThe user may stop their subscription at any time in order to prevent future charges.\n\nStopping a subscription only applies to future renewals and does not remove benefits already granted during the remaining paid period.\n\nWe reserve the right to modify subscription prices, features, or conditions at any time.\n\nAny modification affecting an existing subscription will only apply from the next renewal period and will not affect the current paid period.\n\nThe user remains free to continue their subscription under the new conditions or cancel it before the next renewal.",
    "keywords": [
      "subscription",
      "subscriptions",
      "cancel",
      "cancellation",
      "renewal",
      "abonnement",
      "abonnementen",
      "opzeggen",
      "automatically renewed"
    ],
    "links": [
      {
        "label": "Store terms of sale",
        "href": "/terms-of-sale"
      },
      {
        "label": "Contact support",
        "href": "/support"
      }
    ],
    "source": "Store terms of sale · 5. Subscriptions and Cancellation"
  },
  {
    "id": "sale-refunds",
    "title": "Refund policy",
    "answer": "All purchases made through our store concern digital services provided online.\n\nOne time purchases as well as subscriptions are delivered electronically through our Services. Once a digital product, content, virtual equipment, benefit, or access has been delivered or activated, refunds are generally not available, except where required by applicable law.\n\nBy completing a purchase, the user acknowledges that the service may begin immediately after payment and accepts that the digital nature of the product may limit the possibility of cancellation or refund.\n\nNothing in these Store Terms limits mandatory consumer rights that cannot legally be excluded.",
    "keywords": [
      "refund",
      "refunds",
      "refund policy",
      "terugbetaling",
      "geld terug",
      "restitutie"
    ],
    "links": [
      {
        "label": "Store terms of sale",
        "href": "/terms-of-sale"
      },
      {
        "label": "Contact support",
        "href": "/support"
      }
    ],
    "source": "Store terms of sale · 6. Refund policy"
  },
  {
    "id": "sale-disputes",
    "title": "Fraud, Abuse and Payment disputes",
    "answer": "Any attempt to commit fraud, misuse the payment system, or initiate an unjustified payment dispute may result in restrictions or removal of access to our Services.\n\nPurchased benefits may be removed if they were obtained through fraud, payment abuse, or actions that violate our Terms or Rules.",
    "keywords": [
      "chargeback",
      "payment dispute",
      "fraud",
      "fraude",
      "betalingsgeschil"
    ],
    "links": [
      {
        "label": "Store terms of sale",
        "href": "/terms-of-sale"
      },
      {
        "label": "Contact support",
        "href": "/support"
      }
    ],
    "source": "Store terms of sale · 7. Fraud, Abuse and Payment disputes"
  },
  {
    "id": "sale-changes",
    "title": "Changes to store services",
    "answer": "We reserve the right to modify, replace, or remove certain products, prices, subscriptions, or benefits available in our store at any time.\n\nThese changes will not affect purchases that have already been completed, unless required for legal, technical, or security reasons.",
    "keywords": [
      "store changes",
      "price changes",
      "product removed",
      "prijswijziging",
      "product changes"
    ],
    "links": [
      {
        "label": "Store terms of sale",
        "href": "/terms-of-sale"
      },
      {
        "label": "Contact support",
        "href": "/support"
      }
    ],
    "source": "Store terms of sale · 8. Changes to store services"
  },
  {
    "id": "sale-liability",
    "title": "Limitation of liability",
    "answer": "We shall not be held responsible for any temporary loss of access to purchased products, services, or benefits resulting from technical issues, server maintenance, game updates, platform related issues, or circumstances beyond our reasonable control.\n\nWe do not guarantee that certain features, benefits, or content will remain permanently available if changes are required for technical, operational, or security reasons.",
    "keywords": [
      "store liability",
      "purchased benefits unavailable",
      "aansprakelijkheid aankopen"
    ],
    "links": [
      {
        "label": "Store terms of sale",
        "href": "/terms-of-sale"
      },
      {
        "label": "Contact support",
        "href": "/support"
      }
    ],
    "source": "Store terms of sale · 9. Limitation of liability"
  },
  {
    "id": "service-introduction",
    "title": "Introduction",
    "answer": "These Terms of Service (\"Terms\") govern access to and use of our Discord community, Rust game servers, website, online store, and any related services operated by us (collectively referred to as the \"Services\").\n\nBy accessing or using our Services, you agree to be bound by these Terms. Our Discord Rules and Rust Server Rules are separate documents that define additional requirements regarding community behavior and gameplay rules. These rules form an integral part of our general operating guidelines.",
    "keywords": [
      "terms of service",
      "service terms",
      "algemene voorwaarden",
      "voorwaarden",
      "terms"
    ],
    "links": [
      {
        "label": "Terms of service",
        "href": "/terms"
      },
      {
        "label": "Contact support",
        "href": "/support"
      }
    ],
    "source": "Terms of service · 1. Introduction"
  },
  {
    "id": "service-conduct",
    "title": "Community Conduct",
    "answer": "Users must comply with our Discord Rules and Rust Server Rules available on our official platforms. Any behavior that negatively impacts the community, the operation of our Services, or the experience of other users may result in administrative action.",
    "keywords": [
      "community conduct",
      "community behavior",
      "gedrag",
      "gedragsregels"
    ],
    "links": [
      {
        "label": "Terms of service",
        "href": "/terms"
      },
      {
        "label": "Contact support",
        "href": "/support"
      }
    ],
    "source": "Terms of service · 2. Community Conduct"
  },
  {
    "id": "service-availability",
    "title": "Service Availability",
    "answer": "Our Services are provided \"as is\" and according to their availability. While we make reasonable efforts to maintain reliable access to our Services, we cannot guarantee permanent and uninterrupted availability.\n\nTemporary interruptions, periods of unavailability, maintenance, or technical issues may occur, including but not limited to:\n\n• Hosting provider failures\n• Server maintenance\n• Discord outages\n• PlayStation Network or Xbox Network outages\n• Issues related to Internet infrastructure\n• Third party service failures\n• Payment provider issues\n• Cybersecurity incidents or DDoS attacks",
    "keywords": [
      "server down",
      "not working",
      "offline",
      "outage",
      "maintenance",
      "storing",
      "onderhoud",
      "server werkt niet",
      "availability"
    ],
    "links": [
      {
        "label": "Terms of service",
        "href": "/terms"
      },
      {
        "label": "Contact support",
        "href": "/support"
      }
    ],
    "source": "Terms of service · 3. Service Availability"
  },
  {
    "id": "service-wipes",
    "title": "Wipes, Rollbacks and Data Loss",
    "answer": "Rust servers may be subject to scheduled wipes, emergency wipes, rollbacks, technical issues, or unexpected data loss. These situations may result in the loss of in game items, bases, inventories, progression, statistics, or any other digital content.\n\nUsers acknowledge that online gaming services may experience technical limitations and that these events may occur despite reasonable measures taken to prevent them.",
    "keywords": [
      "wipe",
      "wipes",
      "rollback",
      "rollbacks",
      "data loss",
      "lost inventory",
      "lost base",
      "dataverlies"
    ],
    "links": [
      {
        "label": "Terms of service",
        "href": "/terms"
      },
      {
        "label": "Contact support",
        "href": "/support"
      }
    ],
    "source": "Terms of service · 4. Wipes, Rollbacks and Data Loss"
  },
  {
    "id": "service-liability",
    "title": "Limitation of Liability",
    "answer": "To the extent permitted by applicable law, we shall not be held liable for, including but not limited to:\n\n• Loss of in game content or progression\n• Temporary service interruptions\n• Failures of our hosting provider or third party platforms\n• Data loss\n• Indirect damages resulting from the use of our Services\n\nAt our sole discretion, and without any obligation on our part, we may decide to provide compensation, extensions, or any other goodwill gesture in exceptional circumstances. Providing compensation in one situation does not create any obligation to provide compensation in future situations.",
    "keywords": [
      "compensation",
      "goodwill",
      "service liability",
      "compensatie",
      "aansprakelijkheid"
    ],
    "links": [
      {
        "label": "Terms of service",
        "href": "/terms"
      },
      {
        "label": "Contact support",
        "href": "/support"
      }
    ],
    "source": "Terms of service · 5. Limitation of Liability"
  },
  {
    "id": "service-administration",
    "title": "Administrative Actions",
    "answer": "We reserve the right to take appropriate measures whenever necessary to protect our community, our Services, and our users. Depending on the circumstances, these measures may include restricting access to certain features, removing benefits obtained or used abusively, suspending access, or permanently denying access to our Services.\n\nAdministrative decisions are made based on each individual situation and remain at our reasonable discretion.",
    "keywords": [
      "administrative action",
      "suspension",
      "restrictions",
      "moderation policy",
      "moderatiebeleid"
    ],
    "links": [
      {
        "label": "Terms of service",
        "href": "/terms"
      },
      {
        "label": "Contact support",
        "href": "/support"
      }
    ],
    "source": "Terms of service · 6. Administrative Actions"
  },
  {
    "id": "service-changes",
    "title": "Changes to These Terms",
    "answer": "We reserve the right to modify these Terms at any time. The most recent version published on our official website or official Discord server will always be considered the applicable version. Continued use of our Services after changes to these Terms constitutes acceptance of the updated conditions.",
    "keywords": [
      "terms changes",
      "updated terms",
      "voorwaarden wijzigen"
    ],
    "links": [
      {
        "label": "Terms of service",
        "href": "/terms"
      },
      {
        "label": "Contact support",
        "href": "/support"
      }
    ],
    "source": "Terms of service · 7. Changes to These Terms"
  },
  {
    "id": "service-law",
    "title": "Governing Law",
    "answer": "These Terms shall be governed and interpreted in accordance with French law. These Terms apply to all users worldwide. However, mandatory consumer protection rights provided by the applicable laws of the user's country of residence remain applicable where required by law.",
    "keywords": [
      "governing law",
      "french law",
      "toepasselijk recht",
      "frans recht"
    ],
    "links": [
      {
        "label": "Terms of service",
        "href": "/terms"
      },
      {
        "label": "Contact support",
        "href": "/support"
      }
    ],
    "source": "Terms of service · 8. Governing Law"
  }
];

