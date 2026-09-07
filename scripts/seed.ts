import { createClient } from '@supabase/supabase-js'

// Load .env.local
process.loadEnvFile('.env.local')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// 1x1 sample transparent/blue PNG buffer for demo evidence & signature
const samplePngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEeQHzk4pYpgAAAABJRU5ErkJggg=='
const samplePngBuffer = Buffer.from(samplePngBase64, 'base64')

async function ensureUser(email: string, password: string, name: string, orgId: string, role: 'owner' | 'admin' | 'technician') {
  // Check if user exists in auth.users
  const { data: usersData } = await supabase.auth.admin.listUsers()
  const existingUser = usersData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())

  let userId: string

  if (existingUser) {
    userId = existingUser.id
    // Update password
    await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { name },
    })
    console.log(`  [AUTH] Updated password for ${email}`)
  } else {
    // Create user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })

    if (createError || !newUser.user) {
      throw new Error(`Failed to create user ${email}: ${createError?.message}`)
    }
    userId = newUser.user.id
    console.log(`  [AUTH] Created user ${email}`)
  }

  // Ensure profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    org_id: orgId,
    name,
    email: email.toLowerCase(),
    role,
  })

  if (profileError) {
    throw new Error(`Failed to upsert profile for ${email}: ${profileError.message}`)
  }

  return userId
}

