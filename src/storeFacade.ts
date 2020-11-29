// since some environments such as a cross-site iframe 
// might not have localStorage, this provides a non-persistent workaround
const storage = {
    musicEnabled: null,
    getItem(key: string) {
        if (localStorage && localStorage.getItem) {
            return window.localStorage.getItem(key);
        }
        if (key === 'musicEnabled') {
            return this.musicEnabled;
        }
        return null;
    },
    setItem(key: string, value: string) {
        if (localStorage && localStorage.setItem) {
            return window.localStorage.setItem(key, value);
        }
        if (key === 'musicEnabled') {
            this.musicEnabled = value;
        }
    }
};

export default storage;
