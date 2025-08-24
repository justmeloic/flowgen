/**
 * Copyright 2025 Loïc Muhirwa
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  const { theme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[0_6px_9px_-1px_rgb(0,0,0,0.2),0_2px_4px_-2px_rgb(0,0,0,0.1)]">
      <div className="flex h-20 items-center justify-between">
        <div className="flex items-center gap-2 pl-4 ml-4">
          <Link href="/">
            <Image
              src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
              alt="AgentChat logo"
              width={62}
              height={62}
              className="cursor-pointer"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
