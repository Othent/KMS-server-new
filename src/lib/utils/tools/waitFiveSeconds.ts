
export function waitFiveSeconds(): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, 5000);
    });
}
