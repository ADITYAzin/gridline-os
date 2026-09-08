export const COMMISSION_CONFIG = {
  serviceRates: {
    'Maintenance Rutin': 75000,
    'Perbaikan': 125000,
    'Instalasi Baru': 200000,
    'Pemeriksaan': 50000,
    'Emergency Service': 150000,
    default: 80000,
  } as Record<string, number>,
  onTimeBonus: 25000,
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

export interface TechnicianPerformanceMetrics {
  technicianId: string
  name: string
  email: string
  phone?: string | null
  totalAssigned: number
  totalCompleted: number
  totalActive: number
  onTimeCount: number
  onTimeRate: number
  averageDurationMinutes: number
  totalBaseCommission: number
  totalBonusCommission: number
  totalCommission: number
  completedJobs: JobCommissionItem[]
}

/**
 * Calculates itemized commission for a single job
 */
export function calculateJobCommission(job: {
  id: string
  job_number: string
  service_type: string
  status: string
  created_at: string
  completed_at?: string | null
  scheduled_end?: string | null
  check_in_at?: string | null
}): JobCommissionItem {
  const isCompleted = job.status === 'completed'
  let baseCommission = 0
  let onTimeBonus = 0
  let isOnTime = false
  let durationMinutes: number | null = null

  if (isCompleted) {
    // Determine base commission by service type matching
    const matchingKey = Object.keys(COMMISSION_CONFIG.serviceRates).find((key) =>
      job.service_type.toLowerCase().includes(key.toLowerCase())
    )
    baseCommission = matchingKey
      ? COMMISSION_CONFIG.serviceRates[matchingKey]
      : COMMISSION_CONFIG.serviceRates.default

    // Calculate SLA On-Time
    if (job.completed_at && job.scheduled_end) {
      const completedTime = new Date(job.completed_at).getTime()
      const scheduledTime = new Date(job.scheduled_end).getTime()
      if (completedTime <= scheduledTime) {
        isOnTime = true
        onTimeBonus = COMMISSION_CONFIG.onTimeBonus
      }
    }

    // Calculate field work duration (from check-in to completed_at, or created_at to completed_at)
    if (job.completed_at) {
      const startTime = job.check_in_at ? new Date(job.check_in_at).getTime() : new Date(job.created_at).getTime()
      const endTime = new Date(job.completed_at).getTime()
      const diffMinutes = Math.round((endTime - startTime) / (1000 * 60))
      durationMinutes = diffMinutes > 0 ? diffMinutes : null
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
  }>
): TechnicianPerformanceMetrics[] {
  return technicians.map((tech) => {
    const techJobs = jobs.filter((j) => j.technician_id === tech.id)
    const totalAssigned = techJobs.length
    const totalActive = techJobs.filter((j) =>
      ['pending', 'assigned', 'on_progress'].includes(j.status)
    ).length

    const completedJobsData = techJobs.filter((j) => j.status === 'completed')

    let totalBaseCommission = 0
    let totalBonusCommission = 0
    let onTimeCount = 0
    let totalDurationMinutes = 0
    let durationJobsCount = 0

    const completedItems: JobCommissionItem[] = completedJobsData.map((job) => {
      const sched = Array.isArray(job.schedules) ? job.schedules[0] : job.schedules
      const att = Array.isArray(job.job_attendance) ? job.job_attendance[0] : job.job_attendance

      const item = calculateJobCommission({
        id: job.id,
        job_number: job.job_number,
        service_type: job.service_type,
        status: job.status,
        created_at: job.created_at,
        completed_at: job.completed_at,
        scheduled_end: sched?.end_at,
        check_in_at: att?.check_in_at,
      })

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
    const onTimeRate = totalCompleted > 0 ? Math.round((onTimeCount / totalCompleted) * 100) : 100
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
