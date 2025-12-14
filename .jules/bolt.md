## 2024-05-22 - Consistent Style Memoization
**Learning:** `createStyles(theme)` is commonly used in functional components. When not memoized with `useMemo`, it recreates the stylesheet on every render (e.g. during text input typing), causing unnecessary object allocations and potentially layout recalculations. This is especially critical in forms or complex lists.
**Action:** Always use `useMemo(() => createStyles(theme), [theme])` when using dynamic themes in components with frequent re-renders.
