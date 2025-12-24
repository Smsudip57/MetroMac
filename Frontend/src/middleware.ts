"use server";
import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";
import {verifyToken} from "./lib/jwt";

// Only define public routes - everything else will be private by default
const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/news",
    /^\/news-details(\?slug=[\w-]+)?$/, // news details with optional slug as query param
    /^\/cms\/[\w-]+$/,
    /^\/public\/.*/,
    /^\/icons\/.*/,
    /^\/images\/.*/,
    "/faqs",
];

// Routes that should redirect to DASHBOARD if user is logged in
const RESTRICTED_IF_AUTHENTICATED: (string | RegExp)[] = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
];

// export async function middleware(request: NextRequest) {
//     const {pathname} = request.nextUrl;
//     const isPublicRoute = publicRoutes.some((route) =>
//         typeof route === "string" ? route === pathname : route.test(pathname)
//     );
//     // Check if current route should be restricted for authenticated users
//     const shouldRestrictForAuthenticated = RESTRICTED_IF_AUTHENTICATED.some(
//         (route) =>
//             typeof route === "string"
//                 ? route === pathname
//                 : route.test(pathname)
//     );

//     const isDevelopment = process.env.NEXT_PUBLIC_IS_DEVELOPMENT === "true";

//     // Determine which token to use based on environment
//     const tokenName = isDevelopment
//         ? "triplio_access_token"
//         : "b2b_access_token";
//     const token = request.cookies.get(tokenName)?.value;

//     // Log environment mode
//     console.log(isDevelopment ? "Development mode" : "Production mode");

//     // Verify the token
//     const {isValid, decoded} = await verifyToken(token);
//     const isAuthenticated = isValid && decoded?.user_type === "B2B";

//     console.log("Decoded Token: ", decoded);

//     // If the route is public and the token is valid, redirect to the flight search page
//     if (isAuthenticated && shouldRestrictForAuthenticated) {
//         console.log(
//             `Authenticated user trying to access ${pathname} - redirecting to dashboard`
//         );
//         return NextResponse.redirect(new URL("/search-page", request.url));
//     }

//     // If the route is private and no token is available, redirect to the home page
//     if (!isPublicRoute && !token) {
//         return NextResponse.redirect(new URL("/login", request.url));
//     }

//     // Ensure that the token is valid and decoded properly (user_type === 'B2B')
//     if (!isPublicRoute && token && (!isValid || decoded?.user_type !== "B2B")) {
//         // Create a redirect response
//         const response = NextResponse.redirect(new URL("/login", request.url));
//         return response;
//     }

//     return NextResponse.next();
// }

// // Configure which routes to run middleware on
// export const config = {
//     matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };


export async function middleware(request: NextRequest) {
    return NextResponse.next();
}