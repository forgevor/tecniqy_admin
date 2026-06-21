/**
 * useAdminMetrics — fetch compartido del overview del backend admin.
 *
 * `useAsyncData` con una key fija ('admin-metrics-overview') hace que
 * Nuxt deduplique automáticamente: si el layout, la sidebar y la página
 * de Usuarios consumen este composable, se hace UN solo HTTP request
 * por navegación. Refresh manual via `refresh()`.
 *
 * Forma del response (ver MetricsOverviewResponse.java):
 *   - totalTechnicians          → técnicos activos (excluye admins)
 *   - activeTechnicians         → status=ACTIVE
 *   - trialTechnicians          → status=TRIAL
 *   - overdueTechnicians        → status=OVERDUE
 *   - newTechniciansLast30Days  → registros últimos 30 días
 *   - mrr                       → revenue mensual estimado en MXN
 *                                 (ACTIVE & MONTHLY × 69 + ACTIVE & ANNUAL × 690/12).
 *                                 null solo si Play Billing está deshabilitado.
 */
export interface MetricsOverview {
  totalTechnicians: number
  activeTechnicians: number
  trialTechnicians: number
  overdueTechnicians: number
  newTechniciansLast30Days: number
  mrr: number | null
}

export const useAdminMetrics = () => {
  const { fetchWithAuth } = useApi()

  const { data, status, error, refresh } = useAsyncData<MetricsOverview | null>(
    'admin-metrics-overview',
    () => fetchWithAuth('/api/v1/admin/metrics/overview').catch(() => null),
    {
      // No reejecutar al navegar entre páginas — el layout sigue montado.
      // Para forzar refresh: ref.read(useAdminMetrics()).refresh()
      lazy: false,
      server: false
    }
  )

  // Helpers para mostrar: número formateado en es-MX o '—' si null/loading.
  const fmt = (n: number | null | undefined) =>
    n === null || n === undefined ? '—' : n.toLocaleString('es-MX')

  return {
    overview: data,
    status,
    error,
    refresh,
    fmt
  }
}
