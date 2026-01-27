import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "@/components/session-provider"
import { TooltipProvider } from "@/components/tooltip-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "LMG Platform - Gestão Financeira",
  description: "Plataforma completa de gestão financeira e patrimonial",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <TooltipProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
