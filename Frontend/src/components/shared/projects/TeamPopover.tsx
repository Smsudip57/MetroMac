// "use client";
// import React, { useState, useMemo, useRef, useEffect } from "react";
// import ContainerWrapper from "@/components/reuseable/wrapper/ContainerWrapper";
// import Image from "next/image";
// import {
//   useGetProjectMembersQuery,
//   useAddProjectMembersMutation,
//   useRemoveProjectMembersMutation,
// } from "@/redux/api/projects/ProjectApi";
// import { useGetUsersQuery } from "@/redux/api/users/userApi";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { X } from "lucide-react";
// import SearchField from "@/components/reuseable/Shared/SearchField";
// import { useKeenSlider } from "keen-slider/react";
// import "keen-slider/keen-slider.min.css";
// import { toast } from "react-hot-toast";

// interface TeamMember {
//   value: string;
//   label: string;
//   image?: string;
//   role?: string;
// }

// interface TeamPopoverProps {
//   projectId: number | string;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   children: React.ReactNode;
// }

// export default function TeamPopover({
//   projectId,
//   open,
//   onOpenChange,
//   children,
// }: TeamPopoverProps) {
//   // Search and pagination state
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([]);
//   const searchInputRef = useRef<HTMLInputElement>(null);

//   // Fetch all users for selection
//   const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({
//     limit: 1000,
//     search: searchTerm || undefined,
//   });

//   // Fetch current project members
//   const { data: membersData, refetch } = useGetProjectMembersQuery(projectId, {
//     skip: !projectId,
//   });

//   const [addProjectMembers] = useAddProjectMembersMutation();
//   const [removeProjectMembers] = useRemoveProjectMembersMutation();

//   // Map users to team member format
//   const availableUsers = useMemo(() => {
//     return (
//       usersData?.data?.map(
//         (u: any): TeamMember => ({
//           value: String(u.id),
//           label:
//             u.firstName && u.lastName
//               ? `${u.firstName} ${u.lastName}`
//               : u.username,
//           image: u.profileImage,
//         })
//       ) || []
//     );
//   }, [usersData]);

//   // Current member IDs and data
//   const currentMembers = useMemo(() => {
//     return (
//       membersData?.data?.map(
//         (m: any): TeamMember => ({
//           value: String(m.user_id || m.user?.id),
//           label:
//             m.user?.firstName && m.user?.lastName
//               ? `${m.user.firstName} ${m.user.lastName}`
//               : m.user?.username || "Unknown",
//           image: m.user?.profileImage,
//           role: m.role,
//         })
//       ) || []
//     );
//   }, [membersData]);

//   const currentMemberIds = useMemo(() => {
//     return currentMembers.map((m: TeamMember) => m.value);
//   }, [currentMembers]);

//   // Initialize selected members with current members
//   useEffect(() => {
//     setSelectedMembers(currentMembers);
//   }, [currentMembers]);

//   // Filter users that aren't already selected
//   const filteredUsers = useMemo(() => {
//     return availableUsers.filter(
//       (user: TeamMember) =>
//         !selectedMembers.some((selected) => selected.value === user.value) &&
//         (searchTerm === "" ||
//           user.label.toLowerCase().includes(searchTerm.toLowerCase()))
//     );
//   }, [availableUsers, selectedMembers, searchTerm]);

//   // Handle adding a member
//   const handleAddMember = (user: TeamMember) => {
//     setSelectedMembers((prev) => {
//       const updatedMembers = [...prev, user];
//       if (slider.current) {
//         setTimeout(
//           () => slider.current?.moveToIdx(updatedMembers.length - 1),
//           0
//         );
//       }
//       return updatedMembers;
//     });
//   };

//   // Handle removing a member
//   const handleRemoveMember = (memberId: string) => {
//     setSelectedMembers((prev) => prev.filter((m) => m.value !== memberId));
//   };

//   // Handle applying changes
//   const handleApplyChanges = async () => {
//     try {
//       const selectedIds = selectedMembers.map((m: TeamMember) => m.value);
//       const toAdd = selectedIds.filter(
//         (id: string) => !currentMemberIds.includes(id)
//       );
//       const toRemove = currentMemberIds.filter(
//         (id: string) => !selectedIds.includes(id)
//       );

//       // Bulk add new members
//       if (toAdd.length > 0) {
//         const members = toAdd.map((user_id) => ({ user_id }));
//         try {
//           const response = await addProjectMembers({
//             projectId,
//             members,
//           }).unwrap();
//           toast.success(response?.message || "Members added successfully");
//         } catch (error: any) {
//           toast.error(error?.data?.message || "Failed to add members");
//         }
//       }

//       // Bulk remove members
//       if (membersData?.data && toRemove.length > 0) {
//         // Find the member IDs (ProjectMember.id) for the users to remove
//         const memberIds = membersData.data
//           .filter((m: any) =>
//             toRemove.includes(String(m.user_id || m.user?.id))
//           )
//           .map((m: any) => m.id);
//         if (memberIds.length > 0) {
//           try {
//             const response = await removeProjectMembers({
//               projectId,
//               memberIds,
//             }).unwrap();
//             const count = response?.count || memberIds.length;
//             toast.success(
//               `Successfully removed ${count} member${count !== 1 ? "s" : ""}`
//             );
//           } catch (error: any) {
//             toast.error(error?.data?.message || "Failed to remove members");
//           }
//         }
//       }

