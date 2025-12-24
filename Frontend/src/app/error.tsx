"use client";

// import {Button as BaseButton} from "@/components/ui/button";
// import { useRouter } from "next/navigation";
import { GoAlertFill } from "react-icons/go";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  // const router = useRouter();

  return (
    <div className="flex flex-col items-center mt-20 min-h-[calc(100%-200px)]">
      <div className="mt-40 text-center flex flex-col gap-5 max-w-[700px] mx-auto">
        <GoAlertFill
          size={74}
          className="text_highlight-emerald-light mx-auto"
        />
        <h2 className="text-2xl text_highlight-emerald-light font-bold mb-4">
          {error.message || "Oops! Something went wrong!"}
        </h2>
        <div className="flex gap-2 justify-center flex-wrap items-center">
          {/* <BaseButton
            onClick={() => {
              // Navigate back to the previous page
              router.back();
            }}
            variant="default"
            className="h-10 w-32"
          >
            Go Back
          </BaseButton> */}

          {/* <BaseButton
            onClick={() => {
              window.location.reload();
            }}
            variant="outline"
            className="h-10 w-32"
          >
            Refresh
          </BaseButton> */}

          {/* <BaseButton
            onClick={() => {
              // Navigate back to the previous page
              router.push("/");
            }}
            variant="gradient"
            className="h-10 w-32"
          >
            Go Home
          </BaseButton> */}
        </div>
      </div>
    </div>
  );
}
