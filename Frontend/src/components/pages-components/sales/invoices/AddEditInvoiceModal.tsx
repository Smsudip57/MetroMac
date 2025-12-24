"use client";
import React, { useEffect, useState } from "react";
import CustomSideWindow from "@/components/reuseable/Shared/CustomSideWindow";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useCurrencyData } from "@/hooks/useCurrencyData";
// import {
//   useCreateInvoiceMutation,
//   useUpdateInvoiceMutation,
// } from "@/redux/api/invoice/InvoiceApis";
// import { useGetQuotationsQuery } from "@/redux/api/quotation/QuotationApis";
// import { useGetInvoiceStatusesQuery } from "@/redux/api/settings/constants/invoiceStatusApi";
// import { useGetPaymentMethodsQuery } from "@/redux/api/settings/constants/paymentMethodApi";
import { FormProvider, useForm } from "react-hook-form";
import FormInputHF from "@/components/reuseable/forms/WithHookForm/FormInputHF";
import FormSelectHF from "@/components/reuseable/forms/WithHookForm/FormSelectHF";
import SearchSelectHF from "@/components/reuseable/forms/WithHookForm/SearchSelectHF";
import SingleDatePickerHF from "@/components/reuseable/forms/WithHookForm/SingleDatePickerHF";
import WindowForm from "@/components/reuseable/forms/WindowForm/WindowForm";
import FromHeader from "@/components/reuseable/forms/WindowForm/Header";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, ChevronDown } from "lucide-react";
import FormInput from "@/components/reuseable/forms/WithoutHookForm/FormInput";
import TableButton from "@/components/reuseable/buttons/TableButton";

type SalesItem = {
  id?: number;
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  position?: number;
};

type AddEditInvoiceModalProps = {
  editingInvoice?: any | null;
  onInvoiceCreated?: () => void;
  onInvoiceUpdated?: () => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
};

