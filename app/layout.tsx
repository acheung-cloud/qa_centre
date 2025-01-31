import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@aws-amplify/ui-react/styles.css";
import AuthenticatedLayout from "./components/AuthenticatedLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QA Centre",
  description: "QA Centre Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-100`}>
        <div className="min-h-full">
          <AuthenticatedLayout>{children}</AuthenticatedLayout>
        </div>
      </body>
    </html>
  );
}
