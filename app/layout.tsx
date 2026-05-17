import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "CRM - Вывоз мусора",
  description: "CRM система для управления сделками по вывозу мусора",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className="h-full">
      <body className="h-full bg-background text-text-primary font-sans">
        {children}
      </body>
    </html>
  )
}
