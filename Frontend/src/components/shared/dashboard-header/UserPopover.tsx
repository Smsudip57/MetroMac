import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IUser } from "@/redux/features/authSlice";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface UserPopoverProps {
  user: IUser | null;
}

const UserPopover = ({ user }: UserPopoverProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <div>
        {/* Desktop View */}

        <div className="flex items-center text-start hover:bg-bg_shade transition-all duration-200 rounded-lg px-2 group cursor-pointer">
          <Button
            variant="ghost"
            className="flex h-auto hover:bg-transparent rounded-lg px-2 gap-2"
          >
            <div className="text-primary font-medium block text-end">
              <p className="text-xs sm+:text-sm line-clamp-1 text-text_highlight font-semibold group-hover:text-primary">
                {(user?.firstName || user?.first_name) &&
                (user?.lastName || user?.last_name)
                  ? `${user.firstName || user.first_name} ${
                      user.lastName || user.last_name
                    }`
                  : user?.username || "User"}
              </p>
              <p className="text-[10px] sm+:text-[12px] leading-[16px] text-text_highlight">
                {user?.is_super_user
                  ? "Super User"
                  : typeof user?.role === "string"
                  ? user.role
                  : user?.role?.name || "User"}
              </p>
            </div>{" "}
            {/* <ChevronDown className="size-5 ml-2 text-neutral hover:text-primary transition-colors 2xl:block hidden" />{" "} */}
          </Button>
          <div className="relative">
            <Image
              src={
                user?.profileImage ||
                "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/default-profile-picture-male-icon.png"
              }
              alt="User Profile"
              width={40}
              height={40}
              className={`rounded-full object-cover border-2 border-gray-20 transition-colors ${
                user?.profileImage ? "" : "opacity-50"
              }`}
            />
            <span className="absolute bottom-0 size-4 rounded-full bg-white right-0 flex items-center justify-center">
              <span className="w-[10px] aspect-square rounded-full bg-green-400"></span>
            </span>
          </div>
        </div>
      </div>
    </PopoverTrigger>
    <PopoverContent
      align="end"
      className="w-[280px] bg-white mt-4 px-4 pt-4 pb-4 rounded-xl shadow-lg border border-border"
    >
      <div className="flex flex-col gap-3">
        {/* User Info Section */}
        <div className="text-start pb-3 ">
          <p className="text-sm font-semibold text-text">
            {(user?.firstName || user?.first_name) &&
            (user?.lastName || user?.last_name)
              ? `${user.firstName || user.first_name} ${
                  user.lastName || user.last_name
                }`
              : user?.username || "User"}
          </p>
          <p className="text-xs text-text_highlight mt-1">{user?.email}</p>
          {/* {user?.company_name && (
            <p className="text-xs text-text_highlight mt-1">
              {user.company_name}
            </p>
          )} */}
        </div>

        {/* Role & Designation */}
        <div className="text-start space-y-1">
          {(user?.role || user?.designation) && (
            <>
              {user?.role && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text_highlight">Role:</span>
                  <span className="text-xs font-medium text-text">
                    {typeof user.role === "string"
                      ? user.role
                      : user.role?.name || "N/A"}
                  </span>
                </div>
              )}
              {user?.designation && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text_highlight">Title:</span>
                  <span className="text-xs font-medium text-text">
                    {typeof user.designation === "string"
                      ? user.designation
                      : user.designation?.name || "N/A"}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PopoverContent>
  </Popover>
);

export default UserPopover;
