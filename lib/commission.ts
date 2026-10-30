export interface CommissionSettings {
  commission_enabled: boolean
  commission_type: 'service_based' | 'flat'
  default_commission_rate: number
  on_time_bonus_enabled: boolean
  on_time_bonus_rate: number
  serviceRates?: Record<string, number>
}

export const DEFAULT_COMMISSION_SETTINGS: CommissionSettings = {
  commission_enabled: false,
  commission_type: 'service_based',
  default_commission_rate: 0,
  on_time_bonus_enabled: false,
  on_time_bonus_rate: 0,
  serviceRates: {},
}

export interface JobCommissionItem {
  id: string
  job_number: string
  service_type: string
  status: string
  created_at: string
  completed_at: string | null
  scheduled_end: string | null
  baseCommission: number
  onTimeBonus: number
  totalCommission: number
  isOnTime: boolean
  durationMinutes: number | null
}

export type TechnicianFieldStatus = 'on_progress' | 'scheduled' | 'available'

export interface TechnicianPerformanceMetrics {
  technicianId: string
  name: string
  email: string
  phone?: string | null
  totalAssigned: number
  totalCompleted: number
  totalActive: number
  totalOnProgress: number
  totalScheduled: number
  fieldStatus: TechnicianFieldStatus
  onTimeCount: number
  onTimeRate: number
  averageDurationMinutes: number
  totalBaseCommission: number
  totalBonusCommission: number
  totalCommission: number
  completedJobs: JobCommissionItem[]
}

/**
 * Calculates itemized commission for a single job dynamically based on organization settings
 */
export function calculateJobCommission(
  job: {
    id: string
    job_number: string
    service_type: string
    status: string
    created_at: string
    completed_at?: string | null
    scheduled_end?: string | null
    check_in_at?: string | null
  },
  settings: CommissionSettings = DEFAULT_COMMISSION_SETTINGS
): JobCommissionItem {
  const isCompleted = job.status === 'completed'
  let baseCommission = 0
  let onTimeBonus = 0
  let isOnTime = false
  let durationMinutes: number | null = null

  // Calculate field work duration (always tracked for performance KPI)
  if (isCompleted && job.completed_at) {
    const startTime = job.check_in_at ? new Date(job.check_in_at).getTime() : new Date(job.created_at).getTime()
    const endTime = new Date(job.completed_at).getTime()
    const diffMinutes = Math.round((endTime - startTime) / (1000 * 60))
    durationMinutes = diffMinutes > 0 ? diffMinutes : null
  }

  // Calculate SLA On-Time status
  if (isCompleted && job.completed_at && job.scheduled_end) {
    const completedTime = new Date(job.completed_at).getTime()
    const scheduledTime = new Date(job.scheduled_end).getTime()
    if (completedTime <= scheduledTime) {
      isOnTime = true
    }
  }

  // Only calculate financial commissions if master commission toggle is enabled
  if (isCompleted && settings.commission_enabled) {
    if (settings.commission_type === 'flat') {
      baseCommission = Number(settings.default_commission_rate) || 0
    } else {
      // Service-based rate matching
      const rates = settings.serviceRates || {}
      const matchingKey = Object.keys(rates).find((key) =>
        job.service_type.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(job.service_type.toLowerCase())
      )

      if (matchingKey && rates[matchingKey] != null && !isNaN(Number(rates[matchingKey]))) {
        baseCommission = Number(rates[matchingKey])
      } else {
        baseCommission = Number(settings.default_commission_rate) || 0
      }
    }

    // SLA On-Time Bonus
    if (settings.on_time_bonus_enabled && isOnTime) {
      onTimeBonus = Number(settings.on_time_bonus_rate) || 0
    }
  }

  return {
    id: job.id,
    job_number: job.job_number,
    service_type: job.service_type,
    status: job.status,
    created_at: job.created_at,
    completed_at: job.completed_at || null,
    scheduled_end: job.scheduled_end || null,
    baseCommission,
    onTimeBonus,
    totalCommission: baseCommission + onTimeBonus,
    isOnTime,
    durationMinutes,
  }
}

/**
 * Aggregates performance and commission metrics for a list of technicians and jobs
 */
export function calculateAllTechniciansMetrics(
  technicians: Array<{ id: string; name: string; email: string; phone?: string | null }>,
  jobs: Array<{
    id: string
    job_number: string
    service_type: string
    status: string
    technician_id: string | null
    created_at: string
    completed_at: string | null
    schedules?: { end_at: string } | { end_at: string }[] | null
    job_attendance?: { check_in_at: string | null } | { check_in_at: string | null }[] | null
  }>,
  settings: CommissionSettings = DEFAULT_COMMISSION_SETTINGS
): TechnicianPerformanceMetrics[] {
  return technicians.map((tech) => {
    const techJobs = jobs.filter((j) => j.technician_id === tech.id)
    const totalAssigned = techJobs.length

    const onProgressJobs = techJobs.filter((j) => j.status === 'on_progress')
    const scheduledJobs = techJobs.filter((j) => ['assigned', 'pending'].includes(j.status))

    const totalOnProgress = onProgressJobs.length
    const totalScheduled = scheduledJobs.length
    const totalActive = totalOnProgress + totalScheduled

    const fieldStatus: TechnicianFieldStatus =
      totalOnProgress > 0 ? 'on_progress' : totalScheduled > 0 ? 'scheduled' : 'available'

    const completedJobsData = techJobs.filter((j) => j.status === 'completed')

    let totalBaseCommission = 0
    let totalBonusCommission = 0
    let onTimeCount = 0
    let totalDurationMinutes = 0
    let durationJobsCount = 0

    const completedItems: JobCommissionItem[] = completedJobsData.map((job) => {
      const sched = Array.isArray(job.schedules) ? job.schedules[0] : job.schedules
      const att = Array.isArray(job.job_attendance) ? job.job_attendance[0] : job.job_attendance

      const item = calculateJobCommission(
        {
          id: job.id,
          job_number: job.job_number,
          service_type: job.service_type,
          status: job.status,
          created_at: job.created_at,
          completed_at: job.completed_at,
          scheduled_end: sched?.end_at,
          check_in_at: att?.check_in_at,
        },
        settings
      )

      totalBaseCommission += item.baseCommission
      totalBonusCommission += item.onTimeBonus
      if (item.isOnTime) onTimeCount++
      if (item.durationMinutes !== null) {
        totalDurationMinutes += item.durationMinutes
        durationJobsCount++
      }

      return item
    })

    const totalCompleted = completedItems.length
    const onTimeRate = totalCompleted > 0 ? Math.round((onTimeCount / totalCompleted) * 100) : 0
    const averageDurationMinutes =
      durationJobsCount > 0 ? Math.round(totalDurationMinutes / durationJobsCount) : 0

    return {
      technicianId: tech.id,
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
      totalAssigned,
      totalCompleted,
      totalActive,
      totalOnProgress,
      totalScheduled,
      fieldStatus,
      onTimeCount,
      onTimeRate,
      averageDurationMinutes,
      totalBaseCommission,
      totalBonusCommission,
      totalCommission: totalBaseCommission + totalBonusCommission,
      completedJobs: completedItems,
    }
  })
}

/**
 * Format currency in Indonesian Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format minutes into readable human duration
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '-'
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours === 0) return `${remainingMinutes}m`
  if (remainingMinutes === 0) return `${hours}j`
  return `${hours}j ${remainingMinutes}m`
}
