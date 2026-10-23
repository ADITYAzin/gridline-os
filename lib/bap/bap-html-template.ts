export interface BapTemplateData {
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
  format?: 'f4' | 'a4'
}

export function generateBapHtml(data: BapTemplateData): string {
  const {
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
    format = 'f4',
  } = data

  const completedDate = job.completed_at ? new Date(job.completed_at) : new Date()
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const dayName = dayNames[completedDate.getDay()]
  const formattedDateStr = completedDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const dateCode = completedDate.toISOString().slice(0, 10).replace(/-/g, '')
  const bapDocNumber = `BAP/${job.job_number}/${dateCode}`

  const orgAddressParts = [
    organization.address,
    organization.city,
    organization.province ? `${organization.province} ${organization.postal_code || ''}`.trim() : null,
  ].filter(Boolean)
  const orgFullAddress = orgAddressParts.join(', ')

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

  const pageSizeStyle =
    format === 'a4'
      ? '@page { size: 210mm 297mm; margin: 12mm 14mm; }'
      : '@page { size: 215mm 330mm; margin: 12mm 15mm; }'

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${bapDocNumber}</title>
  <style>
    ${pageSizeStyle}
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11.5px;
      line-height: 1.45;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      width: 100%;
      background: #ffffff;
      padding: 0;
    }
    .border-b-thick {
      border-bottom: 2.5px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .flex-between {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .font-bold {
      font-weight: 700;
    }
    .font-semibold {
      font-weight: 600;
    }
    .uppercase {
      text-transform: uppercase;
    }
    .doc-title {
      font-size: 14px;
      letter-spacing: 0.04em;
      margin-bottom: 3px;
    }
    .doc-meta {
      font-size: 11px;
      color: #475569;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 16px;
    }
    .avoid-break {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .party-box {
      border-left: 3px solid #007ACC;
      padding-left: 10px;
    }
    .party-title {
      font-size: 10.5px;
      font-weight: 700;
      color: #007ACC;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .party-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .party-table td {
      padding: 2.5px 0;
      vertical-align: top;
    }
    .party-table td.label {
      width: 75px;
      color: #64748b;
    }
    .party-table td.val {
      color: #0f172a;
      font-weight: 500;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 16px;
      border: 1px solid #cbd5e1;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
    }
    table.data-table th {
      background-color: #f1f5f9;
      font-weight: 600;
      color: #1e293b;
    }
    table.data-table td.bg-muted {
      background-color: #f8fafc;
      color: #475569;
      font-weight: 500;
      width: 25%;
    }
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    .photo-item {
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      background: #f8fafc;
      text-align: center;
    }
    .photo-item img {
      width: 100%;
      height: 110px;
      object-fit: cover;
      display: block;
    }
    .photo-caption {
      font-size: 9.5px;
      padding: 3px;
      background: #f1f5f9;
      color: #475569;
      font-family: monospace;
    }
    .sig-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 16px;
    }
    .sig-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .sig-box {
      height: 75px;
      width: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 8px 0;
    }
    .sig-box img {
      max-height: 75px;
      max-width: 100%;
      object-fit: contain;
    }
    .sig-line {
      border-top: 1px solid #64748b;
      width: 180px;
      padding-top: 4px;
    }
    .badge-verified {
      display: inline-block;
      padding: 2px 6px;
      background: #ebf5fc;
      border: 1px solid #007ACC;
      color: #007ACC;
      font-size: 9px;
      font-weight: 700;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }
    .doc-footer {
      margin-top: 24px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      font-size: 9.5px;
      color: #64748b;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <!-- KOP SURAT -->
    <div class="border-b-thick flex-between avoid-break">
      <div style="max-width: 65%;">
        <h1 style="font-size: 17px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.01em; color: #020617; line-height: 1.25; margin-bottom: 4px;">
          ${organization.name}
        </h1>
        ${orgFullAddress ? `<p style="font-size: 11px; color: #334155; line-height: 1.4; margin-bottom: 3px;">${orgFullAddress}</p>` : ''}
        <div style="font-size: 10.5px; color: #64748b;">
          ${organization.phone ? `<span>Telp: ${organization.phone}</span>` : ''}
          ${organization.phone && organization.email ? ` • ` : ''}
          ${organization.email ? `<span>Email: ${organization.email}</span>` : ''}
        </div>
      </div>
      <div class="text-right" style="shrink: 0;">
        <span class="badge-verified">DOKUMEN RESMI</span>
        <div class="font-mono font-bold" style="font-size: 11.5px; color: #0f172a; margin-top: 4px;">${bapDocNumber}</div>
        <div style="font-size: 10.5px; color: #64748b; margin-top: 2px;">${formattedDateStr}</div>
      </div>
    </div>

    <!-- JUDUL DOKUMEN -->
    <div class="text-center avoid-break" style="margin: 14px 0 16px 0;">
      <h2 class="doc-title font-bold uppercase">BERITA ACARA PENYELESAIAN PEKERJAAN</h2>
      <div class="doc-meta">Nomor: <strong class="font-mono" style="color: #0f172a;">${bapDocNumber}</strong></div>
    </div>

    <!-- KLAUSUL PEMBUKA -->
    <p style="font-size: 11px; color: #334155; line-height: 1.5; margin-bottom: 14px; text-align: justify;" class="avoid-break">
      Pada hari ini, <strong>${dayName}</strong>, tanggal <strong>${formattedDateStr}</strong>, telah selesai dilaksanakan pekerjaan teknis operasional lapangan dengan rincian kesepakatan antara pihak-pihak di bawah ini:
    </p>

    <!-- DATA PARA PIHAK -->
    <div class="grid-2 avoid-break">
      <div class="party-box">
        <div class="party-title">PELAKSANA JASA</div>
        <table class="party-table">
          <tr><td class="label">Perusahaan</td><td class="val">: ${organization.name}</td></tr>
          <tr><td class="label">Teknisi</td><td class="val">: ${technician?.name || '-'}</td></tr>
          <tr><td class="label">Kontak</td><td class="val">: ${technician?.phone || organization.phone || '-'}</td></tr>
        </table>
      </div>
      <div class="party-box">
        <div class="party-title">PELANGGAN</div>
        <table class="party-table">
          <tr><td class="label">Nama Klien</td><td class="val">: ${customer?.name || '-'}</td></tr>
          <tr><td class="label">Kontak</td><td class="val">: ${customer?.phone || '-'}</td></tr>
          <tr><td class="label">Alamat</td><td class="val">: ${job.address || customer?.address || '-'}</td></tr>
        </table>
      </div>
    </div>

    <!-- 1. RINCIAN PEKERJAAN & ASET -->
    <div class="avoid-break">
      <div class="section-title">1. RINCIAN PEKERJAAN & ASET UNIT</div>
      <table class="data-table">
        <tr>
          <td class="bg-muted">Jenis Layanan</td>
          <td style="font-weight: 600;">${job.service_type}</td>
          <td class="bg-muted">Nomor Work Order</td>
          <td class="font-mono" style="font-weight: 600;">${job.job_number}</td>
        </tr>
        <tr>
          <td class="bg-muted">Unit Aset</td>
          <td>${asset ? `${asset.asset_name} (${asset.brand})` : '-'}</td>
          <td class="bg-muted">Model & No. Seri</td>
          <td class="font-mono" style="font-size: 10.5px;">${asset?.model_number || '-'} / SN: ${asset?.serial_number || '-'}</td>
        </tr>
        <tr>
          <td class="bg-muted">Lokasi Unit</td>
          <td>${asset?.location_tag || '-'}</td>
          <td class="bg-muted">Status Garansi</td>
          <td>${warrantyText}</td>
        </tr>
        <tr>
          <td class="bg-muted">Waktu Pengerjaan</td>
          <td colspan="3">
            ${
              attendance?.check_in_at
                ? `Mulai: ${new Date(attendance.check_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
                : schedule?.start_at
                ? `Jadwal: ${new Date(schedule.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
                : '-'
            } • ${
              job.completed_at
                ? `Selesai: ${new Date(job.completed_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
                : '-'
            }
          </td>
        </tr>
      </table>
    </div>

    <!-- 2. URAIAN KELUHAN & TINDAKAN PERBAIKAN -->
    <div class="avoid-break">
      <div class="section-title">2. URAIAN KELUHAN & TINDAKAN PERBAIKAN</div>
      <table class="data-table">
        <tr>
          <td class="bg-muted">Keluhan / Kendala</td>
          <td style="line-height: 1.45;">${job.issue}</td>
        </tr>
        <tr>
          <td class="bg-muted">Tindakan & Hasil</td>
          <td style="line-height: 1.45;">${report?.result || 'Pekerjaan perbaikan dan pemeriksaan teknis telah diselesaikan sesuai standar teknis operasional.'}</td>
        </tr>
        ${
          report?.notes
            ? `<tr>
                <td class="bg-muted">Catatan / Saran</td>
                <td style="font-style: italic; line-height: 1.45; color: #334155;">${report.notes}</td>
              </tr>`
            : ''
        }
      </table>
    </div>

    <!-- 3. PEMERIKSAAN PROSEDUR KERJA (SOP) -->
    <div class="avoid-break">
      <div class="section-title">3. PEMERIKSAAN PROSEDUR KERJA (SOP)</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 36px; text-align: center;">No</th>
            <th style="text-align: left;">Item Prosedur Kerja</th>
            <th style="width: 110px; text-align: center;">Hasil</th>
            <th style="width: 120px; text-align: center;">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${
            checklist.length === 0
              ? `<tr><td colspan="4" style="text-align: center; color: #64748b; font-style: italic; padding: 10px;">Seluruh prosedur operasional telah disesuaikan dengan instruksi kerja.</td></tr>`
              : checklist
                  .map((item, idx) => {
                    let statusLabel = 'Selesai'
                    let notesLabel = item.completed_at
                      ? `${new Date(item.completed_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
                      : 'Terverifikasi'
                    if (item.is_na) {
                      statusLabel = 'Tidak Berlaku (N/A)'
                      notesLabel = item.na_reason || 'Tidak relevan'
                    }
                    return `<tr>
                      <td style="text-align: center;" class="font-mono">${idx + 1}</td>
                      <td>${item.item}</td>
                      <td style="text-align: center; font-weight: 500;">${statusLabel}</td>
                      <td style="text-align: center; color: #64748b; font-size: 10.5px;">${notesLabel}</td>
                    </tr>`
                  })
                  .join('')
          }
        </tbody>
      </table>
    </div>

    <!-- 4. DOKUMENTASI FOTO PEKERJAAN -->
    ${
      beforePhotos.length > 0 || afterPhotos.length > 0
        ? `<div class="avoid-break" style="margin-bottom: 16px;">
            <div class="section-title">4. DOKUMENTASI FOTO PEKERJAAN</div>
            <table class="data-table" style="margin-bottom: 0;">
              <thead>
                <tr>
                  <th style="width: 50%; text-align: center;">Kondisi Sebelum Pengerjaan (Before)</th>
                  <th style="width: 50%; text-align: center;">Kondisi Sesudah Pengerjaan (After)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="vertical-align: top; padding: 8px;">
                    ${
                      beforePhotos.length === 0
                        ? `<p style="text-align: center; color: #94a3b8; font-style: italic; padding: 18px 0;">Tidak ada foto sebelum pengerjaan.</p>`
                        : `<div class="photo-grid">
                            ${beforePhotos
                              .map(
                                (p, i) => `
                              <div class="photo-item">
                                <img src="${p.signed_url}" alt="Before #${i + 1}" />
                                <div class="photo-caption">Foto #${i + 1}</div>
                              </div>
                            `
                              )
                              .join('')}
                          </div>`
                    }
                  </td>
                  <td style="vertical-align: top; padding: 8px;">
                    ${
                      afterPhotos.length === 0
                        ? `<p style="text-align: center; color: #94a3b8; font-style: italic; padding: 18px 0;">Tidak ada foto sesudah pengerjaan.</p>`
                        : `<div class="photo-grid">
                            ${afterPhotos
                              .map(
                                (p, i) => `
                              <div class="photo-item">
                                <img src="${p.signed_url}" alt="After #${i + 1}" />
                                <div class="photo-caption">Foto #${i + 1}</div>
                              </div>
                            `
                              )
                              .join('')}
                          </div>`
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>`
        : ''
    }

    <!-- PENGESAHAN & TANDA TANGAN -->
    <div class="avoid-break" style="margin-top: 14px;">
      <p style="font-size: 11px; color: #334155; line-height: 1.45; margin-bottom: 10px; text-align: justify;">
        Demikian Berita Acara Penyelesaian Pekerjaan ini dibuat dengan sebenar-benarnya dan disahkan oleh kedua belah pihak sebagai bukti resmi bahwa pekerjaan teknis di atas telah selesai dilaksanakan dan diuji bersama.
      </p>
      <div class="sig-grid">
        <!-- PIHAK KEDUA: Pelanggan -->
        <div class="sig-col">
          <div class="font-bold uppercase" style="font-size: 11px; color: #0f172a;">PIHAK KEDUA</div>
          <div style="font-size: 10px; color: #64748b; margin-bottom: 4px;">Pelanggan / Penerima Jasa</div>
          <div class="sig-box">
            ${
              signature?.signed_url
                ? `<img src="${signature.signed_url}" alt="Tanda tangan" />`
                : `<span style="font-size: 10.5px; color: #94a3b8; font-style: italic;">(Belum ditandatangani)</span>`
            }
          </div>
          <div class="sig-line">
            <div class="font-bold uppercase" style="font-size: 11px; color: #0f172a;">
              ${signature?.customer_name || customer?.name || 'Pelanggan'}
            </div>
            <div style="font-size: 9.5px; color: #64748b;">
              ${
                signature?.signed_at
                  ? `${new Date(signature.signed_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })} • ${new Date(signature.signed_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })} WIB`
                  : formattedDateStr
              }
            </div>
          </div>
        </div>

        <!-- PIHAK PERTAMA: Pelaksana Jasa / Teknisi -->
        <div class="sig-col">
          <div class="font-bold uppercase" style="font-size: 11px; color: #0f172a;">PIHAK PERTAMA</div>
          <div style="font-size: 10px; color: #64748b; margin-bottom: 4px;">Pelaksana Jasa / Teknisi</div>
          <div class="sig-box" style="flex-direction: column;">
            <div class="badge-verified" style="margin-bottom: 4px;">TERVALIDASI SISTEM</div>
            <div class="font-mono" style="font-size: 9.5px; color: #64748b;">WO: ${job.job_number}</div>
          </div>
          <div class="sig-line">
            <div class="font-bold uppercase" style="font-size: 11px; color: #0f172a;">
              ${technician?.name || 'Teknisi Bertugas'}
            </div>
            <div style="font-size: 9.5px; color: #64748b;">${organization.name}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- CATATAN KAKI RESMI DOKUMEN -->
    <div class="doc-footer avoid-break">
      Dokumen Berita Acara ini diterbitkan secara elektronik dan sah sebagai bukti pemenuhan layanan jasa operasional lapangan Gridline OS.
    </div>
  </div>
</body>
</html>`
}
