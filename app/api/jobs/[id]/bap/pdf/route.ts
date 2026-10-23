import { NextRequest, NextResponse } from 'next/server'
import { getSessionProfile } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { STORAGE } from '@/lib/constants'
import { generateBapHtml, BapTemplateData } from '@/lib/bap/bap-html-template'
import { getBrowser } from '@/lib/pdf/puppeteer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getSessionProfile()
    if (!profile) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const reqFormat = searchParams.get('format') // 'auto' | 'f4' | 'a4'

    const supabase = await createSupabaseServerClient()
    const admin = getSupabaseAdmin()

    // 1. Fetch Job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        id,
        job_number,
        service_type,
        issue,
        instructions,
        address,
        priority,
        status,
        technician_id,
        created_at,
        completed_at,
        customers(id, name, phone, email, address),
        customer_assets(id, asset_name, brand, model_number, serial_number, location_tag, warranty_expires_at, status),
        profiles!jobs_technician_id_fkey(id, name, phone, email)
      `)
      .eq('id', id)
      .eq('org_id', profile.orgId)
      .maybeSingle()

    if (jobError || !job) {
      return new NextResponse('Dokumen BAP tidak ditemukan atau tiket belum selesai', {
        status: 404,
      })
    }

    // 2. Fetch parallel data
    const [
      { data: org },
      { data: schedule },
      { data: attendance },
      { data: checklist },
      { data: rawPhotos },
      { data: signature },
      { data: report },
    ] = await Promise.all([
      admin
        .from('organizations')
        .select('id, name, address, city, province, postal_code, phone, email')
        .eq('id', profile.orgId)
        .single(),
      supabase.from('schedules').select('start_at, end_at').eq('job_id', id).maybeSingle(),
      supabase.from('job_attendance').select('*').eq('job_id', id).maybeSingle(),
      supabase.from('checklist_items').select('*').eq('job_id', id).order('created_at', { ascending: true }),
      supabase.from('job_photos').select('*').eq('job_id', id).order('created_at', { ascending: true }),
      supabase.from('signatures').select('*').eq('job_id', id).maybeSingle(),
      supabase.from('work_reports').select('*').eq('job_id', id).maybeSingle(),
    ])

    // 3. Generate Signed URLs for Photos (valid 2 hours)
    const photosWithSignedUrls = await Promise.all(
      (rawPhotos || []).map(async (photo) => {
        const { data } = await admin.storage
          .from(STORAGE.jobFilesBucket)
          .createSignedUrl(photo.file_url, 7200)
        return {
          id: photo.id,
          type: photo.type,
          signed_url: data?.signedUrl || '',
          captured_at: photo.captured_at,
        }
      })
    )

    const beforePhotos = photosWithSignedUrls.filter((p) => p.type === 'before')
    const afterPhotos = photosWithSignedUrls.filter((p) => p.type === 'after')

    // 4. Generate Signed URL for Customer Signature
    let signatureWithSignedUrl = null
    if (signature?.signature_url) {
      const { data: sigData } = await admin.storage
        .from(STORAGE.jobFilesBucket)
        .createSignedUrl(signature.signature_url, 7200)
      signatureWithSignedUrl = {
        customer_name: signature.customer_name,
        signed_url: sigData?.signedUrl || '',
        signed_at: signature.signed_at,
      }
    }

    const customer = job.customers as unknown as BapTemplateData['customer']
    const technician = job.profiles as unknown as BapTemplateData['technician']
    const asset = (Array.isArray(job.customer_assets) ? job.customer_assets[0] : job.customer_assets) as BapTemplateData['asset']

    // 5. Automatic Paper Format Selection (F4 vs A4)
    // Extra photos (>=2) or extensive checklists (>4) benefit from F4's vertical space (215 x 330mm)
    let finalFormat: 'f4' | 'a4' = 'f4'
    if (reqFormat === 'a4' || reqFormat === 'f4') {
      finalFormat = reqFormat
    } else {
      const totalPhotos = beforePhotos.length + afterPhotos.length
      const isLongContent = (checklist?.length || 0) > 4 || totalPhotos >= 2
      finalFormat = isLongContent ? 'f4' : 'a4'
    }

    const bapData: BapTemplateData = {
      organization: {
        id: org?.id || profile.orgId,
        name: org?.name || 'Perusahaan',
        address: org?.address,
        city: org?.city,
        province: org?.province,
        postal_code: org?.postal_code,
        phone: org?.phone,
        email: org?.email,
      },
      job: {
        id: job.id,
        job_number: job.job_number,
        service_type: job.service_type,
        issue: job.issue,
        instructions: job.instructions,
        address: job.address,
        priority: job.priority,
        status: job.status,
        created_at: job.created_at,
        completed_at: job.completed_at,
      },
      customer,
      asset,
      technician,
      schedule,
      attendance,
      checklist: checklist || [],
      beforePhotos,
      afterPhotos,
      signature: signatureWithSignedUrl,
      report: report || null,
      format: finalFormat,
    }

    const html = generateBapHtml(bapData)

    // 6. Launch Puppeteer Headless Engine
    const browser = await getBrowser()
    let pdfBuffer: Uint8Array

    try {
      const page = await browser.newPage()
      await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 })

      await page.setContent(html, {
        waitUntil: 'load',
        timeout: 25000,
      }).catch(() => {
        // Fallback if some assets took longer than timeout
      })

      pdfBuffer = await page.pdf({
        width: finalFormat === 'f4' ? '215mm' : '210mm',
        height: finalFormat === 'f4' ? '330mm' : '297mm',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '0mm',
          bottom: '0mm',
          left: '0mm',
          right: '0mm',
        },
      })

      await page.close()
    } finally {
      await browser.close()
    }

    const filename = `BAP-${job.job_number}-${finalFormat.toUpperCase()}.pdf`

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error generating BAP PDF:', error)
    return new NextResponse(
      `Gagal menghasilkan dokumen BAP PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    )
  }
}
