import "./globals.css";
import {Rubik} from "next/font/google";

// components
import Navbar from "./components/Navbar";

const rubik = Rubik({subsets: ["latin"]});

export const metadata = {
  title: "歡迎來到 NSTRLabs",
  description: "正在為您轉跳至 Alvin 的個人網站",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body className={`${rubik.className}`}>
        <Navbar />
        <div className="-mt-8">
          {children}
        </div>
      </body>
    </html>
  );
}
