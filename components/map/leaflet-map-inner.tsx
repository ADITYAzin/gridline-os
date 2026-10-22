'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { MapJobItem } from './live-map-view'

interface LeafletMapInnerProps {
  jobs: MapJobItem[]
  selectedJobId: string | null
  onSelectJob: (job: MapJobItem | null) => void
}

function getStatusDetails(status: string, isCheckedIn: boolean) {
  switch (status) {
    case 'on_progress':
      return {
        bg: '#10B981', // emerald-500
        border: '#059669',
        label: isCheckedIn ? 'Hadir di Lokasi' : 'Dikerjakan',
        badgeBg: 'background-color: #ECFDF5; color: #047857; border: 1px solid #A7F3D0;',
        // Lucide Wrench / UserCheck SVG icon
        svgIcon: `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        `,
      }
    case 'assigned':
      return {
        bg: '#007ACC', // gridline blue
        border: '#005FA3',
        label: 'Ditugaskan',
        badgeBg: 'background-color: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE;',
        // Lucide User / Navigation SVG icon
        svgIcon: `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        `,
      }
    case 'pending':
      return {
        bg: '#F59E0B', // amber-500
        border: '#D97706',
        label: 'Belum Ada Teknisi',
        badgeBg: 'background-color: #FFFBEB; color: #B45309; border: 1px solid #FDE68A;',
        // Lucide Clock / AlertCircle SVG icon
        svgIcon: `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        `,
      }
    case 'completed':
      return {
        bg: '#059669', // emerald-600
        border: '#047857',
        label: 'Selesai',
        badgeBg: 'background-color: #F0FDF4; color: #166534; border: 1px solid #BBF7D0;',
        // Lucide Check SVG icon
        svgIcon: `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        `,
      }
    default:
      return {
        bg: '#64748B',
        border: '#475569',
        label: status,
        badgeBg: 'background-color: #F8FAFC; color: #334155; border: 1px solid #E2E8F0;',
        svgIcon: `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        `,
      }
  }
}

