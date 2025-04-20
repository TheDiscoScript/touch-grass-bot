export function log(message: string) {
    if (process.env.LOG == 'true') {
        console.log(message);
    }
}

export function debug(message: string) {
    if (process.env.DEBUG == 'true') {
        console.debug(message);
    }
}
