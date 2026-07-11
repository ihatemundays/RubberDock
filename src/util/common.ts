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

// Stable DOM ids linking each tab to its panel, so the two can be wired
// together as a proper ARIA tab group (aria-controls / aria-labelledby).
export const tabElementId = (id: string) => `rubber-dock-tab-${id}`;
export const itemElementId = (id: string) => `rubber-dock-item-${id}`;