function createIconMarker(job: MapJobItem, isSelected: boolean) {
  const isCheckedIn = Boolean(job.check_in_at)
  const statusInfo = getStatusDetails(job.status, isCheckedIn)
  const isProgress = job.status === 'on_progress'

  const size = isSelected ? 40 : 34
  const halfSize = size / 2

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      ${
        isProgress
          ? `<span style="position: absolute; width: ${size + 14}px; height: ${
              size + 14
            }px; border-radius: 9999px; background-color: #10B981; opacity: 0.35; animation: gridline-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
          : ''
      }
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        border-radius: 9999px;
        background-color: ${statusInfo.bg};
        border: 2.5px solid #FFFFFF;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #FFFFFF;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
      ">
        ${statusInfo.svgIcon}
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: 'custom-gridline-icon-pin',
    iconSize: [size, size],
    iconAnchor: [halfSize, halfSize],
    popupAnchor: [0, -halfSize - 4],
  })
}

function createPopupContent(job: MapJobItem) {
  const isCheckedIn = Boolean(job.check_in_at)
  const statusInfo = getStatusDetails(job.status, isCheckedIn)

  // Format check-in time if available
  let checkInDisplay = ''
  if (job.check_in_at) {
    try {
      const d = new Date(job.check_in_at)
      checkInDisplay = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    } catch {
      checkInDisplay = 'Tercatat'
    }
  }

  return `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 4px; min-width: 250px; max-width: 300px;">
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #F1F5F9; padding-bottom: 8px; margin-bottom: 8px;">
        <span style="font-family: ui-monospace, monospace; font-size: 13px; font-weight: 700; color: #007ACC;">
          ${job.job_number}
        </span>
        <span style="font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; ${statusInfo.badgeBg}">
          ${statusInfo.label}
        </span>
      </div>

      <!-- Service Type -->
      <div style="font-size: 13px; font-weight: 600; color: #0F172A; margin-bottom: 4px; line-height: 1.3;">
        ${job.service_type}
      </div>

      <!-- Customer -->
      <div style="font-size: 11px; color: #334155; margin-bottom: 3px; font-weight: 600;">
        ${job.customer_name}
      </div>

      <!-- Address -->
      <div style="font-size: 11px; color: #64748B; line-height: 1.4; margin-bottom: 8px;">
        ${job.address}
      </div>

      <!-- Presence & Technician Box -->
      <div style="font-size: 11px; color: #475569; padding: 7px 8px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
          <span style="color: #64748B;">Teknisi:</span>
          <span style="font-weight: 600; color: #0F172A;">${job.technician_name || 'Belum ada'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #64748B;">Kehadiran:</span>
          ${
            isCheckedIn
              ? `<span style="font-weight: 600; color: #059669; display: flex; align-items: center; gap: 4px;">
                  <span style="display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background: #10B981;"></span>
                  Hadir ${checkInDisplay}
                </span>`
              : `<span style="font-style: italic; color: #94A3B8;">Belum Check-in</span>`
          }
        </div>
      </div>

      <!-- Action Button -->
      <div style="display: flex; gap: 6px; padding-top: 4px; border-top: 1px solid #F1F5F9;">
        <a 
          href="/admin/jobs/${job.id}" 
          style="
            flex: 1;
            text-align: center;
            font-size: 11px;
            font-weight: 600;
            padding: 6px 12px;
            background-color: #007ACC;
            color: #FFFFFF;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
          "
        >
          Buka Tiket →
        </a>
      </div>
    </div>
  `
}

export default function LeafletMapInner({
  jobs,
  selectedJobId,
  onSelectJob,
}: LeafletMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Default view center on Jakarta, Indonesia
    const defaultCenter: L.LatLngExpression = [-6.2088, 106.8456]
    const defaultZoom = 12

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: false,
    })

    // ESRI World Street Map (100% Free, High Quality, Clean, NO API Key Required)
    const esriLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom',
        maxZoom: 19,
      }
    )

    esriLayer.addTo(map)

    // Add zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapRef.current = map

    // Ensure Leaflet computes container dimensions after DOM paint
    const forceInvalidate = () => {
      map.invalidateSize()
    }

    const t1 = setTimeout(forceInvalidate, 50)
    const t2 = setTimeout(forceInvalidate, 250)
    const t3 = setTimeout(forceInvalidate, 600)

    window.addEventListener('resize', forceInvalidate)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      window.removeEventListener('resize', forceInvalidate)
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [])

  // Sync Markers with jobs
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.remove()
    })
    markersRef.current.clear()

    const validMarkers: L.Marker[] = []
    const latLngBounds = L.latLngBounds([])

    jobs.forEach((job) => {
      if (job.latitude == null || job.longitude == null) return

      const lat = Number(job.latitude)
      const lng = Number(job.longitude)
      if (isNaN(lat) || isNaN(lng)) return

      const isSelected = job.id === selectedJobId
      const icon = createIconMarker(job, isSelected)
      const marker = L.marker([lat, lng], { icon })

      marker.bindPopup(createPopupContent(job), {
        className: 'gridline-custom-popup',
        maxWidth: 320,
      })

      marker.on('click', () => {
        onSelectJob(job)
      })

      marker.addTo(map)
      markersRef.current.set(job.id, marker)
      validMarkers.push(marker)
      latLngBounds.extend([lat, lng])
    })

    // If we have valid markers, fit the map view
    if (validMarkers.length > 0 && latLngBounds.isValid()) {
      map.fitBounds(latLngBounds, {
        padding: [60, 60],
        maxZoom: 14,
      })
    }
  }, [jobs, onSelectJob, selectedJobId])

  // Handle selectedJobId focus change
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedJobId) return

    const marker = markersRef.current.get(selectedJobId)
    const selectedJob = jobs.find((j) => j.id === selectedJobId)

    if (marker && selectedJob && selectedJob.latitude && selectedJob.longitude) {
      const lat = Number(selectedJob.latitude)
      const lng = Number(selectedJob.longitude)
      if (!isNaN(lat) && !isNaN(lng)) {
        map.flyTo([lat, lng], 15, { duration: 0.8 })
        marker.openPopup()
      }
    }
  }, [selectedJobId, jobs])

  return (
    <div
      className="relative w-full h-full min-h-[580px] rounded-2xl overflow-hidden border border-border shadow-xs bg-[#E2E8F0]"
      style={{ minHeight: '580px' }}
    >
      <div
        ref={containerRef}
        className="w-full h-full z-0"
        style={{ width: '100%', height: '100%', minHeight: '580px' }}
      />
      <style jsx global>{`
        .custom-gridline-icon-pin {
          background: transparent !important;
          border: none !important;
        }
        .gridline-custom-popup .leaflet-popup-content-wrapper {
          border-radius: 14px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          padding: 6px;
        }
        .gridline-custom-popup .leaflet-popup-content {
          margin: 6px 8px;
          line-height: 1.4;
        }
        .gridline-custom-popup .leaflet-popup-tip {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }
        @keyframes gridline-ping {
          75%,
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
