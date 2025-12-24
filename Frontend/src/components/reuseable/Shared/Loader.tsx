"use client";

export default function Loader() {
    return (
        <div className="fixed inset-0 bg-bg backdrop-blur-md flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg font-semibold text-primary">
                    Loading...
                </p>
            </div>
        </div>
    );
}
