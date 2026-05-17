export default function CalculatorPage() {
  const calculatorUrl = process.env.NEXT_PUBLIC_CALCULATOR_URL || 'http://localhost:8000/static/index.html'

  return (
    <div className="w-full h-screen">
      <iframe
        src={calculatorUrl}
        className="w-full h-full border-0"
        title="AI Калькулятор"
      />
    </div>
  )
}
