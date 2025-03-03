"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center justify-between p-4">
        <div className="w-[180px]" />
        <Link href="/" className="flex h-8 w-8 items-center justify-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="black"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-gray-900"
          >
            <path d="M3 10L12 3L21 10V20H14V14H10V20H3V10Z" />
          </svg>
        </Link>
        <div className="w-[180px]" />
      </div>
      <main className="flex-1 flex flex-col items-center w-full relative">
        <div className="flex flex-col items-center justify-center h-[400px] space-y-10">
          <h1 className="text-center text-5xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
              Terraform Agent
            </span>
          </h1>
          <div className="flex items-center gap-4 mt-8">
            <div className="flex  items-center px-6 py-3 bg-white rounded-full shadow-xl border border-gray-100">
              <div className="w-150 h-150 mx-2 my-3">
                <Image
                  src="/logo.png"
                  alt="Google Cloud Logo"
                  width={40}
                  height={40}
                  className="object-contain mx-2"
                />
              </div>

              <span className="text-lg ">Flowgen </span>
            </div>
            <ArrowRight className="text-gray-400" />
            <div className="flex flex-col items-center px-6 py-3 bg-white rounded-full shadow-xl border border-gray-100">
              <div className="w-200 h-200 mx-4 my-3">
                <Image
                  src="/terraform-logo.svg"
                  alt="Terraform Logo"
                  width={150}
                  height={150}
                  className="object-contain"
                />
              </div>
            </div>
            <ArrowRight className="text-gray-400" />
            <div className="flex flex-col items-center px-6 py-3 bg-white rounded-full shadow-xl border border-gray-100">
              <div className="w-200 h-200 mx-4 my-4">
                <Image
                  src="/gcp-logo.svg"
                  alt="Google Cloud Logo"
                  width={170}
                  height={170}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          <h3 className="text-center text-sm font-bold w-[450px]">
            <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent ">
              Coming soon...
            </span>
          </h3>
        </div>
      </main>
    </div>
  );
}