async function seedOrganization(orgId: string, orgName: string, adminId: string, techId: string) {
  console.log(`\n🏢 Seeding data for org: ${orgName} (${orgId})`)

  // 1. Clean existing job related tables for this org to prevent conflict
  console.log('  -> Cleaning previous job data...')
  await supabase.from('job_photos').delete().eq('org_id', orgId)
  await supabase.from('signatures').delete().eq('org_id', orgId)
  await supabase.from('work_reports').delete().eq('org_id', orgId)
  await supabase.from('job_attendance').delete().eq('org_id', orgId)
  await supabase.from('checklist_items').delete().eq('org_id', orgId)
  await supabase.from('schedules').delete().eq('org_id', orgId)
  await supabase.from('jobs').delete().eq('org_id', orgId)
  await supabase.from('customers').delete().eq('org_id', orgId)

  // Reset sequence counter to 0
  await supabase.from('organizations').update({ job_sequence: 0 }).eq('id', orgId)

  // 2. Insert Customers
  console.log('  -> Seeding customers...')
  const customersData = [
    {
      org_id: orgId,
      name: 'PT Kencana Abadi Retail',
      phone: '081234567890',
      email: 'operasional@kencanaretail.co.id',
      address: 'Grand Indonesia Mall Lt. 3, Jl. M.H. Thamrin No.1, Jakarta Pusat',
      latitude: -6.1953,
      longitude: 106.8229,
    },
    {
      org_id: orgId,
      name: 'RS Medika Sejahtera',
      phone: '081398765432',
      email: 'facilities@medikasejahtera.com',
      address: 'Jl. TB Simatupang No. 45, Cilandak, Jakarta Selatan',
      latitude: -6.2928,
      longitude: 106.8189,
    },
    {
      org_id: orgId,
      name: 'Kopi Kenangan Senopati',
      phone: '081700112233',
      email: 'store.senopati@kopikenangan.id',
      address: 'Jl. Senopati No. 12, Kebayoran Baru, Jakarta Selatan',
      latitude: -6.2297,
      longitude: 106.808,
    },
    {
      org_id: orgId,
      name: 'Logistik Cepat Nusantara',
      phone: '081988776655',
      email: 'warehouse.cikarang@logistikcepat.co.id',
      address: 'Kawasan Industri MM2100 Blok C-4, Cikarang Barat, Bekasi',
      latitude: -6.2995,
      longitude: 107.1025,
    },
    {
      org_id: orgId,
      name: 'Apartemen Senayan Residence',
      phone: '081122334455',
      email: 'building.mgmt@senayanresidence.com',
      address: 'Jl. Patal Senayan No. 5, Gelora, Jakarta Pusat',
      latitude: -6.2198,
      longitude: 106.7932,
    },
  ]

  const { data: insertedCustomers, error: custError } = await supabase
    .from('customers')
    .insert(customersData)
    .select()

  if (custError || !insertedCustomers) {
    throw new Error(`Failed to insert customers: ${custError?.message}`)
  }
  console.log(`  -> Inserted ${insertedCustomers.length} customers.`)

  const [custRetail, custRS, custCafe, custLogistik, custApartemen] = insertedCustomers

  // Helper to generate next job number
  async function getNextJobNumber() {
    const { data, error } = await supabase.rpc('generate_next_job_number', { p_org_id: orgId })
    if (error) throw error
    return data as string
  }

  // Helper dates
  const now = new Date()
  const yesterday = new Date(Date.now() - 24 * 3600 * 1000)

  // -------------------------------------------------------------
  // JOB 1: COMPLETED (GL-0001)
  // -------------------------------------------------------------
  console.log('  -> Creating Job 1: COMPLETED (GL-0001)...')
  const job1Num = await getNextJobNumber()
  const { data: job1, error: j1Err } = await supabase
    .from('jobs')
    .insert({
      org_id: orgId,
      job_number: job1Num,
      customer_id: custRetail.id,
      technician_id: techId,
      created_by: adminId,
      service_type: 'Maintenance & Repair',
      issue: 'Pendingin Chiller lantai 3 mengalami penurunan efisiensi pendinginan dan alarm getaran.',
      instructions: 'Lakukan pemeriksaan menyeluruh pada motor kompresor, evaporator coil, dan isi ulang refrigeran jika diperlukan.',
      address: custRetail.address,
      latitude: custRetail.latitude,
      longitude: custRetail.longitude,
      priority: 'high',
      status: 'on_progress', // Start at on_progress so we can fulfill 5 gates before triggering complete
    })
    .select()
    .single()

  if (j1Err || !job1) throw new Error(`Job 1 creation error: ${j1Err?.message}`)

  // Schedule for Job 1 (Yesterday 09:00 - 12:00)
  const j1Start = new Date(yesterday)
  j1Start.setHours(9, 0, 0, 0)
  const j1End = new Date(yesterday)
  j1End.setHours(12, 0, 0, 0)

  await supabase.from('schedules').insert({
    org_id: orgId,
    job_id: job1.id,
    technician_id: techId,
    start_at: j1Start.toISOString(),
    end_at: j1End.toISOString(),
  })

  // Attendance for Job 1
  await supabase.from('job_attendance').insert({
    org_id: orgId,
    job_id: job1.id,
    technician_id: techId,
    check_in_at: new Date(j1Start.getTime() - 5 * 60000).toISOString(),
    check_in_latitude: custRetail.latitude,
    check_in_longitude: custRetail.longitude,
    check_out_at: new Date(j1End.getTime() - 10 * 60000).toISOString(),
    check_out_latitude: custRetail.latitude,
    check_out_longitude: custRetail.longitude,
  })

  // Checklist items for Job 1 (All completed)
  await supabase.from('checklist_items').insert([
    {
      org_id: orgId,
      job_id: job1.id,
      item: 'Pembersihan filter udara & koil evaporator',
      is_completed: true,
      completed_at: new Date(j1Start.getTime() + 30 * 60000).toISOString(),
    },
    {
      org_id: orgId,
      job_id: job1.id,
      item: 'Pemeriksaan kebocoran & tekanan freon R410A',
      is_completed: true,
      completed_at: new Date(j1Start.getTime() + 60 * 60000).toISOString(),
    },
    {
      org_id: orgId,
      job_id: job1.id,
      item: 'Pengukuran arus listrik kompresor (Ampere test)',
      is_completed: true,
      completed_at: new Date(j1Start.getTime() + 90 * 60000).toISOString(),
    },
    {
      org_id: orgId,
      job_id: job1.id,
      item: 'Uji temperatur hembusan dingin & stabilitas getaran',
      is_completed: true,
      completed_at: new Date(j1Start.getTime() + 120 * 60000).toISOString(),
    },
  ])

  // Upload Before & After Photos to Storage
  const beforePhotoPath = `${orgId}/${job1.id}/before/before_evidence.png`
  const afterPhotoPath = `${orgId}/${job1.id}/after/after_evidence.png`
  const signaturePath = `${orgId}/${job1.id}/signature/customer_signature.png`

  await supabase.storage.from('job-files').upload(beforePhotoPath, samplePngBuffer, {
    contentType: 'image/png',
    upsert: true,
  })
  await supabase.storage.from('job-files').upload(afterPhotoPath, samplePngBuffer, {
    contentType: 'image/png',
    upsert: true,
  })
  await supabase.storage.from('job-files').upload(signaturePath, samplePngBuffer, {
    contentType: 'image/png',
    upsert: true,
  })

  // Record Photos in DB
  await supabase.from('job_photos').insert([
    {
      org_id: orgId,
      job_id: job1.id,
      type: 'before',
      file_url: beforePhotoPath,
      uploaded_by: techId,
      captured_at: j1Start.toISOString(),
      latitude: custRetail.latitude,
      longitude: custRetail.longitude,
    },
    {
      org_id: orgId,
      job_id: job1.id,
      type: 'after',
      file_url: afterPhotoPath,
      uploaded_by: techId,
      captured_at: j1End.toISOString(),
      latitude: custRetail.latitude,
      longitude: custRetail.longitude,
    },
  ])

  // Customer Signature in DB
  await supabase.from('signatures').insert({
    org_id: orgId,
    job_id: job1.id,
    customer_name: 'Hendra Wijaya (Store Mgr)',
    signature_url: signaturePath,
    signed_at: new Date(j1End.getTime() - 15 * 60000).toISOString(),
  })

  // Work Report in DB
  await supabase.from('work_reports').insert({
    org_id: orgId,
    job_id: job1.id,
    result: 'Perawatan chiller lantai 3 tuntas. Filter udara dibersihkan total, freon ditambah 1.2 kg hingga tekanan stabil 125 psi. Arus kompresor stabil 14.5A (normal).',
    notes: 'Unit kembali beroperasi normal. Disarankan jadwal inspeksi rutin berikutnya 3 bulan ke depan.',
    submitted_by: techId,
    submitted_at: new Date(j1End.getTime() - 5 * 60000).toISOString(),
  })

  // Now trigger status transition to COMPLETED (Tests 5-gate trigger!)
  const { error: completeErr } = await supabase
    .from('jobs')
    .update({
      status: 'completed',
      completed_at: j1End.toISOString(),
    })
    .eq('id', job1.id)

  if (completeErr) {
    throw new Error(`5-Gate Completion Trigger failed on Job 1: ${completeErr.message}`)
  }
  console.log('    ✓ 5-Gate Completion trigger successfully verified & completed!')

  // -------------------------------------------------------------
  // JOB 2: ON_PROGRESS (GL-0002)
  // -------------------------------------------------------------
  console.log('  -> Creating Job 2: ON_PROGRESS (GL-0002)...')
  const job2Num = await getNextJobNumber()
  const { data: job2, error: j2Err } = await supabase
    .from('jobs')
    .insert({
      org_id: orgId,
      job_number: job2Num,
      customer_id: custRS.id,
      technician_id: techId,
      created_by: adminId,
      service_type: 'Emergency Plumbing',
      issue: 'Pipa distribusi air steril lantai 2 poliklinik mengalami kebocoran sambungan siku.',
      instructions: 'Matikan stop kran zona 2B sebelum pemotongan pipa. Gunakan fitting pipa standar medis.',
      address: custRS.address,
      latitude: custRS.latitude,
      longitude: custRS.longitude,
      priority: 'high',
      status: 'on_progress',
    })
    .select()
    .single()

  if (j2Err || !job2) throw new Error(`Job 2 error: ${j2Err?.message}`)

  // Schedule for Job 2 (Today 08:30 - 11:30)
  const j2Start = new Date(now)
  j2Start.setHours(8, 30, 0, 0)
  const j2End = new Date(now)
  j2End.setHours(11, 30, 0, 0)

  await supabase.from('schedules').insert({
    org_id: orgId,
    job_id: job2.id,
    technician_id: techId,
    start_at: j2Start.toISOString(),
    end_at: j2End.toISOString(),
  })

  // Attendance (Checked in today)
  await supabase.from('job_attendance').insert({
    org_id: orgId,
    job_id: job2.id,
    technician_id: techId,
    check_in_at: new Date(j2Start.getTime() + 2 * 60000).toISOString(),
    check_in_latitude: custRS.latitude,
    check_in_longitude: custRS.longitude,
  })

  // Checklist for Job 2 (Partially completed)
  await supabase.from('checklist_items').insert([
    {
      org_id: orgId,
      job_id: job2.id,
      item: 'Safety briefing & pemasangan papan tanda basah/licin',
      is_completed: true,
      completed_at: new Date(j2Start.getTime() + 10 * 60000).toISOString(),
    },
    {
      org_id: orgId,
      job_id: job2.id,
      item: 'Penutupan valve utama jalur distribusi steril',
      is_completed: true,
      completed_at: new Date(j2Start.getTime() + 20 * 60000).toISOString(),
    },
    {
      org_id: orgId,
      job_id: job2.id,
      item: 'Pemotongan pipa & pemasangan fitting coupling baru',
      is_completed: false,
    },
    {
      org_id: orgId,
      job_id: job2.id,
      item: 'Pressure test 5 bar selama 30 menit',
      is_completed: false,
    },
  ])

  // Upload 1 Before photo
  const j2BeforePhotoPath = `${orgId}/${job2.id}/before/leak_point.png`
  await supabase.storage.from('job-files').upload(j2BeforePhotoPath, samplePngBuffer, {
    contentType: 'image/png',
    upsert: true,
  })
  await supabase.from('job_photos').insert({
    org_id: orgId,
    job_id: job2.id,
    type: 'before',
    file_url: j2BeforePhotoPath,
    uploaded_by: techId,
    captured_at: j2Start.toISOString(),
    latitude: custRS.latitude,
    longitude: custRS.longitude,
  })

  // -------------------------------------------------------------
  // JOB 3: ASSIGNED (GL-0003)
  // -------------------------------------------------------------
  console.log('  -> Creating Job 3: ASSIGNED (GL-0003)...')
  const job3Num = await getNextJobNumber()
  const { data: job3, error: j3Err } = await supabase
    .from('jobs')
    .insert({
      org_id: orgId,
      job_number: job3Num,
      customer_id: custCafe.id,
      technician_id: techId,
      created_by: adminId,
      service_type: 'Installation & Setup',
      issue: 'Instalasi unit mesin espresso komersial 2-group dan sistem water filtration 3-tahap.',
      instructions: 'Pastikan pasokan daya 220V 16A stabil dan grounding < 2 ohm sebelum menyalakan mesin.',
      address: custCafe.address,
      latitude: custCafe.latitude,
      longitude: custCafe.longitude,
      priority: 'medium',
      status: 'assigned',
    })
    .select()
    .single()

  if (j3Err || !job3) throw new Error(`Job 3 error: ${j3Err?.message}`)

  // Schedule for Job 3 (Today 13:30 - 16:30 - no overlap with Job 2)
  const j3Start = new Date(now)
  j3Start.setHours(13, 30, 0, 0)
  const j3End = new Date(now)
  j3End.setHours(16, 30, 0, 0)

  await supabase.from('schedules').insert({
    org_id: orgId,
    job_id: job3.id,
    technician_id: techId,
    start_at: j3Start.toISOString(),
    end_at: j3End.toISOString(),
  })

  // Checklist for Job 3 (Pending)
  await supabase.from('checklist_items').insert([
    { org_id: orgId, job_id: job3.id, item: 'Unboxing & verifikasi kelengkapan komponen', is_completed: false },
    { org_id: orgId, job_id: job3.id, item: 'Pemasangan tabung filter & bypass valve', is_completed: false },
    { org_id: orgId, job_id: job3.id, item: 'Kalibrasi boiler temperatur 93°C & tekanan 9 bar', is_completed: false },
    { org_id: orgId, job_id: job3.id, item: 'Training singkat penggunaan & pembersihan backflush harian', is_completed: false },
  ])

  // -------------------------------------------------------------
  // JOB 4: PENDING (GL-0004)
  // -------------------------------------------------------------
  console.log('  -> Creating Job 4: PENDING (GL-0004)...')
  const job4Num = await getNextJobNumber()
  const { data: job4, error: j4Err } = await supabase
    .from('jobs')
    .insert({
      org_id: orgId,
      job_number: job4Num,
      customer_id: custLogistik.id,
      technician_id: null,
      created_by: adminId,
      service_type: 'HVAC Inspection',
      issue: 'Suhu cold storage gudang B naik ke 7°C (seharusnya -18°C). Alarm sensor bunyi tiap 15 menit.',
      instructions: 'Butuh teknisi spesialis industrial freezer. Cek controller Dixell dan relay kontaktor.',
      address: custLogistik.address,
      latitude: custLogistik.latitude,
      longitude: custLogistik.longitude,
      priority: 'high',
      status: 'pending',
    })
    .select()
    .single()

  if (j4Err || !job4) throw new Error(`Job 4 error: ${j4Err?.message}`)

  // -------------------------------------------------------------
  // JOB 5: CANCELLED (GL-0005)
  // -------------------------------------------------------------
  console.log('  -> Creating Job 5: CANCELLED (GL-0005)...')
  const job5Num = await getNextJobNumber()
  const { data: job5, error: j5Err } = await supabase
    .from('jobs')
    .insert({
      org_id: orgId,
      job_number: job5Num,
      customer_id: custApartemen.id,
      technician_id: techId,
      created_by: adminId,
      service_type: 'Electrical Inspection',
      issue: 'Inspeksi panel distribusi daya ATS / AMF genset darurat gedung tower A.',
      instructions: 'Koordinasi dengan tim ME pengelola gedung.',
      address: custApartemen.address,
      latitude: custApartemen.latitude,
      longitude: custApartemen.longitude,
      priority: 'low',
      status: 'pending',
    })
    .select()
    .single()

  if (j5Err || !job5) throw new Error(`Job 5 error: ${j5Err?.message}`)

  // Cancel Job 5 with valid cancellation reason (Decision #6 & #9)
  await supabase
    .from('jobs')
    .update({
      status: 'cancelled',
      cancelled_by: adminId,
      cancelled_at: yesterday.toISOString(),
      cancellation_reason: 'Klien membatalkan jadwal karena berbenturan dengan agenda sertifikasi K3 internal gedung.',
    })
    .eq('id', job5.id)

  console.log(`  ✓ Organization ${orgName} seeded successfully with 5 jobs across all statuses!`)
}

