import './globals.css';
export const metadata = { title: 'ProScore AI — Premium Predictions' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen bg-dark-900 text-white">{children}</body>
    </html>
  );
}
