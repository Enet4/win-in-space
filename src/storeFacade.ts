// since some environments such as a cross-site iframe 
// might not have localStorage, this provides a non-persistent workaround
export default (typeof window.localStorage === 'object') ? window.localStorage : {
    musicEnabled: null,
    getItem(key: string) {
        if (key === 'musicEnabled') {
            return this.musicEnabled;
        }
        return null;
    },
    setItem(key: string, value: string) {
        if (key === 'musicEnabled') {
            this.musicEnabled = value;
        }
    }
};