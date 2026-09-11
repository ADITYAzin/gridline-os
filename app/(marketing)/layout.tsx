import { MarketingNavbar } from '@/components/marketing/navbar'
import { MarketingFooter } from '@/components/marketing/footer'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC]">
      <MarketingNavbar />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}
