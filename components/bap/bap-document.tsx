import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BapPrintButton } from './bap-print-button'

export interface BapDocumentProps {
  organization: {
    id: string
    name: string
    address?: string | null
    city?: string | null
    province?: string | null
    postal_code?: string | null
    phone?: string | null
    email?: string | null
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
  asset?: {
    id: string
    asset_name: string
    brand: string
    model_number: string | null
    serial_number: string | null
    location_tag: string | null
    warranty_expires_at?: string | null
    status?: string | null
  } | null
  technician: {
    name: string
    phone: string | null
    email: string | null
  } | null
  schedule?: {
    start_at: string
    end_at: string
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
    is_na?: boolean | null
    na_reason?: string | null
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
  asset,
  technician,
  schedule,
  attendance,
  checklist,
  beforePhotos,
  afterPhotos,
  signature,
  report,
  backHref,
}: BapDocumentProps) {
  const completedDate = job.completed_at ? new Date(job.completed_at) : new Date()

  // Format Hari & Tanggal Resmi Indonesia
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const dayName = dayNames[completedDate.getDay()]
  const formattedDateStr = completedDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const dateCode = completedDate.toISOString().slice(0, 10).replace(/-/g, '')
  const bapDocNumber = `BAP/${job.job_number}/${dateCode}`

  // Alamat & Kontak Perusahaan Pelaksana
  const orgAddressParts = [
    organization.address,
    organization.city,
    organization.province ? `${organization.province} ${organization.postal_code || ''}`.trim() : null,
  ].filter(Boolean)
  const orgFullAddress = orgAddressParts.join(', ')

  // Status Garansi Aset
  let warrantyText = 'Non-Garansi / Reguler'
  if (asset?.warranty_expires_at) {
    const wDate = new Date(asset.warranty_expires_at)
    const formattedWarrantyDate = wDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    if (wDate >= new Date()) {
      warrantyText = `Garansi Aktif (s/d ${formattedWarrantyDate})`
    } else {
      warrantyText = `Masa Garansi Berakhir (${formattedWarrantyDate})`
    }
  }

  return (
    <div className="min-h-screen bg-muted/40 py-8 px-4 sm:px-6 print:bg-white print:p-0 print:min-h-0">
      {/* Print CSS Configuration for F4 (Folio) Paper Size */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: 215mm 330mm; /* Ukuran standar kertas F4 / Folio */
              margin: 14mm 16mm 14mm 16mm;
            }
            @media print {
              body {
                background: #ffffff !important;
                color: #0f172a !important;
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print {
                display: none !important;
              }
              .page-break-inside-avoid {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
            }
          `,
        }}
      />

      {/* Top Screen Action Bar (Hidden on Print) */}
      <div className="max-w-[215mm] mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 no-print bg-background p-4 rounded-xl border shadow-xs">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="cursor-pointer">
            <Link href={backHref} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Detail Pekerjaan
            </Link>
          </Button>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Dokumen Berita Acara Pekerjaan (BAP)</h1>
            <p className="text-xs text-muted-foreground">Unduh PDF Resmi Berkualitas Vektor (Format F4 & A4)</p>
          </div>
        </div>
        <BapPrintButton
          jobId={job.id}
          jobNumber={job.job_number}
          checklistCount={checklist?.length || 0}
          photosCount={(beforePhotos?.length || 0) + (afterPhotos?.length || 0)}
        />
      </div>

      {/* Official BAP Sheet (F4 Dimensions: 215mm x 330mm) */}
      <div
        id="bap-document-sheet"
        className="w-full max-w-[215mm] mx-auto bg-white text-slate-900 p-8 sm:p-12 shadow-sm border border-slate-200/80 rounded-sm print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full"
      >
        {/* KOP SURAT (Letterhead Pelaksana Jasa) */}
        <div className="border-b-[2.5px] border-slate-900 pb-3 mb-4 flex justify-between items-start gap-4 page-break-inside-avoid">
          <div className="space-y-1 max-w-[68%]">
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-950 uppercase leading-snug">
              {organization.name}
            </h2>
            {orgFullAddress && (
              <p className="text-xs text-slate-700 leading-relaxed">{orgFullAddress}</p>
            )}
            <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5">
              {organization.phone && <span>Telp: {organization.phone}</span>}
              {organization.phone && organization.email && <span>•</span>}
              {organization.email && <span>Email: {organization.email}</span>}
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-block px-2 py-0.5 rounded border border-[#007ACC] bg-[#EBF5FC] text-[#007ACC] text-[9.5px] font-bold tracking-wider uppercase">
              DOKUMEN RESMI BAP
            </span>
            <div className="font-mono font-bold text-xs text-slate-900 mt-1">{bapDocNumber}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{formattedDateStr}</div>
          </div>
        </div>

        {/* JUDUL DOKUMEN */}
        <div className="text-center my-4 page-break-inside-avoid">
          <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide text-slate-950">
            BERITA ACARA PENYELESAIAN PEKERJAAN
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Nomor: <span className="font-mono font-bold text-slate-900">{bapDocNumber}</span>
          </p>
        </div>

        {/* KLAUSUL PEMBUKA */}
        <p className="text-xs text-slate-700 leading-relaxed mb-4 text-justify page-break-inside-avoid">
          Pada hari ini, <strong className="font-semibold text-slate-900">{dayName}</strong>, tanggal{' '}
          <strong className="font-semibold text-slate-900">{formattedDateStr}</strong>, telah selesai dilaksanakan pekerjaan
          layanan teknis lapangan dengan rincian kesepakatan antara pihak-pihak di bawah ini:
        </p>

        {/* DATA PARA PIHAK (Pelaksana Jasa & Pelanggan) - DENGAN OUTLINE BIRU KHAS BAP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-5 text-xs page-break-inside-avoid">
          {/* PELAKSANA JASA */}
          <div className="border-l-[3.5px] border-[#007ACC] pl-3 py-0.5 space-y-1">
            <p className="font-bold text-[#007ACC] uppercase tracking-wider text-[11px] mb-1.5">
              PELAKSANA JASA
            </p>
            <div className="space-y-1 text-slate-800 text-[11.5px]">
              <div className="grid grid-cols-[75px_1fr] gap-1">
                <span className="text-slate-500">Perusahaan</span>
                <span className="font-medium text-slate-950">: {organization.name}</span>
              </div>
              <div className="grid grid-cols-[75px_1fr] gap-1">
                <span className="text-slate-500">Teknisi</span>
                <span className="font-medium text-slate-950">: {technician?.name || '-'}</span>
              </div>
              <div className="grid grid-cols-[75px_1fr] gap-1">
                <span className="text-slate-500">Kontak</span>
                <span className="text-slate-900">: {technician?.phone || organization.phone || '-'}</span>
              </div>
            </div>
          </div>

          {/* PELANGGAN */}
          <div className="border-l-[3.5px] border-[#007ACC] pl-3 py-0.5 space-y-1">
            <p className="font-bold text-[#007ACC] uppercase tracking-wider text-[11px] mb-1.5">
              PELANGGAN
            </p>
            <div className="space-y-1 text-slate-800 text-[11.5px]">
              <div className="grid grid-cols-[75px_1fr] gap-1">
                <span className="text-slate-500">Nama Klien</span>
                <span className="font-medium text-slate-950">: {customer?.name || '-'}</span>
              </div>
              <div className="grid grid-cols-[75px_1fr] gap-1">
                <span className="text-slate-500">Kontak</span>
                <span className="text-slate-900">: {customer?.phone || '-'}</span>
              </div>
              <div className="grid grid-cols-[75px_1fr] gap-1">
                <span className="text-slate-500">Alamat</span>
                <span className="text-slate-900 leading-snug">: {job.address || customer?.address || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. DATA PEKERJAAN & ASET UNIT (TABEL) */}
        <div className="mb-5 space-y-1.5 text-xs">
          <p className="font-bold text-slate-950 uppercase tracking-wider text-[11px]">
            1. RINCIAN PEKERJAAN & ASET UNIT
          </p>
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="bg-slate-100/70 p-2 font-medium text-slate-700 w-1/4 border-r border-slate-300">
                  Jenis Layanan
                </td>
                <td className="p-2 font-semibold text-slate-950 w-1/4 border-r border-slate-300">
                  {job.service_type}
                </td>
                <td className="bg-slate-100/70 p-2 font-medium text-slate-700 w-1/4 border-r border-slate-300">
                  Nomor Work Order
                </td>
                <td className="p-2 font-mono font-semibold text-slate-950 w-1/4">
                  {job.job_number}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="bg-slate-100/70 p-2 font-medium text-slate-700 border-r border-slate-300">
                  Unit Aset
                </td>
                <td className="p-2 font-medium text-slate-950 border-r border-slate-300">
                  {asset ? `${asset.asset_name} (${asset.brand})` : '-'}
                </td>
                <td className="bg-slate-100/70 p-2 font-medium text-slate-700 border-r border-slate-300">
                  Model & No. Seri
                </td>
                <td className="p-2 text-slate-900 font-mono text-[11px]">
                  {asset?.model_number || '-'} / SN: {asset?.serial_number || '-'}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="bg-slate-100/70 p-2 font-medium text-slate-700 border-r border-slate-300">
                  Lokasi Unit
                </td>
                <td className="p-2 text-slate-900 border-r border-slate-300">
                  {asset?.location_tag || '-'}
                </td>
                <td className="bg-slate-100/70 p-2 font-medium text-slate-700 border-r border-slate-300">
                  Status Garansi
                </td>
                <td className="p-2 text-slate-900 font-medium">
                  {warrantyText}
                </td>
              </tr>
              <tr>
                <td className="bg-slate-100/70 p-2 font-medium text-slate-700 border-r border-slate-300">
                  Waktu Pengerjaan
                </td>
                <td colSpan={3} className="p-2 text-slate-900">
                  {attendance?.check_in_at
                    ? `Mulai: ${new Date(attendance.check_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
                    : schedule?.start_at
                    ? `Jadwal: ${new Date(schedule.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
                    : '-'}{' '}
                  •{' '}
                  {job.completed_at
                    ? `Selesai: ${new Date(job.completed_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
                    : '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. URAIAN KELUHAN & TINDAKAN PEKERJAAN (TABEL RESMI) */}
        <div className="mb-5 space-y-1.5 text-xs">
          <p className="font-bold text-slate-950 uppercase tracking-wider text-[11px]">
            2. URAIAN KELUHAN & TINDAKAN PERBAIKAN
          </p>
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="bg-slate-100/70 p-2 font-medium text-slate-700 w-1/4 border-r border-slate-300 align-top">
                  Keluhan / Kendala Awal
                </td>
                <td className="p-2 text-slate-900 leading-relaxed">
                  {job.issue}
                </td>
              </tr>
              <tr className={report?.notes ? 'border-b border-slate-300' : ''}>
                <td className="bg-slate-100/70 p-2 font-medium text-slate-700 w-1/4 border-r border-slate-300 align-top">
                  Tindakan & Hasil
                </td>
                <td className="p-2 text-slate-900 leading-relaxed">
                  {report?.result || 'Pekerjaan perbaikan dan pemeriksaan teknis telah diselesaikan sesuai standar teknis operasional.'}
                </td>
              </tr>
              {report?.notes && (
                <tr>
                  <td className="bg-slate-100/70 p-2 font-medium text-slate-700 w-1/4 border-r border-slate-300 align-top">
                    Catatan / Saran Teknisi
                  </td>
                  <td className="p-2 text-slate-800 italic leading-relaxed">
                    {report.notes}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 3. PROSEDUR STANDAR OPERASIONAL (SOP CHECKLIST - TABEL) */}
        <div className="mb-5 space-y-1.5 text-xs page-break-inside-avoid">
          <p className="font-bold text-slate-950 uppercase tracking-wider text-[11px]">
            3. PEMERIKSAAN PROSEDUR KERJA (SOP)
          </p>
          <table className="w-full border-collapse border border-slate-300 text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                <th className="border-r border-slate-300 px-3 py-1.5 w-10 text-center">No</th>
                <th className="border-r border-slate-300 px-3 py-1.5">Item Prosedur Kerja</th>
                <th className="border-r border-slate-300 px-3 py-1.5 w-32 text-center">Hasil</th>
                <th className="px-3 py-1.5 w-36 text-center">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {checklist.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-slate-500 italic">
                    Seluruh prosedur operasional telah disesuaikan dengan instruksi kerja.
                  </td>
                </tr>
              ) : (
                checklist.map((item, idx) => {
                  let statusLabel = 'Selesai'
                  let notesLabel = item.completed_at
                    ? `${new Date(item.completed_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
                    : 'Terverifikasi'

                  if (item.is_na) {
                    statusLabel = 'Tidak Berlaku (N/A)'
                    notesLabel = item.na_reason || 'Tidak relevan dengan unit'
                  }

                  return (
                    <tr key={item.id} className="border-b border-slate-200 even:bg-slate-50/40">
                      <td className="border-r border-slate-300 px-3 py-1.5 text-center font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="border-r border-slate-300 px-3 py-1.5 text-slate-900">
                        {item.item}
                      </td>
                      <td className="border-r border-slate-300 px-3 py-1.5 text-center font-medium text-slate-900">
                        {statusLabel}
                      </td>
                      <td className="px-3 py-1.5 text-center text-slate-600 text-[11px]">
                        {notesLabel}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. DOKUMENTASI FOTO PEKERJAAN (TABEL RESMI) */}
        {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
          <div className="mb-6 space-y-1.5 text-xs page-break-inside-avoid">
            <p className="font-bold text-slate-950 uppercase tracking-wider text-[11px]">
              4. DOKUMENTASI FOTO PEKERJAAN
            </p>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-semibold border-b border-slate-300 text-center">
                  <th className="p-2 border-r border-slate-300 w-1/2">Kondisi Sebelum Pengerjaan (Before)</th>
                  <th className="p-2 w-1/2">Kondisi Sesudah Pengerjaan (After)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="align-top">
                  <td className="p-3 border-r border-slate-300">
                    {beforePhotos.length === 0 ? (
                      <p className="text-center text-slate-400 py-6 italic text-[11px]">
                        Tidak ada foto sebelum pengerjaan.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {beforePhotos.map((p, idx) => (
                          <div key={p.id} className="aspect-4/3 overflow-hidden bg-slate-100 flex flex-col">
                            <img
                              src={p.signed_url}
                              alt={`Sebelum #${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="text-[10px] text-center font-mono text-slate-600 bg-slate-100 py-0.5">
                              Foto #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    {afterPhotos.length === 0 ? (
                      <p className="text-center text-slate-400 py-6 italic text-[11px]">
                        Tidak ada foto sesudah pengerjaan.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {afterPhotos.map((p, idx) => (
                          <div key={p.id} className="aspect-4/3 overflow-hidden bg-slate-100 flex flex-col">
                            <img
                              src={p.signed_url}
                              alt={`Sesudah #${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="text-[10px] text-center font-mono text-slate-600 bg-slate-100 py-0.5">
                              Foto #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* PENGESAHAN & TANDA TANGAN (KEDUA BELAH PIHAK) - Tanpa Outline Box */}
        <div className="mt-6 page-break-inside-avoid text-xs">
          <p className="text-slate-800 mb-4 leading-relaxed text-justify">
            Demikian Berita Acara Penyelesaian Pekerjaan ini dibuat dengan sebenar-benarnya dan ditandatangani
            oleh kedua belah pihak sebagai bukti sah bahwa pekerjaan teknis di atas telah selesai dilaksanakan
            dengan baik dan telah diterima serta diuji bersama oleh pihak pelanggan.
          </p>

          <div className="grid grid-cols-2 gap-8 text-center pt-2">
            {/* PIHAK KEDUA: Pelanggan (Dengan Goresan E-Signature Asli) */}
            <div className="flex flex-col items-center justify-between min-h-[160px]">
              <div>
                <p className="font-bold text-slate-950 uppercase tracking-wider text-[11px]">
                  PIHAK KEDUA
                </p>
                <p className="text-[11px] text-slate-600">Pelanggan / Penerima Jasa</p>
              </div>

              {/* Render Gambar Tanda Tangan Digital */}
              <div className="h-20 w-48 flex items-center justify-center my-2">
                {signature?.signed_url ? (
                  <img
                    src={signature.signed_url}
                    alt={`Tanda tangan ${signature.customer_name}`}
                    className="max-h-20 max-w-full object-contain filter contrast-125 select-none"
                  />
                ) : (
                  <span className="text-[11px] text-slate-400 italic">
                    (Belum ditandatangani)
                  </span>
                )}
              </div>

              <div className="border-t border-slate-400 pt-1 w-48">
                <p className="font-bold text-slate-950 uppercase">
                  {signature?.customer_name || customer?.name || 'Pelanggan'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {signature?.signed_at
                    ? `${new Date(signature.signed_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })} • ${new Date(signature.signed_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })} WIB`
                    : formattedDateStr}
                </p>
              </div>
            </div>

            {/* PIHAK PERTAMA: Pelaksana Jasa / Teknisi */}
            <div className="flex flex-col items-center justify-between min-h-[160px]">
              <div>
                <p className="font-bold text-slate-950 uppercase tracking-wider text-[11px]">
                  PIHAK PERTAMA
                </p>
                <p className="text-[11px] text-slate-600">Pelaksana Jasa / Teknisi</p>
              </div>

              {/* Verifikasi Identitas Teknisi & Sistem */}
              <div className="h-20 w-48 flex flex-col items-center justify-center my-2 text-center">
                <span className="inline-block px-2.5 py-1 rounded border border-[#007ACC] bg-[#EBF5FC] text-[#007ACC] text-[10px] font-bold tracking-wider uppercase mb-1">
                  TERVALIDASI SISTEM
                </span>
                <p className="text-[9.5px] font-mono text-slate-500">
                  WO: {job.job_number}
                </p>
              </div>

              <div className="border-t border-slate-400 pt-1 w-48">
                <p className="font-bold text-slate-950 uppercase">
                  {technician?.name || 'Teknisi Bertugas'}
                </p>
                <p className="text-[10px] text-slate-500">{organization.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CATATAN KAKI RESMI DOKUMEN */}
        <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
          Dokumen Berita Acara ini diterbitkan secara elektronik dan sah sebagai bukti pemenuhan layanan jasa operasional lapangan.
        </div>
      </div>
    </div>
  )
}
