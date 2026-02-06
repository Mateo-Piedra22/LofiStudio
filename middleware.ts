export { auth as middleware } from "@/auth"

export const config = {
  matcher: ["/api/user/:path*", "/api/google/:path*"],
}
