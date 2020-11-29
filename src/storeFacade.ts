// since some environments such as a cross-site iframe 
// might not have localStorage, this provides a non-persistent workaround
const storage = {
    items: new Map(),
    getItem(key: string) {
        if (localStorage && localStorage.getItem) {
            return window.localStorage.getItem(key);
        }
        return this.items.get(key) || null;
    },
    setItem(key: string, value: string) {
        if (localStorage && localStorage.setItem) {
            return window.localStorage.setItem(key, value);
        }
        this.items.set(key, value);
    }
};

export default storage;
