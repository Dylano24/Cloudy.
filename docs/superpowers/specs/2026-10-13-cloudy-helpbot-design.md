# Cloudy website helpbot

## Doel en plaatsing
Een kleine Cloudy helpknop rechtsonder op de homepage opent een chatvenster. Het venster past bij de huidige zwarte website, met witte tekst en rode accenten. De bestaande pagina-inhoud en effecten blijven intact. Op mobiel past het venster binnen het scherm. Het opent alleen na klikken, sluit met de sluitknop of Escape en ondersteunt toetsenbordbediening.

## Informatie die hij mag gebruiken
Alleen officiële Cloudy-informatie die de eigenaar heeft aangewezen: de website, FAQ, Rules, Terms of Service, Store terms of sale en ZORP Guide. Deze vijf Discord-bronnen zijn bevestigd in de bestaande botcode, src/services/faqAiService.js. De berichten zelf zijn nog niet beschikbaar in deze chat. De website bevat de voorwaarden en aankoopinformatie al.

Geen algemene internetkennis, verzonnen regels, prijzen, wachttijden, serverinstellingen of toezeggingen. Een ontbrekend antwoord wordt expliciet als onbekend behandeld, met een link naar de passende pagina of Cloudy-support. Discord-informatie wordt pas opgenomen zodra de officiële inhoud beschikbaar is; kanaalnamen zijn geen vervanging voor de inhoud.

## Werking zonder externe AI-API
Een lokale kennisbank bevat goedgekeurde antwoorden, onderwerpen, zoektermen en bronlinks. De bezoeker kan typen of onderwerpen aanklikken. De matcher zoekt daarin; bij twijfel biedt hij relevante onderwerpen aan of verwijst hij naar support. Hij genereert geen nieuwe feiten. Een losse kennisbank maakt latere aanvullingen mogelijk zonder de interface te wijzigen.

De eerste versie gebruikt geen externe AI-service. Dit is een supportassistant met begrensde zoek- en antwoordmogelijkheden, geen taalmodel dat willekeurige vragen kan begrijpen.

## Websitehulp en aankopen
- Wegwijzen naar Store, winkelmand, checkout, Appeal, Support en beide voorwaardenpagina's.
- Uitleg over digitale producten, betaling, levering, abonnementen en terugbetalingen volgens de gepubliceerde Store terms.
- Bij niet ontvangen producten: wijzen op de voorwaarden rond geslaagde betaling en juiste accountgegevens, en toegang bieden tot Cloudy-support voor onderzoek.
- Appeals: verwijzen naar het bestaande formulier voor Discord of Rust.
- Discord, FAQ, regels en ZORP: officiële goedgekeurde informatie gebruiken zodra beschikbaar; anders naar de officiële Discord verwijzen.

De assistant leest geen privébestellingen, voert geen aankoop uit, verleent geen refund en beoordeelt geen appeal. De huidige website heeft geen beveiligd endpoint voor persoonlijke bestellingstatus; hij mag dus geen status suggereren. Hij vraagt niet om wachtwoorden of betaalgegevens. Chatvragen worden niet naar een AI-dienst gestuurd en niet permanent opgeslagen.

## Technische afbakening
Nieuwe geïsoleerde clientcomponent, eigen CSS-module en lokale kennisbank met zoekfunctie. Alleen de homepage krijgt de widget. Geen wijzigingen aan checkout, betalingen, Discord-bot of bestaande pagina's buiten het plaatsen van de component.

## Controle voor publicatie
Controleer juiste links en antwoorden, onbekende vragen, dubbelzinnige vragen, niet ontvangen producten, brongetrouwheid, typen en onderwerpknoppen, sluiten en focus, mobiel formaat, TypeScript en productiebuild. Vergelijk de bestaande homepage om onbedoelde veranderingen uit te sluiten.
