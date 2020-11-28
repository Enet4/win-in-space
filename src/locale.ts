let currentLanguage = 'en';

const all_messages = {
    en: require(`../data/text/en.json`),
};

export function localized(messageId: string, language: string = currentLanguage): string {
    return all_messages[language][messageId] || `<<${messageId}>>`;
}
