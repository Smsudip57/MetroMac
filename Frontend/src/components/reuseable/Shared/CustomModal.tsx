import React from "react";
import { useForm, FormProvider, UseFormReturn } from "react-hook-form";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInputHF from "../forms/WithHookForm/FormInputHF";
import FormSelectHF from "../forms/WithHookForm/FormSelectHF";
import SearchSelectHF from "../forms/WithHookForm/SearchSelectHF";
import SingleDatePickerHF from "../forms/WithHookForm/SingleDatePickerHF";
import FormPhotoUploadHF from "../forms/WithHookForm/FormPhotoUploadHF";
import ColorPickerInputHF from "../forms/WithHookForm/ColorPickerInputHF";
import { X } from "lucide-react";

// Field type: { name, label, type, ...otherProps }
const fieldComponentMap: Record<string, React.FC<any>> = {
  text: FormInputHF,
  number: FormInputHF,
  select: FormSelectHF,
  searchSelect: SearchSelectHF,
  date: SingleDatePickerHF,
  photo: FormPhotoUploadHF,
  colorPicker: ColorPickerInputHF,
};

interface Field {
  name: string;
  label: string;
  type: keyof typeof fieldComponentMap;
  [key: string]: any;
}

interface CustomModalProps {
  title?: string;
  triggerText: string | React.ReactNode;
  fields?: Field[];
  resolver: any;
  defaultValues?: Record<string, any>;
  onSubmit: (data: any, methods: UseFormReturn<any>) => void | Promise<void>;
  renderField?: (
    field: Field,
    FieldComponent: React.FC<any>
  ) => React.ReactNode;
  formClassName?: string;
  dialogProps?: React.ComponentProps<typeof Dialog>;
  triggerProps?: React.ComponentProps<typeof Button>;
  contentClassName?: string;
  form?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CustomModal: React.FC<CustomModalProps> = ({
  title,
  triggerText,
  fields,
  resolver,
  defaultValues = {},
  onSubmit,
  renderField,
  formClassName,
  dialogProps,
  triggerProps,
  contentClassName = "",
  form,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}) => {
  const methods = useForm({ resolver: zodResolver(resolver), defaultValues });
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled =
    controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setUncontrolledOpen;

  const handleSubmit = methods.handleSubmit(async (data) => {
    await onSubmit(data, methods);
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen} {...dialogProps}>
      {triggerText !== null && triggerText !== undefined && (
        <DialogTrigger asChild>
          <Button {...triggerProps}>{triggerText}</Button>
        </DialogTrigger>
      )}
      <DialogOverlay className="bg-bg_shade/50 fixed inset-0 z-50" />
      <DialogContent
        className={`max-w-md w-full !rounded-lg shadow-lg bg-bg p-0 pt-3.5 pb-6 flex flex-col items-center ${contentClassName}`}
      >
        <FormProvider {...methods}>
          <div className="w-full flex items-center justify-between !mb-0 px-6">
            {title && (
              <h2 className="text-base font-semibold leading-0">{title}</h2>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-bg_shade /10 transition-colors focus:outline-none absolute top-3.5 right-3.5"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
          {title && <div className="h-px w-full bg-border !mt-[-5px]"></div>}
          {form ? (
            form
          ) : (
            <form onSubmit={handleSubmit} className={`w-full space-y-4 px-6 `}>
              <div className={`w-full grid ${formClassName}`}>
                {fields?.map((field) => {
                  const FieldComponent = fieldComponentMap[field.type];
                  if (!FieldComponent) return null;
                  return renderField ? (
                    renderField(field, FieldComponent)
                  ) : (
                    <div key={field.name} className="w-full">
                      <FieldComponent {...field} />
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="!h-8"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" className="!h-8">
                  Submit
                </Button>
              </div>
            </form>
          )}
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
