import ResponsiveModalSheet from "@/components/modals/ResponsiveModalSheet";
import { Button as BaseButton } from "@/components/ui/button";
import { handleError } from "@/helpers/ErrorHandler";
import { useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface TicketIssuanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: string | number;
    bookingId: string;
}

const TicketIssuanceModal = ({
    isOpen,
    onClose,
    amount,
    bookingId,
}: TicketIssuanceModalProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const user = useAppSelector((state) => state.auth.user);

    const [balanceForm, setBalanceForm] = useState("balance");

    // Handle ticket issuance
    const handleIssueTicket = async () => {
        try {
            setIsLoading(true);
            toast.success("Ticket issued successfully!");
            onClose();
            // Redirect to home page
            router.push("/booking-history/ticketed");
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
                <div className="md:mb-4 mb-2 flex justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        fill="none"
                        viewBox="0 0 32 32">
                        <path
                            fill="#006564"
                            d="M29.845 15.677c-1.115-.558-2.57-.864-4.095-.864-1.526 0-2.98.306-4.095.864-1.39.695-2.155 1.72-2.155 2.886a2 2 0 0 0 .002.11l-.002.077v1.544c-1.069-.473-2.383-.732-3.75-.732-1.526 0-2.98.307-4.095.865-1.39.695-2.155 1.72-2.155 2.886l.001.044-.001.018v4.875c0 1.166.765 2.19 2.155 2.886 1.115.557 2.57.864 4.095.864 1.526 0 2.98-.307 4.095-.864.34-.17.642-.36.905-.567.263.207.565.397.905.567 1.115.557 2.57.864 4.095.864 1.526 0 2.98-.307 4.095-.864C31.235 30.44 32 29.416 32 28.25v-9.688c0-1.166-.765-2.19-2.155-2.885ZM18.727 28.9c-.763.381-1.848.6-2.977.6-1.129 0-2.214-.219-2.977-.6-.639-.32-.773-.607-.773-.65v-1.893c1.062.456 2.377.706 3.75.706l.14-.001a1.25 1.25 0 0 0-.03-2.5h-.11c-1.129 0-2.213-.218-2.976-.6-.64-.32-.774-.606-.774-.65 0-.043.134-.33.773-.65.763-.38 1.848-.6 2.977-.6 1.116 0 2.195.228 2.961.624.602.312.789.614.789.689v4.875c0 .043-.134.33-.773.65Zm10.773-.65c0 .043-.134.33-.773.65-.763.381-1.848.6-2.977.6-1.129 0-2.214-.219-2.977-.6-.639-.32-.773-.607-.773-.65v-1.893c1.062.456 2.377.706 3.75.706.047 0 .094 0 .14-.002a1.25 1.25 0 0 0-.03-2.5l-.11.002c-1.129 0-2.214-.22-2.977-.6-.639-.32-.773-.607-.773-.65v-1.705c1.062.456 2.377.704 3.75.704h.14a1.25 1.25 0 0 0-.015-2.5h-.125c-1.129 0-2.213-.218-2.976-.6-.64-.32-.774-.606-.774-.65 0-.043.134-.33.773-.65.763-.38 1.848-.6 2.977-.6 1.129 0 2.214.22 2.977.6.639.32.773.607.773.65v9.688ZM32 5v7a1.25 1.25 0 1 1-2.5 0V5c0-1.378-1.122-2.5-2.5-2.5H5A2.503 2.503 0 0 0 2.5 5v12.875c0 1.378 1.122 2.5 2.5 2.5h.938a1.25 1.25 0 1 1 0 2.5H5c-2.757 0-5-2.243-5-5V5c0-2.757 2.243-5 5-5h22c2.757 0 5 2.243 5 5Zm-12.502 6.574.002-.144c0-2.171-1.57-3.938-3.5-3.938s-3.5 1.767-3.5 3.938c0 1.47.722 2.809 1.884 3.493a1.25 1.25 0 0 1-1.267 2.154C11.194 15.947 10 13.782 10 11.43c0-3.55 2.692-6.438 6-6.438s6 2.888 6 6.438a6.652 6.652 0 0 1-.052.847 1.25 1.25 0 0 1-2.481-.304c.016-.131.026-.266.03-.399ZM6.062 9.813a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm20 2.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z"
                        />
                    </svg>
                </div>

                <div className="text-center md:mb-4 mb-2">
                    <h2 className="md:text-base text-sm font-semibold ">
                        Do you want to issue this ticket?
                    </h2>

                    <p className="md:text-sm text-xs text-light-beta font-semibold">
                        BDT {amount} will be deducted from your account
                    </p>
                </div>

                <div className="md:mb-2 mb-1">
                    <div className="flex flex-wrap justify-center md:items-center items-start gap-4">
                        <button
                            className={`relative border-[1.5px] py-2 px-4 rounded-xl flex items-center space-x-2 font-semibold md:text-sm text-xs ${balanceForm === "balance"
                                ? "text-light-alpha border-light-emerald-base"
                                : "text-light-beta border-light-stroke-beta"
                                }`}
                            onClick={() => setBalanceForm("balance")}>
                            {/* Outer Diamond (Border) */}
                            <span className="relative flex items-center justify-center size-4">
                                <span
                                    className={`absolute w-full h-full transform rotate-45 rounded border-2 ${balanceForm === "balance"
                                        ? "border-light-stroke-alpha"
                                        : "border-[#859593]"
                                        }`}></span>

                                {/* Inner Diamond (Background) */}
                                <span
                                    className={`size-2 transform rotate-45 ${balanceForm === "balance"
                                        ? "bg-dark-emerald-base"
                                        : "bg-light-stroke-alpha"
                                        }`}></span>
                            </span>
                            {/* Button text */}
                            <span className="capitalize md:text-sm text-xs">
                                Current Balance
                            </span>
                        </button>

                        {user?.is_credit_allowed && (
                            <button
                                className={`relative border-[1.5px] py-2 px-4 rounded-xl flex items-center space-x-2 font-semibold ${balanceForm === "credit"
                                    ? "text-light-alpha border-light-emerald-base"
                                    : "text-light-beta border-light-stroke-beta"
                                    }`}
                                onClick={() => setBalanceForm("credit")}>
                                <span className="relative flex items-center justify-center size-4">
                                    <span
                                        className={`absolute w-full h-full transform rotate-45 rounded border-2 ${balanceForm === "credit"
                                            ? "border-light-stroke-alpha"
                                            : "border-[#859593]"
                                            }`}></span>

                                    <span
                                        className={`size-2 transform rotate-45 ${balanceForm === "credit"
                                            ? "bg-dark-emerald-base"
                                            : "bg-light-stroke-alpha"
                                            }`}></span>
                                </span>

                                <span className="capitalize text-sm">
                                    Credit Balance
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 justify-center items-center md:mt-6 mt-4">
                    <BaseButton
                        title={isLoading ? "Processing..." : "Yes, Issue"}
                        className="md:w-48 w-full rounded-xl"
                        disabled={isLoading}
                        onClick={handleIssueTicket}
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

export default TicketIssuanceModal;
