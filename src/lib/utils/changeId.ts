export function changeId(originalId: string): string {
    let newId = originalId.replace('|', '0');
    newId = newId.replace('-', '0');
    return newId;
}

export function revertId(newId: string): string {
    return newId.replace('!', '|');
}
