import ReservationIcon from "@/assets/svg/header/Reservation.svg";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {ChevronDown} from "lucide-react";
import {FiPhone, FiMail} from "react-icons/fi";

const ReservationPopover: React.FC<{email?: string; phone?: string}> = ({
    email,
    phone,
}) => {
    return (
        <Popover>
            {/* Desktop Trigger */}
            <div className="">
                <PopoverTrigger asChild>
                    <button className="flex justify-center items-center gap-2">
                        <ReservationIcon />
                        <span className="text-base font-semibold">
                            Reservation
                        </span>
                        <ChevronDown className="w-5 h-5 text-light-emerald-base" />
                    </button>
                </PopoverTrigger>
            </div>

            <PopoverContent
                side="bottom"
                align="center"
                className="w-[250px] mt-5 bg-white rounded-xl shadow-[0px_4px_40px_0px_rgba(85,153,153,0.28)]  overflow-hidden">
                <div className="  flex-col justify-start items-start gap-2 lg:gap-5 inline-flex">
                    <div className="text-light-alpha">
                        <p className="text-sm font-semibold mb-2">
                            Reservation
                        </p>
                        <div className="flex flex-col items-start gap-2 text-xs">
                            <div className="flex items-center gap-2">
                                <FiPhone className="size-4 text-light-emerald-base" />{" "}
                                {phone ?? "N/A"}
                            </div>
                            <div className="flex items-center gap-2">
                                <FiMail className="size-4 text-light-emerald-base" />{" "}
                                {email ?? "N/A"}
                            </div>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default ReservationPopover;
