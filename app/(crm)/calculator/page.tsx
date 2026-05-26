import { MobileMenuButton } from '@/components/layout/MobileMenuButton'

const CALC_URL =
  process.env.NEXT_PUBLIC_CALCULATOR_URL ||
  'https://waste-calculator-production.up.railway.app/static/index.html'

export default function CalculatorPage() {
  return (
    <div className="h-full flex flex-col">
      <header className="h-12 px-4 flex items-center border-b border-border shrink-0">
        <MobileMenuButton />
        <h1 className="text-[13px] font-semibold text-text">AI калькулятор</h1>
      </header>
      <div className="flex-1 min-h-0 p-3 md:p-4">
        <div className="h-full w-full rounded-lg overflow-hidden border border-border bg-white shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
          <iframe
            src={CALC_URL}
            className="w-full h-full border-0"
            title="AI калькулятор"
            allow="clipboard-read; clipboard-write"
          />
        </div>
      </div>
    </div>
  )
}
