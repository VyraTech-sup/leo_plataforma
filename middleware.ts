export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/accounts/:path*",
    "/transactions/:path*",
    "/cards/:path*",
    "/goals/:path*",
    "/investments/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
}
