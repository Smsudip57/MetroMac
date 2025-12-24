"use client";
import {BackIcon} from "@/assets/svg/BackIcon";
import {useRouter} from "next/navigation";

export default function BackButton({
    title,
    color,
    className,
}: {
    title?: string;
    color?: string;
    className?: string;
}) {
    const router = useRouter();
    return (
        <div className="flex items-center gap-2 mb-3">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2">
                <BackIcon color={color} />
            </button>
            <span
                className={`lg:text-lg md:text-base text-sm font-semibold text-light-alpha ${className}`}>
                {title || "Back"}
            </span>
        </div>
    );
}
