"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  useGetTaskByIdQuery,
  useAddTaskCommentMutation,
  useAttachFileToTaskMutation,
} from "@/redux/api/tasks/taskApi";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import { useUploadFileMutation } from "@/redux/api/files/fileApi";
import { useWindowSize } from "@/hooks/useWindowSize";
import ContainerWrapper from "@/components/reuseable/wrapper/ContainerWrapper";
import FieldWrapper, {
  FieldLabel,
} from "@/components/reuseable/forms/WithHookForm/FieldWrapper";
import {
  TableDoubleHoriZontalItemsWithImage,
  TableStatus,
} from "@/components/shared/table/TableItems";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

// Status Map - Maps enum values to readable labels
const STATUS_MAP: Record<string, string> = {
  pending: "Pending",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function ViewTasks() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get("id");
  const [commentText, setCommentText] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width < 1024;

  // Fetch task data
  const {
    data: taskData,
    isLoading,
    error,
    refetch,
  } = useGetTaskByIdQuery(taskId || "", {
    skip: !taskId,
  });

  const [addTaskComment] = useAddTaskCommentMutation();
  const [attachFileToTask] = useAttachFileToTaskMutation();
  const [uploadFile] = useUploadFileMutation();

  const task = taskData?.data;

  // Form for adding comment
  const commentFormMethods = useForm({
    defaultValues: {
      comment: "",
    },
  });

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Upload file to get temp URL
        const uploadResponse = await uploadFile(file).unwrap();
        const tempFileUrl = uploadResponse.data.url;

        // Attach file to task
        await attachFileToTask({
          taskId,
          file_url: tempFileUrl,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        }).unwrap();
      }

      toast.success("Files attached successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to attach files");
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      await addTaskComment({
        taskId,
        content: commentText.trim(),
      }).unwrap();

      toast.success("Comment added successfully");
      setCommentText("");
      commentFormMethods.reset();
      // Refetch task to update comments
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add comment");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text mb-2">Task Not Found</h2>
          <p className="text-text_highlight">
            The task you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={isMobile ? "space-y-4 p-0 md:p-4" : "space-y-6"}>
      <div
        className={isMobile ? "space-y-4" : "grid grid-cols-3 gap-6 h-screen"}
      >
        {/* Left Side - Task Details & Files */}
        <div
          className={
            isMobile ? "space-y-4" : "col-span-1 space-y-6 overflow-y-auto"
          }
        >
          {/* Task Details */}
          <ContainerWrapper
            className={isMobile ? "p-3 space-y-3" : "p-4 space-y-4"}
          >
            <div>
              <h1
                className={
                  isMobile
                    ? "text-xl font-bold text-text"
                    : "text-2xl font-bold text-text"
                }
              >
                {task.title}
              </h1>
              <p
                className={
                  isMobile
                    ? "text-xs text-text_highlight mt-1"
                    : "text-sm text-text_highlight mt-1"
                }
              >
                {task.description}
              </p>
            </div>

            <div className={isMobile ? "space-y-2" : "space-y-3"}>
              {/* Status */}
              <FieldWrapper>
                <FieldLabel>Status</FieldLabel>
                <TableStatus
                  statusName={STATUS_MAP[task.status] || task.status}
                />
              </FieldWrapper>

              {/* Archived Badge - Show only if task is archived */}
              {task.is_archived && (
                <FieldWrapper>
                  <FieldLabel>Archive Status</FieldLabel>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral/10 border border-neutral/30 rounded-full">
                    <svg
                      className="w-4 h-4 text-neutral"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9-4v4m4-4v4"
                      />
                    </svg>
                    <span
                      className={
                        isMobile
                          ? "text-xs font-medium text-neutral"
                          : "text-sm font-medium text-neutral"
                      }
                    >
                      Archived
                    </span>
                  </div>
                </FieldWrapper>
              )}

              {/* Hold Reason - Show only if task is on hold */}
              {task.status === "on_hold" && task.hold_reason && (
                <FieldWrapper>
                  <FieldLabel>Hold Reason</FieldLabel>
                  <div className="px-4 py-2.5 bg-warning/5 border border-warning/20 rounded-xl">
                    <p className="text-sm text-text">{task.hold_reason}</p>
                  </div>
                </FieldWrapper>
              )}

              {/* Dates */}
              <div
                className={isMobile ? "space-y-2" : "grid grid-cols-2 gap-2"}
              >
                <FieldWrapper>
                  <FieldLabel>Start Date</FieldLabel>
                  <p
                    className={
                      isMobile
                        ? "text-xs font-medium text-text rounded-xl"
                        : "text-sm font-medium text-text rounded-xl"
                    }
                  >
                    {formatDate.getDate(task.start_date)}
                  </p>
                </FieldWrapper>
                <FieldWrapper>
                  <FieldLabel>End Date</FieldLabel>
                  <p
                    className={
                      isMobile
                        ? "text-xs font-medium text-text rounded-xl"
                        : "text-sm font-medium text-text rounded-xl"
                    }
                  >
                    {formatDate.getDate(task.end_date)}
                  </p>
                </FieldWrapper>
              </div>

              {/* Assigned To */}
              {task.assignee && (
                <FieldWrapper>
                  <FieldLabel>Assigned To</FieldLabel>
                  <div className="px-4 py-2.5 bg-transparent rounded-xl">
                    <TableDoubleHoriZontalItemsWithImage
                      img={task.assignee.profileImage}
                      title={`${task.assignee.firstName} ${task.assignee.lastName}`}
                      subtitle={task.assignee.username}
                    />
                  </div>
                </FieldWrapper>
              )}

              {/* Reporter */}
              {task.reporter && (
                <FieldWrapper>
                  <FieldLabel>Reported By</FieldLabel>
                  <div className="px-4 py-2.5 bg-transparent rounded-xl">
                    <TableDoubleHoriZontalItemsWithImage
                      img={task.reporter.profileImage}
                      title={`${task.reporter.firstName} ${task.reporter.lastName}`}
                      subtitle={task.reporter.username}
                    />
                  </div>
                </FieldWrapper>
              )}

              {/* Alerts */}
              {/* {task.taskAlerts && task.taskAlerts.length > 0 && (
                <FieldWrapper>
                  <FieldLabel>Alerts</FieldLabel>
                  <div className="flex flex-wrap gap-2 px-4 py-2.5 bg-transparent border border-border rounded-xl">
                    {task.taskAlerts.map((alert: any, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                        {formatDate.getDateAndTime(alert.alert_date)}
                      </span>
                    ))}
                  </div>
                </FieldWrapper>
              )} */}
            </div>
          </ContainerWrapper>

          {/* Files Section */}
          {task.attachments && task.attachments.length > 0 && (
            <ContainerWrapper className={isMobile ? "p-3" : "p-4"}>
              <FieldLabel>Attachments ({task.attachments.length})</FieldLabel>
              <div
                className={
                  isMobile ? "flex flex-wrap gap-2" : "flex flex-wrap gap-2"
                }
              >
                {task.attachments.map((attachment: any, index: number) => (
                  <a
                    key={index}
                    href={attachment.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-primary/10 hover:border-primary border border-border transition-all group cursor-pointer max-w-xs"
                  >
                    <svg
                      className="w-4 h-4 text-primary flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-text truncate group-hover:text-primary transition-colors">
                        {attachment.original_name}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </ContainerWrapper>
          )}
          {!task.attachments || task.attachments.length === 0 ? (
            <ContainerWrapper className={isMobile ? "p-3" : "p-4"}>
              <FieldLabel>Attachments</FieldLabel>
              <div
                className={
                  isMobile
                    ? "flex flex-col items-center justify-center py-4 text-center"
                    : "flex flex-col items-center justify-center py-6 text-center"
                }
              >
                <svg
                  className="w-8 h-8 text-gray-300 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-xs text-text_highlight">
                  No files attached yet
                </p>
              </div>
            </ContainerWrapper>
          ) : null}
        </div>

        {/* Right Side - Comments */}
        <div
          className={
            isMobile
              ? "space-y-4"
              : "col-span-2 flex flex-col gap-6 overflow-y-auto"
          }
        >
          {/* Comments List */}
          <ContainerWrapper
            className={
              isMobile ? "p-3 flex flex-col" : "p-4 flex-1 flex flex-col"
            }
          >
            <FieldLabel>Comments ({task.comments?.length || 0})</FieldLabel>

            {/* Comments Scroll Area */}
            <div
              className={
                isMobile
                  ? "flex-1 overflow-y-auto space-y-2 mb-3 pr-1"
                  : "flex-1 overflow-y-auto space-y-3 mb-4 pr-2"
              }
            >
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment: any, index: number) => (
                  <div
                    key={index}
                    className={
                      isMobile
                        ? "flex gap-2 pb-2 border-b border-border last:border-b-0"
                        : "flex gap-3 pb-3 border-b border-border last:border-b-0"
                    }
                  >
                    <div>
                      {comment.user?.profileImage ? (
                        <Image
                          src={comment.user.profileImage}
                          alt={comment.user.firstName}
                          width={32}
                          height={32}
                          className={
                            isMobile
                              ? "w-6 h-6 rounded-full object-cover"
                              : "w-8 h-8 rounded-full object-cover"
                          }
                        />
                      ) : (
                        <div
                          className={
                            isMobile
                              ? "w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center"
                              : "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                          }
                        >
                          <span
                            className={
                              isMobile
                                ? "text-xs font-semibold text-primary"
                                : "text-xs font-semibold text-primary"
                            }
                          >
                            {comment.user?.firstName?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={
                          isMobile
                            ? "flex items-start gap-1 flex-col"
                            : "flex items-center gap-2"
                        }
                      >
                        <p
                          className={
                            isMobile
                              ? "text-xs font-semibold text-text"
                              : "text-sm font-semibold text-text"
                          }
                        >
                          {comment.user?.firstName} {comment.user?.lastName}
                        </p>
                        <p
                          className={
                            isMobile
                              ? "text-xs text-text_highlight"
                              : "text-xs text-text_highlight"
                          }
                        >
                          {formatDate.getDateAndTime(comment.created_at)}
                        </p>
                      </div>
                      <p
                        className={
                          isMobile
                            ? "text-xs text-text mt-1"
                            : "text-sm text-text mt-1"
                        }
                      >
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <svg
                    className="w-8 h-8 text-gray-300 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-sm text-text_highlight">No comments yet</p>
                </div>
              )}
            </div>

            {/* Add Comment Section */}
            <div
              className={
                isMobile
                  ? "border-t border-border pt-3 space-y-2"
                  : "border-t border-border pt-4 space-y-2"
              }
            >
              <FieldLabel>Add Comment & Attach Files</FieldLabel>
              <FormProvider {...commentFormMethods}>
                <div className={isMobile ? "space-y-2" : "space-y-2"}>
                  {/* Drag-drop Area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative rounded-xl transition-colors ${
                      dragActive ? "bg-primary/5" : ""
                    }`}
                  >
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write your comment..."
                      className={`w-full ${
                        isMobile
                          ? "h-20 px-3 py-2 text-xs"
                          : "h-24 px-4 py-2.5 text-sm"
                      } bg-transparent border ${
                        dragActive ? "border-primary" : "border-border"
                      } rounded-xl text-text placeholder-text_highlight resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                    />
                  </div>

                  {/* Action Bar with File Upload and Send */}
                  <div
                    className={
                      isMobile
                        ? "flex items-center gap-2 justify-between text-xs"
                        : "flex items-center gap-2 justify-between"
                    }
                  >
                    {/* File Upload Button */}
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        onChange={(e) =>
                          e.target.files && handleFileUpload(e.target.files)
                        }
                        disabled={uploadingFiles}
                        className="hidden"
                        id="comment-file-input"
                      />
                      <label
                        htmlFor="comment-file-input"
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-bg transition-colors cursor-pointer ${
                          uploadingFiles ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {uploadingFiles ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span
                              className={
                                isMobile
                                  ? "text-xs text-text_highlight"
                                  : "text-xs text-text_highlight"
                              }
                            >
                              Uploading...
                            </span>
                          </>
                        ) : (
                          <>
                            <svg
                              className={
                                isMobile
                                  ? "w-3 h-3 text-primary"
                                  : "w-4 h-4 text-primary"
                              }
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            <span
                              className={
                                isMobile
                                  ? "text-xs text-text"
                                  : "text-xs text-text"
                              }
                            >
                              Attach
                            </span>
                          </>
                        )}
                      </label>
                    </div>

                    {/* Send Button */}
                    <Button
                      type="button"
                      onClick={handleAddComment}
                      disabled={!commentText.trim() && !uploadingFiles}
                      className={
                        isMobile
                          ? "rounded-2xl px-3 py-1.5 text-xs"
                          : "rounded-2xl"
                      }
                    >
                      Send
                    </Button>
                  </div>

                  {/* Drag-drop hint */}
                  {dragActive && (
                    <p className="text-xs text-primary text-center py-1">
                      Drop files here to attach
                    </p>
                  )}
                </div>
              </FormProvider>
            </div>
          </ContainerWrapper>
        </div>
      </div>
    </div>
  );
}
