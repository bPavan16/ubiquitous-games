// import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/shared/Navbar";
import "@/app/globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Multiplayer Sudoku",
  description: "Play Sudoku with friends in real-time",
};



// In layout.tsx

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
          <div className="min-h-screen bg-background">
            {/* <Navbar /> */}
            <main className="container py-6">{children}</main>
            <Toaster position="top-right" />
          </div>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}