import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { BellRing, Circle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState as useReactState } from "react";

function Notification() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Track window width for responsive popover alignment
  const [windowWidth, setWindowWidth] = useReactState<number | undefined>(
    undefined
  );

  useEffect(() => {
    // Only run on client
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Use 'end' alignment for small devices, 'center' for md and up
  // const popoverAlign =
  //   typeof windowWidth === "number" && windowWidth < 768 ? "end" : "center";

  const popoverAlign = "end";

  const notifications: any = {};

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="relative p-2 rounded-lg hover:bg-bg_shade transition-all duration-200">
        <div className="relative">
          {/* BellRing icon */}
          <BellRing className="text-text hover:text-primary transition-colors size-6" />

          {/* Notification count badge - top right corner */}
          {(notifications?.metaData?.unread_count ?? 0) > 0 && (
            <span className="absolute -top-0 -right-0 bg-white text-white font-semibold rounded-full w-[10px] h-[10px] flex items-center justify-center">
              <span className="w-[7px] aspect-square rounded-full bg-warning"></span>
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        align={popoverAlign}
        className="border-none bg-white !px-3 z-[999999] rounded-lg overflow-hidden w-[320px] mt-4 overflow-y-auto max-h-[500px] p-3"
        onInteractOutside={() => {
          setOpen(false);
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-text_highlight font-semibold  text-sm">
            Notifications
          </h3>
        </div>
        <div className="min-w-full h-[1px] bg-gray_dark my-2"></div>
        {notifications?.data?.length ? (
          <>
            {notifications?.data?.slice(0, 4)?.map((noti: any) => (
              <button
                key={noti?.id}
                // href={`/notifications/${noti?.id}`}
                onClick={() => {
                  router.push(`/notifications/${noti?.id}`);
                  setOpen(false);
                }}
                className={`block rounded-md relative ${
                  noti?.is_read ? "" : "bg-bg_shade"
                } w-full mt-2`}
              >
                <div className="p-2 w-full">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-[11px] flex items-center gap-1 text-text_highlight/70 font-semibold">
                      <Circle
                        size={8}
                        className={`${
                          noti?.is_read
                            ? "text-primary"
                            : "text-success fill-success"
                        }`}
                      />
                      {noti?.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Clock size={10} className="text-neutral" />
                      <p className="text-[10px] text-text_highlight">
                        {formatDistanceToNow(new Date(noti?.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-1">
                    <p className="text-[10px] leading-4 mt-0.5 text-start text-neutral line-clamp-2">
                      {noti?.message}
                    </p>
                  </div>
                </div>
              </button>
            ))}
            <button
              // href="/notifications"
              onClick={() => {
                router.push("/notifications");
                setOpen(false);
              }}
              className="flex items-center justify-end gap-1 text-xs font-semibold w-full text-text_highlight mt-2 hover:underline transition-all"
            >
              See All
            </button>
          </>
        ) : (
          <p className="text-center text-highlight font-semibold text-sm">
            No new notification available
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default Notification;
