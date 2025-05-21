import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"
import Link from "next/link"
import { SnowflakeIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "Neve Eterna - Sistema de Raids Avalonianas",
  description: "Gerencie raids e grupos para Dungeons Avalonianas no Albion Online",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-[#f0f8ff]/95 backdrop-blur supports-[backdrop-filter]:bg-[#f0f8ff]/60 dark:bg-gray-900/95 dark:border-gray-800">
              <div className="container flex h-14 items-center">
                <Link href="/" className="flex items-center gap-2 font-bold text-[#0099cc] dark:text-blue-400">
                  <SnowflakeIcon className="h-5 w-5" />
                  <span>Neve Eterna</span>
                </Link>
                <nav className="flex items-center gap-6 text-sm ml-auto">
                  <Link href="/" className="transition-colors hover:text-[#0099cc] dark:hover:text-blue-400">
                    Início
                  </Link>
                  <Link href="/mor-status" className="transition-colors hover:text-[#0099cc] dark:hover:text-blue-400">
                    Status MOR
                  </Link>
                </nav>
              </div>
            </header>
            {children}
            <footer className="border-t py-6 md:py-0 bg-[#f0f8ff] dark:bg-gray-900 dark:border-gray-800">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  &copy; {new Date().getFullYear()} Neve Eterna. Todos os direitos reservados.
                </p>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Desenvolvido por <span className="font-medium text-[#0099cc] dark:text-blue-400">TioBarney</span>
                  </p>
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground hover:text-[#0099cc] dark:hover:text-blue-400"
                  >
                    Discord
                  </Link>
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground hover:text-[#0099cc] dark:hover:text-blue-400"
                  >
                    Albion Online
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
