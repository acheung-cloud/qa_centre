'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Home() {
  
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // window.location.href = 'https://alvinscloud.com/zh-tw';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-gray-400 to-gray-800 text-white pt-16">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-4xl font-bold mb-4">歡迎蒞臨 NSTRLabs！</h1>
        <p className="text-xl text-gray-100 mb-8">很高興您能來到這裡，讓我們為您導向至<b>Alvin&apos;s 雲揚世界</b>網站。</p>
        
        <div className="my-12 transform hover:scale-105 transition-transform duration-300">
          <Image 
            src="/images/alvinscloud_logo.png"
            alt="Alvin's Cloud Venture"
            width={300}
            height={100}
            className="mx-auto"
            priority
          />
        </div>

        <div className="text-lg text-gray-200 space-y-4">
          <p>
            請點擊{' '}
            <a 
              href="https://alvinscloud.com/zh-tw" 
              className="text-blue-400 hover:text-blue-100 underline font-semibold"
            >
              這裡
            </a>
            {' '}前往 Alvin 的個人網站
          </p>
          <p>頁面將在 {countdown} 秒後自動跳轉...</p>
        </div>
      </div>
    </main>
  );
}
