"use client";
// import dynamic from "next/dynamic";
// Import other components normally
// import FAQ from "@/components/pages-components/home/Faq";
// import KeyAirlines from "@/components/pages-components/home/KeyAirlines";
// import KeyFeatures from "@/components/pages-components/home/KeyFeatures";
// import PopularDestination from "@/components/pages-components/home/PopularDestination";
// import MobileApp from "@/components/pages-components/home/MobileApp";
// import Loader from "@/components/reuseable/Shared/Loader";
import { useRouter } from "next/navigation";

// Dynamically import components that might use document with SSR disabled
// const Banner = dynamic(
//     () => import("@/components/pages-components/home/Banner"),
//     {
//         ssr: false,
//         loading: () => <Loader />,
//     }
// );

// const DynamicFooter = dynamic(
//     () => import("@/components/pages-components/home/Footer"),
//     {
//         ssr: false,
//         loading: () => <Loader />,
//     }
// );

export default function Home() {
    const router = useRouter();
    router.replace('/login');
    return null
}
