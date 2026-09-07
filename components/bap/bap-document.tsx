import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CheckCircle2, MapPin, Phone, Mail, Clock, Calendar, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BapPrintButton } from './bap-print-button'

export interface BapDocumentProps {
  organization: {
    id: string
    name: string
  }
  job: {
    id: string
    job_number: string
    service_type: string
    issue: string
    instructions: string | null
    address: string | null
    priority: string
    status: string
    created_at: string
    completed_at: string | null
  }
  customer: {
    name: string
    phone: string | null
    email: string | null
    address: string | null
  } | null
  technician: {
    name: string
    phone: string | null
    email: string | null
  } | null
  attendance: {
    check_in_at: string | null
    check_in_latitude: number | null
    check_in_longitude: number | null
    check_out_at: string | null
    check_out_latitude: number | null
    check_out_longitude: number | null
  } | null
  checklist: Array<{
    id: string
    item: string
    is_completed: boolean
    completed_at: string | null
  }>
  beforePhotos: Array<{
    id: string
    signed_url: string
    captured_at: string | null
  }>
  afterPhotos: Array<{
    id: string
    signed_url: string
    captured_at: string | null
  }>
  signature: {
    customer_name: string
    signed_url: string
    signed_at: string | null
  } | null
  report: {
    result: string
    notes: string | null
    submitted_at: string | null
  } | null
  backHref: string
}

