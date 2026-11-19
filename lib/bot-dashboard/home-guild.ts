// Cloudy Inc.'s own Discord server. Cloudy's house rules (fixed log channels,
// its own welcome card, the four staff roles) apply there only; every other
// server is a customer's and configures everything itself.
export const CLOUDY_HOME_GUILD_ID = '1532882647838228723';
export const isCloudyHomeGuild = (guildId: string) => guildId === CLOUDY_HOME_GUILD_ID;
