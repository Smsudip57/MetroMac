import React from "react";
import { Button } from "@/components/ui/button";
import AddIcon from "@/assets/icons/shared/AddIcon";
import DeleteIcon from "@/assets/icons/shared/DeleteIcon";

export default function TableButton({
  type = "add",
  onClick,
  className = "",
  buttonText,
  isDisabled = false,
  isLoading = false,
}: {
  type?: "add" | "delete";
  onClick?: () => void;
  className?: string;
  buttonText?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
}) {
  const buttonLabel = type === "add" ? "Add" : "Bulk Delete";

  const onLoadingText = type === "add" ? "Adding..." : "Deleting...";

  const buttonVariant = type === "add" ? "default" : "destructive";

  const buttonIcon =
    type === "add" ? (
      <AddIcon className="mr-2" />
    ) : (
      <DeleteIcon className="mr-2" />
    );
  return (
    <div>
      <Button
        type="button"
        variant={buttonVariant}
        onClick={onClick}
        className={`flex items-center !gap-0 ${className}`}
        size="sm"
        style={{ width: "auto" }}
        disabled={isDisabled || isLoading}
      >
        {buttonIcon} {isLoading ? onLoadingText : buttonLabel} {buttonText}
      </Button>
    </div>
  );
}
