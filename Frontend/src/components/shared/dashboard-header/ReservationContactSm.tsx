import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {FiPhone, FiMail} from "react-icons/fi";
import {BiSupport} from "react-icons/bi";

const ReservationContactSm: React.FC<{
    reservationEmail?: string;
    reservationPhone?: string;
    contactEmail?: string;
    contactPhone?: string;
}> = ({reservationEmail, reservationPhone, contactEmail, contactPhone}) => {
    return (
        <Popover>
            <PopoverTrigger className="lg:hidden">
                <BiSupport className="md:size-8 size-6 text-light-emerald-base cursor-pointer" />
            </PopoverTrigger>

            <PopoverContent
                side="bottom"
                align="center"
                className="w-[200px] mt-5 bg-white rounded-xl shadow-[0px_4px_40px_0px_rgba(85,153,153,0.28)]   overflow-hidden">
                <div className="flex-col justify-start items-start gap-2 lg:gap-5 inline-flex">
                    <div className="text-light-alpha">
                        <p className="text-sm font-semibold mb-2">
                            Reservation
                        </p>
                        <div className="flex flex-col items-start gap-2 text-xs">
                            <div className="flex items-center gap-2">
                                <FiPhone className="size-4 text-light-emerald-base" />{" "}
                                {reservationPhone ?? "N/A"}
                            </div>
                            <div className="flex items-center gap-2">
                                <FiMail className="size-4 text-light-emerald-base" />{" "}
                                {reservationEmail ?? "N/A"}
                            </div>
                        </div>
                    </div>
                    <div className="text-light-alpha">
                        <p className="text-sm font-semibold mb-2">Contact</p>
                        <div className="flex flex-col items-start gap-2 text-xs">
                            <div className="flex items-center gap-2">
                                <FiPhone className="size-4 text-light-emerald-base" />{" "}
                                {contactPhone ?? "N/A"}
                            </div>
                            <div className="flex items-center gap-2">
                                <FiMail className="size-4 text-light-emerald-base" />{" "}
                                {contactEmail ?? "N/A"}
                            </div>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default ReservationContactSm;
