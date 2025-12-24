"use client";
import Loader from "@/components/reuseable/Shared/Loader";
import { useGetMeQuery } from "@/redux/api/profile/profileApi";
import { setUser } from "@/redux/features/authSlice";
import { ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps): JSX.Element => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Call the profile API using the RTK Query hook
  const { data: profileData, isLoading, isSuccess, isError, isFetching } = useGetMeQuery({});

  // When the profile data is successfully fetched, update the Redux store
  useEffect(() => {
    if (isSuccess && profileData?.user) {
      dispatch(setUser(profileData?.user));

      // If user is authenticated, handle redirects
      if (pathname === "/login" || pathname === "/register" || pathname === "/") {
        // Check for redirect parameter
        const redirect = searchParams.get("redirect");

        if (redirect) {
          // Use the redirect parameter if available
          const decodedRedirect = decodeURIComponent(redirect);
          router.push(decodedRedirect);
        } else {
          // Default to dashboard
          router.push("/dashboard");
        }
      }
    }
  }, [isSuccess, profileData?.user, dispatch, pathname, searchParams, router, isFetching]);

  // Handle authentication redirects
  useEffect(() => {
    if (isError) {
      // User is not authenticated - redirect to login if not already there
      if (pathname !== "/login" && pathname !== "/register") {
        // Don't include root path in redirect - redirect to dashboard instead
        const redirectPath = pathname === "/" ? "/dashboard" : pathname;
        router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      }
    }
  }, [isError, pathname, router]);

  // If the profile data is still loading, show a loader
  if (isLoading) return <Loader />;

  // If there's an error and user is on login/register, show children (allow login page)
  if (isError && (pathname === "/login" || pathname === "/register")) {
    return <>{children}</>;
  }

  // If there's an error and user is on protected route, show loader (will redirect)
  if (isError) {
    return <Loader />;
  }

  // Simply render the children when authenticated
  return <>{children}</>;
};
