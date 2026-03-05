import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SNA Draw Request Reorganizer',
  description: 'Organize SNA Draw Request Excel files by lot name',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {/* Navigation */}
        <nav className="bg-sna-navy text-white sticky top-0 z-50 shadow-md">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">SNA Draw Request</h1>
              <p className="text-sm text-teal-100">Excel Reorganizer</p>
            </div>
            <a
              href="/"
              className="hover:text-sna-teal transition"
            >
              Upload
            </a>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 border-t border-gray-200 mt-12">
          <div className="max-w-6xl mx-auto px-6 py-6 text-center text-gray-600 text-sm">
            <p>SNA Draw Request Reorganizer © 2026</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
