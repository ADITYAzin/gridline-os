'use client'

import * as React from 'react'
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  X,
  ArrowRight,
  Database,
  Check,
  FileText,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import {
  importCustomersAction,
  type ImportCustomerItem,
} from '@/app/actions/customers'

interface ParsedCustomerRow {
  name: string
  phone: string
  email: string
  address: string
  dateRegistered: string
  isValid: boolean
  validationError?: string
}

export interface ImportCustomersDialogProps {
  trigger?: React.ReactNode
  onSuccess?: () => void
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const cleanText = text.replace(/^\uFEFF/, '').trim()
  if (!cleanText) return { headers: [], rows: [] }

  // Detect delimiter (comma, semicolon, or tab)
  const firstLine = cleanText.split(/\r\n|\n|\r/)[0] || ''
  const commaCount = (firstLine.match(/,/g) || []).length
  const semiCount = (firstLine.match(/;/g) || []).length
  const tabCount = (firstLine.match(/\t/g) || []).length

  let delimiter = ','
  if (semiCount > commaCount && semiCount > tabCount) delimiter = ';'
  else if (tabCount > commaCount && tabCount > semiCount) delimiter = '\t'

  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i]
    const nextChar = cleanText[i + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"'
        i++ // Skip escaped quote
      } else if (char === '"') {
        inQuotes = false
      } else {
        currentField += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === delimiter) {
        currentRow.push(currentField.trim())
        currentField = ''
      } else if (char === '\r' || char === '\n') {
        if (char === '\r' && nextChar === '\n') i++ // Skip \n in \r\n
        currentRow.push(currentField.trim())
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow)
        }
        currentRow = []
        currentField = ''
      } else {
        currentField += char
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow)
    }
  }

  if (rows.length === 0) return { headers: [], rows: [] }
  const headers = rows[0]
  const dataRows = rows.slice(1)
  return { headers, rows: dataRows }
}

function mapHeaders(headers: string[]) {
  const mapping = {
    nameIndex: -1,
    phoneIndex: -1,
    emailIndex: -1,
    contactIndex: -1,
    addressIndex: -1,
    dateIndex: -1,
  }

  headers.forEach((h, idx) => {
    const norm = h.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (
      norm.includes('nama') ||
      norm.includes('company') ||
      norm.includes('perusahaan') ||
      norm.includes('customer') ||
      norm.includes('pelanggan') ||
      norm.includes('client') ||
      norm === 'name'
    ) {
      if (mapping.nameIndex === -1) mapping.nameIndex = idx
    } else if (
      norm.includes('phone') ||
      norm.includes('telepon') ||
      norm.includes('telp') ||
      norm.includes('nohp') ||
      norm.includes('handphone') ||
      norm.includes('whatsapp') ||
      norm.includes('wa')
    ) {
      if (mapping.phoneIndex === -1) mapping.phoneIndex = idx
    } else if (
      norm.includes('email') ||
      norm.includes('surel') ||
      norm.includes('mail')
    ) {
      if (mapping.emailIndex === -1) mapping.emailIndex = idx
    } else if (norm.includes('contact') || norm.includes('kontak')) {
      if (mapping.contactIndex === -1) mapping.contactIndex = idx
    } else if (
      norm.includes('alamat') ||
      norm.includes('address') ||
      norm.includes('lokasi') ||
      norm.includes('street')
    ) {
      if (mapping.addressIndex === -1) mapping.addressIndex = idx
    } else if (
      norm.includes('daftar') ||
      norm.includes('register') ||
      norm.includes('created') ||
      norm.includes('tanggal') ||
      norm.includes('date')
    ) {
      if (mapping.dateIndex === -1) mapping.dateIndex = idx
    }
  })

  // Fallbacks if positional
  if (mapping.nameIndex === -1 && headers.length > 0) mapping.nameIndex = 0
  if (mapping.addressIndex === -1 && headers.length > 2) mapping.addressIndex = 2

  return mapping
}

