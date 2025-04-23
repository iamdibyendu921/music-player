//  import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
//  import { NextRequest, NextResponse } from "next/server";

//  export async function middleware(req: NextRequest) {
//     const res = NextResponse.next();
//     const supabase = createMiddlewareClient({
//         req,
//         res,
//     });

//     await supabase.auth.getSession();
//     return res;
//  };

// import { NextResponse, NextRequest } from 'next/server';

// export async function middleware(req: NextRequest) {
//   const token = req.cookies.get('sb-access-token')?.value;

//   if (!token && req.nextUrl.pathname.startsWith('/dashboard')) {
//     return NextResponse.redirect(new URL('/login', req.url));
//   }

//   return NextResponse.next();
// }


import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  return NextResponse.next(); // just lets everything through
}

// Optionally remove matcher if you had one in next.config.js
