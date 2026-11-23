import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  // Checagem otimista: apenas lê o cookie. A autorização real acontece no
  // servidor (DAL) antes de qualquer acesso a dados.
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/perfil/:path*"],
};
