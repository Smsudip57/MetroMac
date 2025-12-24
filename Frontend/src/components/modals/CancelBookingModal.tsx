import ResponsiveModalSheet from "@/components/modals/ResponsiveModalSheet";
import { Button as BaseButton } from "@/components/ui/button";
import { handleError } from "@/helpers/ErrorHandler";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
}

const CancelBookingModal = ({
  isOpen,
  onClose,
  bookingId,
}: CancelBookingModalProps) => {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelBooking = async () => {
    if (!bookingId) {
      toast.error("Booking ID not found");
      return;
    }

    try {
      setIsCancelling(true);
      toast.success("Booking cancelled successfully");
      onClose();
      router.push("/booking-history/flight-booking");
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsCancelling(false);
    }
  };
  return (
    <ResponsiveModalSheet
      open={isOpen}
      onOpenChange={onClose}
      scrollable={false}
      modalWidth="460px"
      side="bottom"
    >
      <div className="flex flex-col gap-3 py-3">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            fill="none"
            viewBox="0 0 36 36"
          >
            <path
              stroke="#CE0003"
              stroke-linecap="round"
              stroke-width="3"
              d="M23.063 23.063 12.938 12.938M31.5 18c0 7.456-6.044 13.5-13.5 13.5S4.5 25.456 4.5 18 10.544 4.5 18 4.5 31.5 10.544 31.5 18Z"
              opacity=".9"
            />
          </svg>
        </div>

        <div className="text-center">
          <h2 className="md:text-base text-sm font-semibold ">
            Do you want to Cancel this Booking?
          </h2>

          <p className="md:text-sm text-xs text-light-beta font-semibold">
            If you cancel, this booking cannot be retrieved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <BaseButton
            title={isCancelling ? "Cancelling..." : "Cancel Booking"}
            onClick={handleCancelBooking}
            variant="outline"
            className="flex-1 bg-warning text-white border-light-emerald-base hover:bg-warning md:text-sm text-xs"
            disabled={isCancelling}
          />

          <BaseButton
            variant="outline"
            title="Close"
            onClick={onClose}
            className="flex-1 md:text-sm text-xs"
            disabled={isCancelling}
          />
        </div>
      </div>
    </ResponsiveModalSheet>
  );
};

export default CancelBookingModal;
