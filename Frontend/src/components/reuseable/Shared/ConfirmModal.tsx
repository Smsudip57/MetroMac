import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MessageCircle, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: "normal" | "warning";
  title?: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function ConfirmModal({
  open,
  onOpenChange,
  type = "normal",
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  isLoading = false,
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Get styling based on type
  const getTypeStyles = () => {
    switch (type) {
      case "warning":
        return {
          icon: <AlertTriangle className="h-5 w-5 text-warning" />,
          iconBg: "bg-warning/10",
          title: title || "Warning",
          confirmVariant: "destructive" as const,
        };
      case "normal":
      default:
        return {
          icon: <MessageCircle className="h-6 w-6 text-primary" />,
          iconBg: "bg-primary/10",
          title: title || "Confirm Action",
          confirmVariant: "default" as const,
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center gap-3 mb-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-bg_shade /10 transition-colors focus:outline-none absolute top-3.5 right-3.5"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
            <div
              className={`size-7 flex items-center justify-center rounded-full relative ${typeStyles.iconBg}`}
            >
              <span className="absolute center-xy">{typeStyles.icon}</span>
            </div>
            <DialogTitle className="text-lg font-semibold text-center">
              {typeStyles.title}
            </DialogTitle>
          </div>
          <DialogDescription className="px-4  pt-2">{message}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
            size={"sm"}
          >
            {cancelText}
          </Button>
          <Button
            variant={typeStyles.confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
            size={"sm"}
          >
            {isLoading ? "Loading..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
