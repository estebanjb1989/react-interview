export function mergeLists<T extends { id: number; dirty: boolean }>(
    local: T[],
    server: T[]
): T[] {
    const map = new Map<number, T>();

    for (const s of server) {
        map.set(s.id, s);
    }

    for (const l of local) {
        const serverItem = map.get(l.id);

        if (l.dirty) {
            const wasSynced = !!serverItem;

            map.set(l.id, {
                ...(serverItem ?? {}),
                ...l,
                dirty: !wasSynced,
            });

            continue;
        }

        if (!serverItem) {
            map.set(l.id, l);
        }
    }

    return Array.from(map.values());
}
