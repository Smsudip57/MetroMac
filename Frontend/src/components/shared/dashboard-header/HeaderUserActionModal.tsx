import Link from "next/link";
import React from "react";

interface HeaderUserActionModalProps {
  companyName: string;
  companyId: string;
  pendingBalance: string;
  usableBalance: string;
  currentBalance: string;
  checkCreditBalance: string;
  isShowCreditBalance?: boolean;
}

const HeaderUserActionModal: React.FC<HeaderUserActionModalProps> = ({
  companyName,
  companyId,
  pendingBalance,
  currentBalance,
  checkCreditBalance,
  isShowCreditBalance = false,
}) => {
  return (
    <div className=" font-semibold">
      {/* Header */}
      <div className="mb-2 md:mb-4">
        <span className="block text-light-alpha-black  md:text-lg text-base">
          {companyName}
        </span>
        <span className="block text-light-alpha text-xs md:text-sm">
          {companyId}
        </span>
      </div>

      {/* Balances Section */}
      <div className="md:space-y-2 md:p-4 p-2 border border-light-stroke-beta rounded-xl">
        <BalanceItem
          label="Current Balance"
          value={currentBalance}
          valueClass="text-light-alpha"
        />

        {isShowCreditBalance && (
          <BalanceItem
            label="Credit Balance"
            value={checkCreditBalance}
            valueClass="text-light-alpha"
          />
        )}

        <BalanceItem
          label="Pending Balance"
          value={pendingBalance}
          valueClass="text-warning"
        />
      </div>

      {/* Descriptions */}
      <div className="mt-6 md:space-y-6 space-y-3">
        <BalanceDescription
          title="Current Balance:"
          description="This is the total amount of money in your company account."
        />
        <BalanceDescription
          title="Pending Balance:"
          description="This amount indicates the amount yet to be processed (i.e., amount required for a reissue request that is on processing). You can check your Pending Transactions in"
          linkText="Transaction"
          linkUrl="/transactions"
        />
      </div>
    </div>
  );
};

const BalanceItem: React.FC<{
  label: string;
  value: string;
  valueClass?: string;
  labelClass?: string;
}> = ({ label, value, valueClass, labelClass }) => (
  <div className="flex justify-between items-center">
    <span
      className={`text-sm md:text-base font-semibold leading-7 ${labelClass}`}
    >
      {label}
    </span>
    <span
      className={`text-sm md:text-base font-semibold leading-7 ${valueClass}`}
    >
      {value}
    </span>
  </div>
);

const BalanceDescription: React.FC<{
  title: string;
  description: string;
  linkText?: string;
  linkUrl?: string;
}> = ({ title, description, linkText, linkUrl }) => (
  <div className="text-light-alpha text-xs md:text-sm font-medium">
    <span className="text-light-alpha font-bold">{title} </span>
    <span className="text-light-alpha">{description} </span>
    {linkText && linkUrl && (
      <Link href={linkUrl} className="text-light-emerald-base underline">
        {linkText}
      </Link>
    )}
  </div>
);

export default HeaderUserActionModal;