//       await refetch();
//       onOpenChange(false);
//     } catch (error) {
//       toast.error("Error updating team members");
//       console.error("Error updating team members:", error);
//     }
//   };

//   // Auto-focus search when popover opens
//   useEffect(() => {
//     if (open && searchInputRef.current) {
//       setTimeout(() => {
//         searchInputRef.current?.focus();
//       }, 100);
//     }
//   }, [open]);

//   const [sliderRef, slider] = useKeenSlider({
//     slides: {
//       perView: 3,
//       spacing: 5,
//     },
//   });

//   useEffect(() => {
//     if (slider.current) {
//       slider.current.update(); // Update the slider when selectedMembers changes
//     }
//   }, [selectedMembers, slider]);

//   return (
//     <Popover open={open} onOpenChange={onOpenChange}>
//       {children}
//       <PopoverContent
//         className="!p-0 !z-[50] w-[350px]"
//         side="bottom"
//         align="end"
//         sideOffset={8}
//       >
//         <ContainerWrapper className="!p-4 !space-y-2">
//           {/* Header */}
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="font-semibold text-base text-text_highlight">
//               Manage Team
//             </h3>
//             <button
//               onClick={() => onOpenChange(false)}
//               className="p-1 hover:bg-primary/10 rounded"
//             >
//               <X size={12} className="text-text" />
//             </button>
//           </div>

//           {/* Selected Members */}
//           <div className="mb-2">
//             <div ref={sliderRef} className="keen-slider min-h-[40px] px-1 w-full">
//               {selectedMembers.length === 0 ? (
//                 <div className="text-xs text-text_highlight/60 py-1 whitespace-nowrap">
//                   No members selected
//                 </div>
//               ) : (
//                 selectedMembers.map((member) => (
//                   <div
//                     key={member.value}
//                     className="keen-slider__slide flex justify-between items-center bg-bg border border-border rounded-full px-1 py-1 gap-1 w-max shadow-sm h-max"
//                   >
//                     {true && (
//                       <Image
//                         src={
//                           member?.image ||
//                           "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/default-profile-picture-male-icon.png"
//                         }
//                         alt={member.label}
//                         width={20}
//                         height={20}
//                         className={`rounded-full flex-shrink-0 aspect-square  object-cover ${!member.image ? "opacity-50" : ""
//                           }`}
//                       />
//                     )}
//                     <span className="text-xs text-text truncate max-w-[60px]e">
//                       {member.label?.split(" ")[0]}
//                     </span>
//                     <button
//                       onClick={() => handleRemoveMember(member.value)}
//                       className="ml-1 hover:bg-border rounded-full text-warning flex-shrink-0 px-1 aspect-square"
//                       tabIndex={0}
//                       aria-label={`Remove ${member.label}`}
//                     >
//                       <X size={10} />
//                     </button>
//                   </div>
//                 ))
//               )}
//               ;
//             </div>
//           </div>

//           {/* Available Users */}
//           <div className="h-64 overflow-y-auto space-y-1 border border-border rounded-lg relative overflow-hidden">
//             <div className="mb-3-4 sticky top-0 left-0 bg-bg z-[1000]">
//               <SearchField
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 placeholder="Search users..."
//                 className="2xl:w-[330px]"
//                 autoFocus
//               // Optionally pass ref if needed for focus
//               />
//             </div>
//             <div className="mb bg-bg p-2 pt-0">
//               {usersLoading ? (
//                 <div className="text-sm text-text_highlight/60 py-2">
//                   Loading users...
//                 </div>
//               ) : filteredUsers.length === 0 ? (
//                 <div className="text-sm text-text_highlight/60 py-2">
//                   {searchTerm
//                     ? "No users found"
//                     : "All users are already selected"}
//                 </div>
//               ) : (
//                 filteredUsers.map((user: TeamMember) => (
//                   <div
//                     key={user.value}
//                     className="flex items-center justify-between p-2 hover:bg-primary/5 rounded-bg cursor-pointer"
//                     onClick={() => handleAddMember(user)}
//                   >
//                     <div className="flex items-center gap-2 min-w-0">
//                       {true && (
//                         <Image
//                           src={
//                             user?.image ||
//                             "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/default-profile-picture-male-icon.png"
//                           }
//                           alt={user.label}
//                           width={24}
//                           height={24}
//                           className={
//                             "rounded-full flex-shrink-0 aspect-square object-cover " +
//                             (!user?.image ? "opacity-50" : "")
//                           }
//                         />
//                       )}
//                       <span className="text-sm text-text truncate">
//                         {user.label}
//                       </span>
//                     </div>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleAddMember(user);
//                       }}
//                       className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary/80 flex-shrink-0"
//                     >
//                       Add
//                     </button>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex justify-end gap-2 pt-2  border-border ">
//             <span
//               className="text-xs border border-border cursor-pointer hover:opacity-90 rounded-full text-black py-1 px-3"
//               onClick={() => onOpenChange(false)}
//             >
//               Cancel
//             </span>
//             <span
//               className="text-xs bg-primary cursor-pointer hover:opacity-90 rounded-full text-white py-1 px-3"
//               onClick={handleApplyChanges}
//             >
//               Done
//             </span>
//           </div>
//         </ContainerWrapper>
//       </PopoverContent>
//     </Popover>
//   );
// }

import React from 'react'

export default function TeamPopover() {
  return (
    <div>
      
    </div>
  )
}
