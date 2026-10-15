export function assistantIdentityReply(question: string): string | null {
  const q = question.toLowerCase().trim().replace(/[?!.,]+$/g, '').trim();
  const identity = /^(?:who are you|who (?:made|created|built|developed) you|wie ben (?:jij|je)|wie heeft (?:jou|je) (?:gemaakt|gebouwd|ontwikkeld))$/;
  const model = /^(?:what (?:ai )?model (?:are you|do you use)|welk (?:ai )?model (?:gebruik (?:jij|je)|ben (?:jij|je))|are you (?:chatgpt|gpt)[\w .-]*|ben (?:jij|je) (?:chatgpt|gpt)[\w .-]*)$/;
  if (!identity.test(q) && !model.test(q)) return null;
  const dutch = /^(?:wie|welk|ben)\b/.test(q);
  const introduction = dutch
    ? 'Ik ben de Cloudy assistant, ingericht voor Cloudy door Dylano.'
    : 'I’m the Cloudy assistant, set up for Cloudy by Dylano.';
  return introduction + (model.test(q)
    ? dutch ? ' Ik kan hier geen exacte modelversie bevestigen.' : ' I can’t confirm an exact model version here.'
    : '');
}
