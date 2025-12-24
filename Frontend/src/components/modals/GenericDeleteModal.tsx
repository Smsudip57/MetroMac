import { Trash2 } from "lucide-react";
import React from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { MdCancel } from "react-icons/md";
interface ModalProps {
  isOpen: boolean;
  isLoading: boolean;
  message?: string;
  error?: string;
  onClose: () => void;
  onDelete: () => void;
  cancelIcon?: boolean;
}

const GenericDeleteModal: React.FC<ModalProps> = ({
  isLoading,
  message,
  error = "",
  isOpen,
  onClose,
  onDelete,
  cancelIcon = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white  md:px-6 px-4 md:py-12 py-6  max-w-[35rem] rounded-2xl w-[94%] mx-auto">
        <div className="flex justify-center items-center">
          {cancelIcon ? (
            <MdCancel className="lg:size-12 size-10 text-warning" />
          ) : (
            <Trash2 className="lg:size-12 size-10 text-warning" />
          )}
        </div>
        <h2 className="lg:text-xl md:text-base text-sm text-light-alpha font-semibold text-center capitalize lg:my-2">
          {message || "Are You Sure You Want To Delete This Item?"}
        </h2>
        <div className="flex  justify-center gap-4 md:mt-6 mt-4">
          <Button
            disabled={isLoading}
            onClick={onDelete}
            className="md:w-44 w-36 text-base"
            variant="default"
          >
            {isLoading ? "Deleting..." : "Confirm"}
          </Button>
          <Button
            className="md:w-44 w-36 text-base"
            variant="destructive"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
        {error && (
          <p className="text-center text-warning font-medium md:text-sm text-xs capitalize mt-2">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GenericDeleteModal;