export function ImportCustomersDialog({
  trigger,
  onSuccess,
}: ImportCustomersDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [parsedRows, setParsedRows] = React.useState<ParsedCustomerRow[]>([])
  const [isParsing, setIsParsing] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [parseError, setParseError] = React.useState<string | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const resetState = () => {
    setFile(null)
    setParsedRows([])
    setParseError(null)
    setIsSubmitting(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) {
      resetState()
    }
  }

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv') && selectedFile.type !== 'text/csv') {
      toast.error('File harus berformat CSV (.csv)')
      return
    }

    setFile(selectedFile)
    setIsParsing(true)
    setParseError(null)

    try {
      const text = await selectedFile.text()
      const { headers, rows } = parseCSV(text)

      if (rows.length === 0) {
        setParseError('File CSV tidak memiliki baris data atau kosong.')
        setParsedRows([])
        setIsParsing(false)
        return
      }

      const mapping = mapHeaders(headers)

      const parsed: ParsedCustomerRow[] = rows.map((r, i) => {
        const name = (mapping.nameIndex !== -1 ? r[mapping.nameIndex] : r[0]) || ''
        let phone = mapping.phoneIndex !== -1 ? r[mapping.phoneIndex] || '' : ''
        let email = mapping.emailIndex !== -1 ? r[mapping.emailIndex] || '' : ''

        // Fallback for general contact column
        if (!phone && mapping.contactIndex !== -1) {
          const contactVal = r[mapping.contactIndex] || ''
          if (contactVal.includes('@')) {
            if (!email) email = contactVal
          } else {
            phone = contactVal
          }
        }

        const address =
          (mapping.addressIndex !== -1 ? r[mapping.addressIndex] : r[2]) || ''
        const dateRegistered =
          mapping.dateIndex !== -1 ? r[mapping.dateIndex] || '' : ''

        const isValid = Boolean(name.trim() && address.trim())
        let validationError: string | undefined = undefined
        if (!name.trim()) validationError = 'Nama kosong'
        else if (!address.trim()) validationError = 'Alamat kosong'

        return {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          dateRegistered: dateRegistered.trim(),
          isValid,
          validationError,
        }
      })

      setParsedRows(parsed)
    } catch {
      setParseError('Gagal membaca dan memproses file CSV.')
    } finally {
      setIsParsing(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleDownloadSampleCSV = () => {
    const sampleContent =
      'Nama Perusahaan,Kontak Telepon,Email,Alamat Servis,Tanggal Terdaftar\r\n' +
      'PT Kencana Retail Mandiri,081234567890,kencana@retail.co.id,Jl. Jend. Sudirman Kav. 45 Jakarta Pusat,2026-01-15\r\n' +
      'Klinik Medika Sejahtera,082198765432,info@medikasejahtera.com,Jl. Gatot Subroto No. 12 Jakarta Selatan,2026-03-22\r\n' +
      'Restoran Garuda Nusantara,081388776655,operasional@garudaresto.id,Ruko Kelapa Gading Blok QA/10 Jakarta Utara,2026-06-10\r\n' +
      'CV Logistik Cepat Indonesia,085712345678,admin@cepatlogistik.com,Kawasan Pergudangan Pluit Blok C No. 8 Jakarta Utara,2026-08-04\r\n' +
      'PT Surya Mandiri Elektrindo,081122334455,surya.mandiri@gmail.com,Jl. Daan Mogot KM 11 No. 24 Jakarta Barat,2026-09-18\r\n'

    const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'template_migrasi_pelanggan_gridline.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Template CSV berhasil diunduh.')
  }

  const validRows = parsedRows.filter((r) => r.isValid)

  const handleExecuteImport = async () => {
    if (validRows.length === 0) {
      toast.error('Tidak ada data valid yang dapat diimpor.')
      return
    }

    setIsSubmitting(true)

    const payload: ImportCustomerItem[] = validRows.map((r) => ({
      name: r.name,
      phone: r.phone || null,
      email: r.email || null,
      address: r.address,
      dateRegistered: r.dateRegistered || null,
    }))

    try {
      const res = await importCustomersAction(payload)

      if (!res.success) {
        toast.error(res.error || 'Gagal memigrasikan data pelanggan.')
      } else {
        toast.success(
          `Berhasil memigrasikan ${res.importedCount} pelanggan ke database!`,
          {
            description:
              'Setiap pelanggan otomatis mendapatkan ID sistem baru dan terdaftar di organisasi Anda.',
          }
        )
        onSuccess?.()
        setOpen(false)
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan saat migrasi data.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            type="button"
            variant="outline"
            className="h-8 px-3 rounded-[8px] border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#0F172A] font-medium text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <UploadCloud className="h-3.5 w-3.5 text-[#007ACC]" />
            <span>Import CSV</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Fixed Header on the Top Container */}
        <div className="p-5 sm:p-6 pb-4 border-b border-border/60 bg-background shrink-0 sticky top-0 z-10 pr-12">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#EBF5FC] text-[#007ACC] border border-[#D0E8F8] flex items-center justify-center shrink-0">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground font-heading">
                  Migrasi & Import Data Pelanggan
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Unggah file CSV untuk memigrasikan database klien ke sistem. Nilai nama, kontak, alamat, dan tanggal terdaftar dipertahankan, sedangkan ID unik dibuat otomatis.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Body Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* STEP 1: Upload Dropzone if no file selected */}
          {!file && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/80 hover:border-[#007ACC] hover:bg-[#EBF5FC]/30 rounded-2xl p-8 text-center transition-all cursor-pointer space-y-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0])
                    }
                  }}
                />

                <div className="h-12 w-12 rounded-xl bg-[#EBF5FC] border border-[#D0E8F8] text-[#007ACC] flex items-center justify-center mx-auto shadow-xs">
                  <UploadCloud className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Klik untuk memilih file CSV atau seret file ke sini
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Mendukung file tabel berekstensi .csv (format Excel / Google Sheets)
                  </p>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted text-muted-foreground text-[11px] font-medium border border-border/60">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-[#007ACC]" />
                    Pilih File dari Komputer
                  </span>
                </div>
              </div>

              {/* Template Download Box */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-[#007ACC] shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground block">
                      Belum punya format tabel yang sesuai?
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Unduh template resmi berisikan kolom nama perusahaan, kontak, alamat, dan tanggal terdaftar.
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSampleCSV}
                  className="h-8 text-xs font-medium gap-1.5 shrink-0 border-[#CBD5E1] hover:bg-muted cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-[#007ACC]" />
                  <span>Unduh Template CSV</span>
                </Button>
              </div>

              {/* Guidelines Info */}
              <div className="p-3.5 rounded-xl bg-[#EBF5FC]/60 border border-[#D0E8F8] text-[11px] text-[#475569] space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
                  <Sparkles className="h-3.5 w-3.5 text-[#007ACC]" />
                  <span>Ketentuan Format Kolom:</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Nama Perusahaan / Klien:</strong> Wajib diisi (identitas utama pelanggan).
                  </li>
                  <li>
                    <strong className="text-foreground">Kontak Telepon & Email:</strong> Kolom nomor telepon / WhatsApp dan alamat email.
                  </li>
                  <li>
                    <strong className="text-foreground">Alamat Servis:</strong> Wajib diisi (lokasi penugasan tiket teknisi).
                  </li>
                  <li>
                    <strong className="text-foreground">Tanggal Terdaftar:</strong> Format YYYY-MM-DD atau DD/MM/YYYY (jika kosong, menggunakan tanggal hari ini).
                  </li>
                  <li>
                    <strong className="text-foreground">ID Pelanggan:</strong> Dihasilkan secara otomatis oleh sistem (UUID unik).
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 2: Preview & Validation Table */}
          {file && (
            <div className="space-y-4">
              {/* File details bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center font-bold text-xs shrink-0">
                    CSV
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} total baris terdeteksi
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={resetState}
                    className="h-7 text-xs px-2.5 cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    Ganti File
                  </Button>
                </div>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg border border-border/60 bg-card">
                  <span className="text-[11px] text-muted-foreground block">Total Baris</span>
                  <span className="font-bold text-sm text-foreground">
                    {parsedRows.length} Data
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block">
                    Siap Dimigrasi
                  </span>
                  <span className="font-bold text-sm text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    {validRows.length} Data Valid
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-border/60 bg-card col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-muted-foreground block">ID Pelanggan</span>
                  <span className="font-bold text-xs text-[#007ACC] flex items-center gap-1 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Auto UUID (Sistem)
                  </span>
                </div>
              </div>

              {parseError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Preview Table Container */}
              <div className="rounded-xl border border-border/70 overflow-hidden shadow-2xs">
                <div className="p-2.5 bg-muted/40 border-b border-border/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Pratinjau Data yang Akan Dimigrasikan (Maks. 50 Baris Pertama):
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Menampilkan {Math.min(parsedRows.length, 50)} dari {parsedRows.length} data
                  </span>
                </div>

                <div className="max-h-64 overflow-x-auto overflow-y-auto">
                  <Table className="text-xs">
                    <TableHeader className="bg-muted/60 sticky top-0 z-10">
                      <TableRow className="border-b border-border/70">
                        <TableHead className="h-8 px-3 text-[11px] font-semibold text-muted-foreground w-12 text-center">
                          #
                        </TableHead>
                        <TableHead className="h-8 px-3 text-[11px] font-semibold text-muted-foreground min-w-[110px]">
                          ID (Auto)
                        </TableHead>
                        <TableHead className="h-8 px-3 text-[11px] font-semibold text-muted-foreground min-w-[160px]">
                          Nama Perusahaan
                        </TableHead>
                        <TableHead className="h-8 px-3 text-[11px] font-semibold text-muted-foreground min-w-[140px]">
                          Kontak (HP / Email)
                        </TableHead>
                        <TableHead className="h-8 px-3 text-[11px] font-semibold text-muted-foreground min-w-[180px]">
                          Alamat Servis
                        </TableHead>
                        <TableHead className="h-8 px-3 text-[11px] font-semibold text-muted-foreground min-w-[110px]">
                          Tgl Terdaftar
                        </TableHead>
                        <TableHead className="h-8 px-3 text-[11px] font-semibold text-muted-foreground text-center w-20">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedRows.slice(0, 50).map((row, idx) => (
                        <TableRow
                          key={idx}
                          className={`border-b border-border/40 transition-colors ${
                            !row.isValid ? 'bg-destructive/5' : 'hover:bg-muted/20'
                          }`}
                        >
                          <TableCell className="px-3 py-2 text-center font-mono text-[11px] text-muted-foreground">
                            {idx + 1}
                          </TableCell>

                          <TableCell className="px-3 py-2">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-[#007ACC] border border-[#007ACC]/20">
                              auto-uuid
                            </span>
                          </TableCell>

                          <TableCell className="px-3 py-2 font-semibold text-foreground truncate max-w-[160px]">
                            {row.name || (
                              <span className="text-destructive italic font-normal">
                                [Nama Kosong]
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="px-3 py-2">
                            <div className="space-y-0.5">
                              {row.phone ? (
                                <span className="font-mono text-[11px] text-foreground block">
                                  {row.phone}
                                </span>
                              ) : null}
                              {row.email ? (
                                <span className="text-[10px] text-muted-foreground block truncate max-w-[140px]">
                                  {row.email}
                                </span>
                              ) : null}
                              {!row.phone && !row.email && (
                                <span className="text-[10px] text-muted-foreground italic">
                                  -
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="px-3 py-2 text-muted-foreground max-w-[200px]">
                            <span
                              className={`line-clamp-2 ${
                                !row.address ? 'text-destructive italic' : ''
                              }`}
                              title={row.address}
                            >
                              {row.address || '[Alamat Kosong]'}
                            </span>
                          </TableCell>

                          <TableCell className="px-3 py-2 text-[11px] text-muted-foreground whitespace-nowrap">
                            {row.dateRegistered || (
                              <span className="text-muted-foreground italic">Hari ini</span>
                            )}
                          </TableCell>

                          <TableCell className="px-3 py-2 text-center">
                            {row.isValid ? (
                              <Badge
                                variant="secondary"
                                className="text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium px-1.5 py-0"
                              >
                                Valid
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[10px] border-destructive/30 bg-destructive/10 text-destructive font-medium px-1.5 py-0"
                                title={row.validationError}
                              >
                                Tidak Valid
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer at the Bottom Container */}
        <div className="p-4 sm:p-5 pt-3 border-t border-border/50 bg-background shrink-0 sticky bottom-0 z-10">
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
              className="h-9 text-xs px-4 cursor-pointer"
            >
              Batal
            </Button>

            {file && (
              <Button
                type="button"
                disabled={isSubmitting || validRows.length === 0}
                onClick={handleExecuteImport}
                className="h-9 text-xs font-semibold bg-[#007ACC] hover:bg-[#0062A3] text-white px-5 gap-2 cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Memigrasikan {validRows.length} Pelanggan...
                  </>
                ) : (
                  <>
                    <Database className="h-3.5 w-3.5" />
                    Migrasikan {validRows.length} Pelanggan
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
