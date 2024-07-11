export function log(message: string) {
    if (process.env.LOG === 'true') {
        console.log(message);
    }
}
