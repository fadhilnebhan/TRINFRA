import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin route protection
  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin');

  if (isAdminPage || isAdminApi) {
    const sessionCookie = request.cookies.get('trinfra_admin_session');

    if (!sessionCookie?.value) {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in as admin and visiting /admin/login, redirect to /admin
  if (pathname === '/admin/login') {
    const sessionCookie = request.cookies.get('trinfra_admin_session');
    if (sessionCookie?.value) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // 2. Seller route protection
  const isSellerAuthPage = pathname === '/seller/login' || pathname === '/seller/register';
  const isSellerAuthApi = pathname.startsWith('/api/seller/auth');
  const isSellerPage = pathname.startsWith('/seller') && !isSellerAuthPage;
  const isSellerApi = pathname.startsWith('/api/seller') && !isSellerAuthApi;

  if (isSellerPage || isSellerApi) {
    const userCookie = request.cookies.get('trinfra_user_session') || request.cookies.get('trinfra_admin_session');

    if (!userCookie?.value) {
      if (isSellerApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/seller/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in as user/seller and visiting seller login or register, redirect to /seller
  if (isSellerAuthPage) {
    const userCookie = request.cookies.get('trinfra_user_session') || request.cookies.get('trinfra_admin_session');
    if (userCookie?.value) {
      return NextResponse.redirect(new URL('/seller', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/seller/:path*', '/api/seller/:path*'],
};

