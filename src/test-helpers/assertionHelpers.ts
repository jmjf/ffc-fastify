export function between<T>(val: T, fromVal: T, toVal: T): boolean {
    return (val >= fromVal && val <= toVal);
}