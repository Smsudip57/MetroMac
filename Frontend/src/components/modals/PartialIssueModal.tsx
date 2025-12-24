import ResponsiveModalSheet from "@/components/modals/ResponsiveModalSheet";
import { Button as BaseButton } from "@/components/ui/button";
import { handleError } from "@/helpers/ErrorHandler";
import { formatPrice } from "@/helpers/formatPrice";
import { useRouter } from "next/navigation";
import { useState } from "react";

import toast from "react-hot-toast";

interface PartialIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    due_amount: number;
    deducted_amount: number;
    bookingId: string;
}

const PartialIssueModal = ({
    isOpen,
    onClose,
    due_amount,
    deducted_amount,
    bookingId,
}: PartialIssueModalProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Handle ticket issuance
    const handlePartialIssue = async () => {
        try {
            setIsLoading(true);
            toast.success("Partial issued successfully!");
            onClose();
            // Redirect to home page
            router.push("/partial-journey/issued-tickets");
        } catch (error: any) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ResponsiveModalSheet
            open={isOpen}
            onOpenChange={onClose}
            scrollable={false}
            modalWidth="460px"
            side="bottom">
            <div>
                <div className="md:mb-4 mb-2">
                    <h2 className="md:text-base text-sm font-semibold ">
                        Do you want to pay partially for this booking?
                    </h2>

                    <div className="flex flex-col gap-2 mt-4 text-xs text-light-beta font-semibold">
                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-light-beta">
                                Due Amount :
                            </span>
                            <span className="text-light-alpha font-bold">
                                {formatPrice(due_amount)}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 ">
                            <span className="font-semibold text-light-beta">
                                Amount That Will Be Deducted :
                            </span>
                            <span className="text-light-alpha font-bold">
                                {formatPrice(deducted_amount)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4  items-center md:mt-6 mt-4">
                    <BaseButton
                        title={isLoading ? "Processing..." : "Yes, Issue"}
                        className="md:w-48 w-full rounded-xl"
                        disabled={isLoading}
                        onClick={handlePartialIssue}
                    />
                    <BaseButton
                        onClick={onClose}
                        variant="outline"
                        title="No, Cancel"
                        className="md:w-48 w-full rounded-xl"
                        disabled={isLoading}
                    />
                </div>
            </div>
        </ResponsiveModalSheet>
    );
};

export default PartialIssueModal;
