import { Button as BaseButton } from "@/components/ui/button";
import Image from "next/image";
import ResponsiveModalSheet from "./ResponsiveModalSheet";
interface GenericActionModalProps {
    open: boolean;
    onClose?: () => void;
    isLoading?: boolean;
    onSubmit: () => void;
    title?: string;
    description?: string;
    acceptButtonText?: string;
    cancelButtonText?: string;
    variant?: "success" | "cancel";
    icon?: React.ReactNode;
}

const GenericActionModal = ({
    open,
    onClose,
    isLoading,
    onSubmit,
    title = "Are you sure? You want to proceed?",
    description,
    acceptButtonText = "Yes, Proceed",
    cancelButtonText = "Cancel",
    variant,
    icon,
}: GenericActionModalProps) => {
    return (
        <ResponsiveModalSheet
            open={open}
            onOpenChange={onClose || (() => { })}
            scrollable={false}
            modalWidth="480px"
            side="bottom"
        >
            <div className="flex flex-col items-center justify-center py-3 capitalize font-semibold">
                <div className="flex items-center justify-center mb-3">
                    {icon}
                </div>
                {variant === "cancel" && (
                    <div className="flex items-center justify-center mb-4">
                        <Image
                            src="/cancel.svg"
                            alt="cancel"
                            width={40}
                            height={41}
                        />
                    </div>
                )}
                {variant === "success" && (
                    <div className="flex items-center justify-center mb-4">
                        <Image
                            src="/success.svg"
                            alt="success"
                            width={40}
                            height={41}
                        />
                    </div>
                )}
                <h2 className="text-base text-center text-light-alpha ">
                    {title}
                </h2>
                {description && (
                    <p className="text-sm text-center text-light-beta mt-2">
                        {description}
                    </p>
                )}

                <div className="flex gap-4 mt-6">
                    <BaseButton
                        title={acceptButtonText}
                        className="sm:w-44 w-40 text-base"
                        variant="default"
                        onClick={onSubmit}
                        disabled={isLoading}
                    />
                    <BaseButton
                        title={cancelButtonText}
                        className="sm:w-44 w-36 text-base"
                        variant="destructive"
                        onClick={onClose}
                        disabled={isLoading}
                    />
                </div>
            </div>
        </ResponsiveModalSheet>
    );
};

export default GenericActionModal;
