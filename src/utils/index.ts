export function createPageUrl(pageName: string) {
    return '/' + pageName.replace(/ /g, '-');
}

export function extractHostnames(urls: string[]): (string | null)[] {
    return urls.map(url => {
        try {
            const parsed = new URL(url.includes('://') ? url : 'http://' + url);
            return parsed.hostname;
        } catch (_e) {
            return null;
        }
    });
}