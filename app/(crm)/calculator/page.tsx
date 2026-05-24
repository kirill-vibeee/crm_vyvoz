const CALC_URL =
  process.env.NEXT_PUBLIC_CALCULATOR_URL ||
  'https://waste-calculator-production.up.railway.app/static/index.html'

export default function CalculatorPage() {
  return (
    <div className="h-full flex flex-col">
      <header className="h-12 px-4 flex items-center border-b border-border shrink-0">
        <h1 className="text-[13px] font-semibold text-text">AI калькулятор</h1>
      </header>
      <iframe
        src={CALC_URL}
        className="flex-1 w-full border-0 bg-white"
        title="AI калькулятор"
      />
    </div>
  )
}