export default function AddEditInvoiceModal({
  editingInvoice = null,
  onInvoiceCreated,
  onInvoiceUpdated,
  open,
  setOpen,
}: AddEditInvoiceModalProps) {
  // const [createInvoice, { isLoading: isCreating }] = useCreateInvoiceMutation();
  // const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation();
  const isCreating = false;
  const isUpdating = false;

  // Get currency data from Redux
  const {
    formatPrice,
    code: defaultCurrency,
    sign: currencySign,
  } = useCurrencyData();

  // Sales items state management
  const [items, setItems] = useState<SalesItem[]>([]);
  const [newItem, setNewItem] = useState<SalesItem>({
    item_name: "",
    description: "",
    quantity: 1,
    unit_price: 0,
    total_price: 0,
  });
  const [isAddItemsExpanded, setIsAddItemsExpanded] = useState(!editingInvoice);

  // Zod schema for validation
  const schema = z.object({
    invoice_number: z.string().optional(),
    quotation: z
      .object(
        { value: z.number(), label: z.string(), quotation_number: z.string() },
        { required_error: "Quotation is required" }
      )
      .refine((val) => val && typeof val.value === "number", {
        message: "Quotation is required",
      }),
    currency: z.string().min(1, "Currency is required"),
    tax_rate: z
      .number()
      .min(0, "Tax rate must be positive")
      .max(100, "Tax rate cannot exceed 100%"),
    tax_amount: z.number().min(0, "Tax amount must be positive"),
    discount_type: z.enum(["none", "percentage", "fixed_amount"]),
    discount_value: z.number().min(0, "Discount value must be positive"),
    status: z
      .object(
        { value: z.number(), label: z.string() },
        { required_error: "Status is required" }
      )
      .refine((val) => val && typeof val.value === "number", {
        message: "Status is required",
      }),
    payment_method: z
      .object(
        { value: z.number(), label: z.string() },
        { required_error: "Payment method is required" }
      )
      .optional()
      .nullable(),
    issue_date: z.string().min(1, "Issue date is required"),
    due_date: z.string().min(1, "Due date is required"),
    reference: z.string().optional(),
    notes: z.string().optional(),
    terms: z.string().optional(),
  });

  const getDefaultValues = (editingInvoice: any) =>
    editingInvoice
      ? {
          invoice_number: editingInvoice?.invoice_number || "",
          quotation: editingInvoice?.quotation
            ? {
                value: editingInvoice?.quotation?.id,
                label: editingInvoice?.quotation?.quotation_number,
                quotation_number: editingInvoice?.quotation?.quotation_number,
              }
            : null,
          currency: editingInvoice?.currency || defaultCurrency || "USD",
          tax_rate: Number(editingInvoice?.tax_rate) || 0,
          tax_amount: Number(editingInvoice?.tax_amount) || 0,
          discount_type: editingInvoice?.discount_type || "none",
          discount_value: Number(editingInvoice?.discount_value) || 0,
          status: editingInvoice?.status
            ? {
                value: editingInvoice?.status?.id,
                label: editingInvoice?.status?.name,
              }
            : null,
          payment_method: editingInvoice?.payment_method
            ? {
                value: editingInvoice?.payment_method?.id,
                label: editingInvoice?.payment_method?.name,
              }
            : null,
          issue_date: editingInvoice?.issue_date
            ? new Date(editingInvoice?.issue_date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          due_date: editingInvoice?.due_date
            ? new Date(editingInvoice?.due_date).toISOString().split("T")[0]
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
          reference: editingInvoice?.reference || "",
          notes: editingInvoice?.notes || "",
          terms: editingInvoice?.terms || "",
        }
      : {
          quotation: null,
          currency: defaultCurrency || "USD",
          tax_rate: 0,
          tax_amount: 0,
          discount_type: "none" as const,
          discount_value: 0,
          status: null,
          payment_method: null,
          issue_date: new Date().toISOString().split("T")[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          reference: "",
          notes: "",
          terms: "",
        };

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(editingInvoice),
  });

  const { reset, watch, setValue } = methods;

  // Watch for changes in tax_rate and discount
  const taxRate = watch("tax_rate");
  const discountType = watch("discount_type");
  const discountValue = watch("discount_value");

  // Calculate subtotal from items
  const calculateSubtotal = () => {
    return items.reduce(
      (sum, item) => sum + (Number(item?.total_price) || 0),
      0
    );
  };

  const subtotal = calculateSubtotal();

  // Calculate totals automatically based on items
  useEffect(() => {
    let discountAmount = 0;
    if (discountType === "percentage") {
      discountAmount = (subtotal * discountValue) / 100;
    } else if (discountType === "fixed_amount") {
      discountAmount = discountValue;
    }

    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal - discountAmount + taxAmount;

    setValue("tax_amount", Number(taxAmount.toFixed(2)));
  }, [subtotal, taxRate, discountType, discountValue, setValue]);

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(editingInvoice));
      // Pre-fill items when editing with proper type conversion
      if (
        editingInvoice?.sales_items &&
        Array.isArray(editingInvoice.sales_items)
      ) {
        const convertedItems = editingInvoice.sales_items.map((item: any) => ({
          id: item?.id,
          item_name: item?.item_name || "",
          description: item?.description || "",
          quantity: parseInt(item?.quantity) || 0,
          unit_price: Number(item?.unit_price) || 0,
          total_price: Number(item?.total_price) || 0,
          position: item?.position,
        }));
        setItems(convertedItems);
      } else {
        setItems([]);
      }
      // Reset new item form
      setNewItem({
        item_name: "",
        description: "",
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });
      // Set expanded state: expanded in create mode, collapsed in edit mode
      setIsAddItemsExpanded(!editingInvoice);
    }
  }, [editingInvoice, open, reset]);

  const onSubmit = async (data: any) => {
    try {
      // Validate items exist
      if (items.length === 0) {
        toast.error("Please add at least one item");
        return;
      }

      const payload = {
        ...data,
        quotation_id: data.quotation?.value,
        issue_date: new Date(data.issue_date).toISOString(),
        due_date: new Date(data.due_date).toISOString(),
        status_id: data.status?.value,
        payment_method_id: data.payment_method?.value,
        items: items.map((item) => ({
          item_name: item.item_name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      };
      delete payload.quotation;
      delete payload.status;
      delete payload.payment_method;

      Object.keys(payload).forEach((key) => {
        if (payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });
      if (!editingInvoice) {
        delete payload.invoice_number;
      }

      if (editingInvoice) {
        // await updateInvoice({ id: editingInvoice.id, ...payload }).unwrap();
        toast.success("Invoice updated successfully");
        onInvoiceUpdated?.();
      } else {
        // await createInvoice(payload).unwrap();
        toast.success("Invoice created successfully");
        onInvoiceCreated?.();
      }

      setOpen?.(false);
      reset();
    } catch (error: any) {
      console.error("Invoice submission error:", error);
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  // Handle adding a new item to the table
  const handleAddItem = () => {
    if (!newItem.item_name.trim()) {
      toast.error("Item name is required");
      return;
    }
    if (newItem.quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    if (newItem.unit_price <= 0) {
      toast.error("Unit price must be greater than 0");
      return;
    }

    const itemWithTotal: SalesItem = {
      ...newItem,
      total_price: Number((newItem.quantity * newItem.unit_price).toFixed(2)),
      position: items.length,
    };

    setItems([...items, itemWithTotal]);
    setNewItem({
      item_name: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    });
  };

  // Handle removing an item from the table
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Helper to map status API data to select option
  const mapStatusOption = (status: any) => ({
    value: status.id,
    label: status.name,
  });

  // Helper to map payment method API data to select option
  const mapPaymentMethodOption = (method: any) => ({
    value: method.id,
    label: method.name,
  });

  const discountTypeOptions = [
    { value: "none", label: "No Discount" },
    { value: "percentage", label: "Percentage" },
    { value: "fixed_amount", label: "Fixed Amount" },
  ];

  return (
    <CustomSideWindow
      open={open || false}
      onOpenChange={setOpen || (() => {})}
      side="right"
      title={
        <FromHeader>
          {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
        </FromHeader>
      }
      description={
        editingInvoice
          ? "Update the details for this invoice."
          : "Fill in the details to create a new invoice."
      }
      initialWidth={800}
      resizable={true}
      minWidth={600}
      maxWidth={1000}
      className="overflow-hidden"
    >
      <FormProvider {...methods}>
        <WindowForm
          methods={methods}
          onSubmit={onSubmit}
          onCancel={() => setOpen?.(false)}
          isLoading={isCreating || isUpdating}
          editMode={!!editingInvoice}
          disabled={isCreating || isUpdating}
        >
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {editingInvoice && (
                <FormInputHF
                  name="invoice_number"
                  label="Invoice Number"
                  disabled
                  placeholder="System generated"
                />
              )}
              {/* Quotation field - disabled due to missing API
              <SearchSelectHF
                name="quotation"
                label="Quotation"
                placeholder="Search and select quotation..."
                searchable={true}
                required
                onScrollLoadMore={true}
                rtkQueryHook={useGetQuotationsQuery}
                mapOption={(quotation: any) => ({
                  value: quotation.id,
                  label: quotation.quotation_number,
                  quotation_number: quotation.quotation_number,
                })}
                limit={50}
              />
              */}
            </div>

            {/* Items Section - Show input fields in both create and edit modes */}
            <div className="border border-border rounded-lg p-4 bg-bg">
              <div
                className={`flex justify-between items-center ${
                  isAddItemsExpanded && "mb-4"
                } cursor-pointer`}
                onClick={() => setIsAddItemsExpanded(!isAddItemsExpanded)}
              >
                <div className="flex items-center gap-2">
                  <ChevronDown
                    size={20}
                    className={`text-text transition-transform ${
                      isAddItemsExpanded ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                  <h3 className="text-base font-semibold text-text">
                    {editingInvoice ? "Add More Items" : "Add Items"}
                  </h3>
                </div>
                <TableButton
                  type="add"
                  onClick={handleAddItem}
                  buttonText="Item"
                  isLoading={false}
                />
              </div>

              {isAddItemsExpanded && (
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <FormInput
                    name="item_name"
                    label="Item Name"
                    placeholder="Enter item name"
                    required
                    value={newItem.item_name}
                    onChange={(value) =>
                      setNewItem({ ...newItem, item_name: value })
                    }
                  />
                  <FormInput
                    name="description"
                    label="Description"
                    placeholder="Enter description (optional)"
                    isTextArea={true}
                    rows={2}
                    value={newItem.description || ""}
                    onChange={(value) =>
                      setNewItem({ ...newItem, description: value })
                    }
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      name="quantity"
                      label="Quantity"
                      type="number"
                      placeholder="Enter quantity"
                      required
                      value={newItem.quantity}
                      onChange={(value) =>
                        setNewItem({
                          ...newItem,
                          quantity: parseInt(value) || 0,
                        })
                      }
                    />
                    <FormInput
                      name="unit_price"
                      label="Unit Price"
                      type="number"
                      placeholder="Enter unit price"
                      required
                      value={newItem.unit_price}
                      onChange={(value) =>
                        setNewItem({
                          ...newItem,
                          unit_price: Number(value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Items Table - Show in both create and edit modes */}
            {items.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-bg_shade border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-small font-semibold text-text">
                        Item Name
                      </th>
                      <th className="px-4 py-3 text-left text-small font-semibold text-text">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-small font-semibold text-text">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-small font-semibold text-text">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-right text-small font-semibold text-text">
                        Total
                      </th>
                      <th className="px-4 py-3 text-center text-small font-semibold text-text">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-border hover:bg-bg/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-small text-text">
                          <input
                            type="text"
                            value={item.item_name}
                            onChange={(e) => {
                              const updatedItems = [...items];
                              updatedItems[index].item_name = e.target.value;
                              setItems(updatedItems);
                            }}
                            disabled={!editingInvoice}
                            className="w-full px-2 py-1 border border-border rounded bg-bg text-text disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </td>
                        <td className="px-4 py-3 text-small text-text">
                          <input
                            type="text"
                            value={item.description || ""}
                            onChange={(e) => {
                              const updatedItems = [...items];
                              updatedItems[index].description = e.target.value;
                              setItems(updatedItems);
                            }}
                            disabled={!editingInvoice}
                            className="w-full px-2 py-1 border border-border rounded bg-bg text-text disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </td>
                        <td className="px-4 py-3 text-right text-small text-text">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const updatedItems = [...items];
                              updatedItems[index].quantity =
                                parseInt(e.target.value) || 0;
                              updatedItems[index].total_price =
                                updatedItems[index].quantity *
                                updatedItems[index].unit_price;
                              setItems(updatedItems);
                            }}
                            disabled={!editingInvoice}
                            min="1"
                            className="w-full px-2 py-1 border border-border rounded bg-bg text-text disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary text-right"
                          />
                        </td>
                        <td className="px-4 py-3 text-right text-small text-text">
                          <div className="flex items-center justify-end gap-1">
                            <span>$</span>
                            <input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => {
                                const updatedItems = [...items];
                                updatedItems[index].unit_price =
                                  Number(e.target.value) || 0;
                                updatedItems[index].total_price =
                                  updatedItems[index].quantity *
                                  updatedItems[index].unit_price;
                                setItems(updatedItems);
                              }}
                              disabled={!editingInvoice}
                              step="0.01"
                              min="0"
                              className="w-full px-2 py-1 border border-border rounded bg-bg text-text disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary text-right"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-small font-medium text-text">
                          {formatPrice(item?.total_price || 0, "sign")}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 text-warning hover:bg-warning/10 rounded-md transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-bg_shade border-t border-border font-semibold">
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-3 text-right text-small text-text"
                      >
                        Subtotal:
                      </td>
                      <td className="px-4 py-3 text-right text-small text-text">
                        {formatPrice(subtotal, "sign")}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInputHF
                name="currency"
                label="Currency"
                required
                placeholder="Enter currency"
              />
              <FormInputHF
                name="tax_rate"
                label="Tax Rate (%)"
                type="number"
                step={0.01}
                required
                placeholder="0.00"
              />
              <FormInputHF
                name="tax_amount"
                label="Tax Amount"
                type="number"
                step={0.01}
                disabled
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormSelectHF
                name="discount_type"
                label="Discount Type"
                options={discountTypeOptions}
                required
                placeholder="Select discount type"
              />
              <FormInputHF
                name="discount_value"
                label="Discount Value"
                type="number"
                step={0.01}
                placeholder="0.00"
              />
              <div className="flex flex-col gap-2">
                <label className="text-small font-semibold text-text">
                  Total Amount
                </label>
                <div className="px-3 py-2 border border-border rounded bg-bg_shade text-text font-bold text-lg">
                  {formatPrice(
                    subtotal -
                      (discountType === "percentage"
                        ? (subtotal * discountValue) / 100
                        : discountType === "fixed_amount"
                        ? discountValue
                        : 0) +
                      ((watch("tax_amount") as any) || 0),
                    "sign"
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status field - disabled due to missing API
              <SearchSelectHF
                name="status"
                label="Status"
                placeholder="Search and select status..."
                searchable={true}
                required
                onScrollLoadMore={true}
                rtkQueryHook={useGetInvoiceStatusesQuery}
                mapOption={mapStatusOption}
                limit={50}
              />
              {/* Payment method field - disabled due to missing API
              <SearchSelectHF
                name="payment_method"
                label="Payment Method"
                placeholder="Search and select payment method..."
                searchable={true}
                onScrollLoadMore={true}
                rtkQueryHook={useGetPaymentMethodsQuery}
                mapOption={mapPaymentMethodOption}
                limit={50}
              />
              */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SingleDatePickerHF
                name="issue_date"
                label="Issue Date"
                required
              />
              <SingleDatePickerHF name="due_date" label="Due Date" required />
              <FormInputHF
                name="reference"
                label="Reference"
                placeholder="Enter reference"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInputHF
                name="notes"
                label="Notes"
                type="textarea"
                placeholder="Enter notes"
              />
              <FormInputHF
                name="terms"
                label="Terms & Conditions"
                type="textarea"
                placeholder="Enter terms and conditions"
              />
            </div>
          </div>
        </WindowForm>
      </FormProvider>
    </CustomSideWindow>
  );
}