export function BapDocument({
  organization,
  job,
  customer,
  technician,
  attendance,
  checklist,
  beforePhotos,
  afterPhotos,
  signature,
  report,
  backHref,
}: BapDocumentProps) {
  const completedDate = job.completed_at ? new Date(job.completed_at) : new Date()
  const formattedDateStr = completedDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const dateCode = completedDate.toISOString().slice(0, 10).replace(/-/g, '')
  const bapDocNumber = `BAP/${job.job_number}/${dateCode}`

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 sm:px-6 print:bg-white print:p-0">
      {/* Top Action Bar (Screen only, hidden on print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 no-print bg-background p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href={backHref} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Detail Job
            </Link>
          </Button>
          <div>
            <h1 className="text-sm font-semibold">Pratinjau Berita Acara Pekerjaan (BAP)</h1>
            <p className="text-xs text-muted-foreground">Siap cetak atau simpan ke file PDF</p>
          </div>
        </div>
        <BapPrintButton />
      </div>

      {/* Official BAP Printable Sheet (A4 Dimensions) */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-xl border border-slate-200 shadow-md print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
        {/* Letterhead Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
              {organization.name}
            </h2>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
              Field Service & Operations Management Report
            </p>
            <p className="text-xs text-slate-500">
              Dokumen Resmi Bukti Penyelesaian Pekerjaan Lapangan (BAP)
            </p>
          </div>
          <div className="text-right space-y-1">
            <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-300">
              STATUS: COMPLETED
            </span>
            <p className="text-xs font-mono font-bold text-slate-800">{bapDocNumber}</p>
            <p className="text-xs text-slate-500">{formattedDateStr}</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-6">
          <h3 className="text-lg font-bold uppercase tracking-wider text-slate-900">
            BERITA ACARA PENYELESAIAN PEKERJAAN
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Nomor Work Order: <span className="font-mono font-bold text-slate-900">{job.job_number}</span>
          </p>
        </div>

        {/* Info Grid (Pelanggan & Pekerjaan) */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1">
              Informasi Pelanggan
            </h4>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500">Nama Klien</span>
              <span className="col-span-2 font-semibold text-slate-900">{customer?.name || '-'}</span>

              <span className="text-slate-500">Alamat Lokasi</span>
              <span className="col-span-2 text-slate-800">{customer?.address || job.address || '-'}</span>

              <span className="text-slate-500">Telepon</span>
              <span className="col-span-2 text-slate-800">{customer?.phone || '-'}</span>

              <span className="text-slate-500">Email</span>
              <span className="col-span-2 text-slate-800">{customer?.email || '-'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1">
              Detail Pelaksanaan
            </h4>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500">Jenis Layanan</span>
              <span className="col-span-2 font-semibold text-slate-900">{job.service_type}</span>

              <span className="text-slate-500">Prioritas</span>
              <span className="col-span-2 capitalize font-semibold text-slate-900">{job.priority}</span>

              <span className="text-slate-500">Teknisi</span>
              <span className="col-span-2 font-semibold text-slate-900">{technician?.name || '-'}</span>

              <span className="text-slate-500">Waktu Selesai</span>
              <span className="col-span-2 text-slate-800">
                {job.completed_at ? new Date(job.completed_at).toLocaleString('id-ID') : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Attendance Log (Check-in & Check-out) */}
        {attendance && (
          <div className="mb-6 bg-slate-50/70 p-3 rounded-md border border-slate-200 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <div>
                <span className="font-bold text-slate-900">Check-in: </span>
                {attendance.check_in_at ? new Date(attendance.check_in_at).toLocaleTimeString('id-ID') : '-'}
                {attendance.check_in_latitude && (
                  <span className="text-slate-500 ml-1">
                    ({attendance.check_in_latitude.toFixed(4)}, {attendance.check_in_longitude?.toFixed(4)})
                  </span>
                )}
              </div>
              <div>
                <span className="font-bold text-slate-900">Check-out: </span>
                {attendance.check_out_at ? new Date(attendance.check_out_at).toLocaleTimeString('id-ID') : '-'}
                {attendance.check_out_latitude && (
                  <span className="text-slate-500 ml-1">
                    ({attendance.check_out_latitude.toFixed(4)}, {attendance.check_out_longitude?.toFixed(4)})
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section: Uraian Kendala & Instruksi */}
        <div className="mb-6 space-y-2 text-xs">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider">
            1. Deskripsi Keluhan / Uraian Masalah
          </h4>
          <p className="bg-white border border-slate-200 p-3 rounded-md text-slate-800 leading-relaxed">
            {job.issue}
          </p>
          {job.instructions && (
            <p className="text-[11px] text-slate-600 italic">
              Instruksi Khusus: {job.instructions}
            </p>
          )}
        </div>

        {/* Section: SOP Checklist */}
        <div className="mb-6 space-y-2 text-xs">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider">
            2. Prosedur Kerja Standar (SOP Checklist)
          </h4>
          <table className="w-full border-collapse border border-slate-300 text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="border border-slate-300 px-3 py-2 w-10 text-center">No</th>
                <th className="border border-slate-300 px-3 py-2">Item Pekerjaan SOP</th>
                <th className="border border-slate-300 px-3 py-2 w-28 text-center">Status</th>
                <th className="border border-slate-300 px-3 py-2 w-36 text-center">Waktu Verifikasi</th>
              </tr>
            </thead>
            <tbody>
              {checklist.length === 0 ? (
                <tr>
                  <td colSpan={4} className="border border-slate-300 px-3 py-2 text-center text-slate-500">
                    Tidak ada checklist spesifik.
                  </td>
                </tr>
              ) : (
                checklist.map((item, idx) => (
                  <tr key={item.id} className="even:bg-slate-50/50">
                    <td className="border border-slate-300 px-3 py-1.5 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-slate-900">{item.item}</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-[11px]">
                        <CheckCircle2 className="h-3 w-3 inline" /> Selesai
                      </span>
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 text-center text-slate-600 font-mono text-[11px]">
                      {item.completed_at ? new Date(item.completed_at).toLocaleTimeString('id-ID') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Section: Laporan Hasil Kerja */}
        <div className="mb-6 space-y-2 text-xs">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider">
            3. Laporan Hasil Pengerjaan & Rekomendasi
          </h4>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-md space-y-2">
            <div>
              <span className="font-semibold text-slate-900 block">Hasil Tindakan:</span>
              <p className="text-slate-800 mt-0.5 leading-relaxed">{report?.result || 'Pekerjaan telah diselesaikan sesuai standar operasional prosedur.'}</p>
            </div>
            {report?.notes && (
              <div>
                <span className="font-semibold text-slate-900 block">Catatan Tambahan:</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{report.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Section: Dokumentasi Foto Bukti (Before / After) */}
        {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
          <div className="mb-8 space-y-3 text-xs page-break-inside-avoid">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider">
              4. Dokumentasi Visual Bukti Lapangan
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Before Photos */}
              <div className="border border-slate-200 rounded-md p-3 bg-slate-50">
                <span className="font-bold text-slate-800 block mb-2 text-center text-[11px] uppercase tracking-wider">
                  Foto Sebelum (Before)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {beforePhotos.map((photo) => (
                    <div key={photo.id} className="relative aspect-video bg-slate-200 rounded overflow-hidden border border-slate-300">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.signed_url}
                        alt="Before Evidence"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {beforePhotos.length === 0 && (
                    <p className="col-span-2 text-center text-slate-400 py-4 italic text-[11px]">
                      Tidak ada foto sebelum.
                    </p>
                  )}
                </div>
              </div>

              {/* After Photos */}
              <div className="border border-slate-200 rounded-md p-3 bg-slate-50">
                <span className="font-bold text-slate-800 block mb-2 text-center text-[11px] uppercase tracking-wider">
                  Foto Sesudah (After)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {afterPhotos.map((photo) => (
                    <div key={photo.id} className="relative aspect-video bg-slate-200 rounded overflow-hidden border border-slate-300">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.signed_url}
                        alt="After Evidence"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {afterPhotos.length === 0 && (
                    <p className="col-span-2 text-center text-slate-400 py-4 italic text-[11px]">
                      Tidak ada foto sesudah.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section: Pengesahan & Tanda Tangan */}
        <div className="mt-8 pt-4 border-t border-slate-300 page-break-inside-avoid">
          <p className="text-[11px] text-slate-600 mb-6 leading-relaxed text-justify">
            Demikian Berita Acara Penyelesaian Pekerjaan ini dibuat dengan sebenar-benarnya atas persetujuan kedua belah pihak bahwa pekerjaan yang tertera di atas telah diselesaikan dengan baik dan diterima oleh pihak pelanggan.
          </p>

          <div className="grid grid-cols-2 gap-12 text-center text-xs">
            {/* Customer Signature */}
            <div className="flex flex-col items-center justify-between h-44">
              <span className="font-semibold text-slate-900">Pemberi Tugas / Pelanggan</span>
              <div className="h-24 w-44 flex items-center justify-center border-b border-slate-400">
                {signature?.signed_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={signature.signed_url}
                    alt="Customer Signature"
                    className="max-h-20 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-[11px] text-slate-400 italic">(Tanda tangan digital)</span>
                )}
              </div>
              <div>
                <p className="font-bold text-slate-950 uppercase">{signature?.customer_name || customer?.name || 'Pelanggan'}</p>
                <p className="text-[11px] text-slate-500">
                  {signature?.signed_at ? new Date(signature.signed_at).toLocaleDateString('id-ID') : formattedDateStr}
                </p>
              </div>
            </div>

            {/* Technician Signature */}
            <div className="flex flex-col items-center justify-between h-44">
              <span className="font-semibold text-slate-900">Pelaksana Pekerjaan / Teknisi</span>
              <div className="h-24 w-44 flex items-center justify-center border-b border-slate-400">
                <div className="text-center">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded border border-emerald-300 mb-1">
                    VERIFIKASI SISTEM
                  </span>
                  <p className="text-[11px] font-mono text-slate-500">GL-VERIFIED-SIGN</p>
                </div>
              </div>
              <div>
                <p className="font-bold text-slate-950 uppercase">{technician?.name || 'Teknisi Lapangan'}</p>
                <p className="text-[11px] text-slate-500">{organization.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="mt-10 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
          Dokumen ini diterbitkan secara elektronik oleh Gridline OS (Field Service Management System). Hak cipta dilindungi undang-undang.
        </div>
      </div>
    </div>
  )
}
