interface FilterableMap<K, V> extends Map<K, V> {
  filteredView: (
    predicate: (value: V, key: K, map: FilterableMap<K, V>) => boolean
  ) => ReadonlyMap<K, V>;
}

class FilterableMap<K, V> extends Map<K, V> implements FilterableMap<K, V> {
  filteredView = (
    predicate: (value: V, key: K, map: FilterableMap<K, V>) => boolean
  ): ReadonlyMap<K, V> =>
    new Map(
      [...this.entries()].filter(([key, value]) => predicate(value, key, this))
    );
}