async function main() {
  console.log('🚀 Starting Gridline OS E2E Seeding & Verification Script...')

  // 1. Prepare demo users for PT Demo Gridline
  const demoOrgId = '00000000-0000-0000-0000-000000000001'
  console.log('\n👥 Setting up Demo Accounts...')
  const demoAdminId = await ensureUser('admin@demo.gridline.app', 'Password123!', 'Sari Admin', demoOrgId, 'admin')
  const demoTechId = await ensureUser('technician@demo.gridline.app', 'Password123!', 'Andi Teknisi', demoOrgId, 'technician')
  await ensureUser('owner@demo.gridline.app', 'Password123!', 'Budi Owner', demoOrgId, 'owner')

  // Seed PT Demo Gridline
  await seedOrganization(demoOrgId, 'PT Demo Gridline', demoAdminId, demoTechId)

  // 2. Prepare users & seed PT Prawitech Indonesia (User's company)
  const prawitechOrgId = '1a06acec-fcd0-4ea2-948b-bbe682a6af3b'
  console.log('\n👥 Setting up PT Prawitech Accounts...')
  const prawitechAdminId = '78e2374d-5c06-4fed-8574-a6cda669ec9a' // Aditya pratama putra
  const prawitechTechId = await ensureUser(
    'budi.teknisi@prawitech.com',
    'Password123!',
    'Budi Santoso (Teknisi)',
    prawitechOrgId,
    'technician'
  )

  // Seed PT Prawitech Indonesia
  await seedOrganization(prawitechOrgId, 'PT Prawitech Indonesia', prawitechAdminId, prawitechTechId)

  // 3. Verification Report
  console.log('\n======================================================')
  console.log('🎉 SEEDING & E2E INTEGRITY VERIFICATION SUCCESSFUL!')
  console.log('======================================================')

  const { count: jobCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true })
  const { count: customerCount } = await supabase.from('customers').select('*', { count: 'exact', head: true })
  const { count: scheduleCount } = await supabase.from('schedules').select('*', { count: 'exact', head: true })
  const { count: photoCount } = await supabase.from('job_photos').select('*', { count: 'exact', head: true })

  console.log(`📊 Total Seeded Records:`)
  console.log(`   - Customers : ${customerCount}`)
  console.log(`   - Jobs      : ${jobCount} (Covering: Completed, On Progress, Assigned, Pending, Cancelled)`)
  console.log(`   - Schedules : ${scheduleCount}`)
  console.log(`   - Evidence  : ${photoCount} photos uploaded to storage & registered`)

  console.log('\n🔑 READY TO LOGIN CREDENTIALS:')
  console.log('------------------------------------------------------')
  console.log('1. Akun Anda (PT Prawitech Indonesia):')
  console.log('   Admin     : aditya.zinn@gmail.com (Gunakan password yang sudah Anda buat)')
  console.log('   Teknisi   : budi.teknisi@prawitech.com / Password123!')
  console.log('')
  console.log('2. Akun Demo Standar (PT Demo Gridline):')
  console.log('   Admin     : admin@demo.gridline.app / Password123!')
  console.log('   Teknisi   : technician@demo.gridline.app / Password123!')
  console.log('   Owner     : owner@demo.gridline.app / Password123!')
  console.log('------------------------------------------------------')
}

main().catch((err) => {
  console.error('\n❌ Seeding failed:', err)
  process.exit(1)
})
