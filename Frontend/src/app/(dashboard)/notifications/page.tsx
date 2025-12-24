// "use client";
// import { DynamicTable } from "@/components/reuseable/Shared/DynamicTable";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { cn } from "@/lib/utils";

// const NotificationsPage = () => {
//   const router = useRouter();
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(5);
//   const [activeTab, setActiveTab] = useState(false);

//   const queries = `?page=${currentPage}&page_size=${pageSize}&is_read=${activeTab}`;

//   // TODO: Implement useGetNotificationsQuery hook
//   const notifications = [];
//   const notificationsLoading = false;

//   const columns = [
//     {
//       key: "S.No",
//       header: "S.No",
//       cell: (item: any) => item?.id,
//     },
//     {
//       key: "title",
//       header: "Title",
//       cell: (item: any) => item.title,
//     },
//     {
//       key: "message",
//       header: "Message",
//       cell: (item: any) =>
//         item.message?.length > 60
//           ? `${item.message.slice(0, 60)}...`
//           : item.message,
//     },
//     {
//       id: "created_at",
//       key: "created_at",
//       header: "Created At",
//       cell: (item: any) => formatDateTime(item.created_at),
//     },
//   ];

//   // Add this function to format the date
//   const formatDateTime = (isoString: string) => {
//     const date = new Date(isoString);
//     return date.toLocaleString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-4">Notifications</h1>

//       <div className="p-1 rounded-[51px] border-[1.5px] border-[#D1D4D8] w-fit overflow-hidden mb-6">
//         <div className="flex items-center overflow-x-auto scrollbar-hide">
//           {[
//             { id: false, label: "Unread" },
//             { id: true, label: "Read" },
//           ].map((tab, index) => (
//             <button
//               key={index}
//               onClick={() => setActiveTab(tab.id)}
//               className={cn(
//                 "min-w-[120px] sm:min-w-[150px] md:w-[180px] lg:w-[205px] h-10 px-3 md:px-5 py-2 rounded-[53px] flex items-center justify-center whitespace-nowrap",
//                 activeTab === tab.id
//                   ? "bg-light-emerald-base"
//                   : "hover:bg-gray-50 transition-colors"
//               )}
//             >
//               <span
//                 className={cn(
//                   "text-sm font-medium",
//                   activeTab === tab.id
//                     ? "text-[#FFFEFB] font-semibold"
//                     : "text-[#747C83]"
//                 )}
//               >
//                 {tab.label}
//               </span>
//             </button>
//           ))}
//         </div>
//       </div>

//       <DynamicTable
//         data={notifications?.data || []}
//         columns={columns}
//         options={{
//           actions: {
//             view: true,
//           },
//         }}
//         onView={(item: any) => {
//           router.push(`/notifications/${item.id}`);
//         }}
//         pagination={{
//           enabled: true,
//           pageSize,
//           pageSizeOptions: [5, 10, 20, 30],
//           totalRecords: notifications?.metaData?.pagination?.total || 0,
//           currentPage,
//           onPageChange: setCurrentPage,
//           onPageSizeChange: (size) => {
//             setPageSize(size);
//             setCurrentPage(1);
//           },
//         }}
//         className="rounded-md border"
//         isLoading={notificationsLoading}
//       />
//     </div>
//   );
// };

// export default NotificationsPage;

import React from 'react'

export default function page() {
  return (
    <div>
      
    </div>
  )
}
