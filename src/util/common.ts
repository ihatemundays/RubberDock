export enum GridGroupType {
    Column,
    Row
}

export enum GridPosition {
    Before,
    After
}

export const cx = (...classNames: Array<string | false | null | undefined>): string =>
    classNames.filter(Boolean).join(' ');
