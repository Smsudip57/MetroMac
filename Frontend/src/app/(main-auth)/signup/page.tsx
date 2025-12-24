"use client";

import dynamic from "next/dynamic";
import Loader from "@/components/reuseable/Shared/Loader";

// Dynamically import the Register component with SSR disabled
const Register = dynamic(
    () => import("@/components/pages-components/auths/register/Register"),
    {
        ssr: false,
        loading: () => <Loader />,
    }
);

const SignUpPage = () => {
    return (
        <div className="pt-32 pb-24 min-h-screen radial-gradient-auth bg-[#0b1a1a]">
            <Register />
        </div>
    );
};

export default SignUpPage;
