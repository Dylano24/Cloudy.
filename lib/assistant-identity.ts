export function assistantIdentityReply(question: string): string | null {
  const q = question.toLowerCase().trim().replace(/[?!.,]+$/g, '').trim();
  const headcount = (/\bcloudy\b/.test(q)
    || /^(?:how many (?:employees|staff(?: members)?|workers|people)(?: (?:are there|work here|work for you|do you have))?|hoeveel (?:werknemers|medewerkers|mensen)(?: (?:werken hier|zijn er|hebben jullie))?|combien (?:d’employés|d'employés|de personnes)(?: travaillent ici)?)$/.test(q))
    && /\b(?:how many|headcount|number of|hoeveel|aantal|combien|nombre)\b/.test(q)
    && /\b(?:employees|workers|staff|people|werknemers|medewerkers|personeel|mensen|employés|employes|salariés|salaries|personnes)\b/.test(q);
  if (headcount) {
    if (/\b(?:hoeveel|aantal)\b/.test(q)) return 'Het aantal werknemers bij Cloudy Inc. is niet bekend. Doriane is founder en owner, en daarnaast managing director. Dylano is owner en lead developer. Hun eigenaarschap zegt niets over het aantal werknemers.';
    if (/\b(?:combien|nombre)\b/.test(q)) return 'Le nombre de personnes employées par Cloudy Inc. n’est pas vérifié. Doriane est la fondatrice et propriétaire, ainsi que directrice générale. Dylano est propriétaire et développeur principal. Leur statut de propriétaires ne permet pas de déduire le nombre de salariés.';
    return 'The number of employees at Cloudy Inc. has not been verified. Doriane is Founder and Owner, and also Managing Director. Dylano is Owner and Lead Developer. Their ownership does not establish an employee count.';
  }
  const identity = /^(?:who are you|who (?:made|created|built|developed) (?:you|u|cloudy assistant|the cloudy assistant)|wie ben (?:jij|je)|wie heeft (?:jou|je) (?:gemaakt|gebouwd|ontwikkeld))$/;
  const model = /^(?:what (?:ai )?model (?:are you|do you use)|welk (?:ai )?model (?:gebruik (?:jij|je)|ben (?:jij|je))|are you (?:chatgpt|gpt)[\w .-]*|ben (?:jij|je) (?:chatgpt|gpt)[\w .-]*)$/;
  if (!identity.test(q) && !model.test(q)) return null;
  const dutch = /^(?:wie|welk|ben)\b/.test(q);
  const introduction = dutch
    ? 'Ik ben de Cloudy assistant, gemaakt en ingericht door Dylano, owner en lead developer van Cloudy Inc. Hij heeft ook de Cloudy-website, Cloudy bot en de technische systemen van Cloudy gemaakt.'
    : 'I’m Cloudy Assistant, created and set up by Dylano, owner and lead developer of Cloudy Inc. He also created the Cloudy website, Cloudy bot, and Cloudy’s technical systems.';
  return introduction + (model.test(q)
    ? dutch ? ' Ik kan hier geen exacte modelversie bevestigen.' : ' I can’t confirm an exact model version here.'
    : '');
}
