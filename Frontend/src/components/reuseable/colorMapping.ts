const commonDetails =
  "text-nowrap px-2 md:px-3 py-1.5 rounded-xl inline-flex justify-center md:text-sm text-xs font-bold";

const warningButton = {
  green: `bg-light-warning-green-trans text-light-warning-green ${commonDetails}`,

  red: `bg-warning-trans text-warning ${commonDetails}`,

  blue: `bg-light-warning-blue-trans text-light-warning-blue ${commonDetails}`,

  yellow: `bg-light-warning-yellow-trans text-light-warning-yellow ${commonDetails}`,

  orange: `bg-light-warning-orange-trans text-light-warning-orange ${commonDetails}`,

  purple: `bg-light-warning-purple-trans text-light-warning-purple ${commonDetails}`,

  pink: `bg-light-warning-pink-trans text-light-warning-pink ${commonDetails}`,

  teal: `bg-light-warning-teal-trans text-light-warning-teal ${commonDetails}`,
};

const textColors = {
  green: "text-light-warning-green font-bold",
  red: "text-warning font-bold",
  blue: "text-light-warning-blue font-bold",
  yellow: "text-light-warning-yellow font-bold",
  orange: "text-light-warning-orange font-bold",
  purple: "text-light-warning-purple font-bold",
  pink: "text-light-warning-pink font-bold",
  teal: "text-light-warning-teal font-bold",
};

const bgColorMap = {
  // green
  Completed: warningButton.green,
  Approved: warningButton.green,
  Paid: warningButton.green,
  Accepted: warningButton.green,
  "Full Paid": warningButton.green,
  Ticketed: warningButton.green,
  Regular: warningButton.green,

  // red
  Rejected: warningButton.red,
  Cancelled: warningButton.red,
  Unpaid: warningButton.red,
  Failed: warningButton.red,
  "Failed Booking": warningButton.red,
  Closed: warningButton.red,
  Declined: warningButton.red,
  "Partial Paid": warningButton.red,

  // blue
  Pending: warningButton.blue,
  Booked: warningButton.blue,
  Initiated: warningButton.blue,
  Requested: warningButton.blue,
  Processing: warningButton.blue,
  Manual: warningButton.blue,

  // yellow
  Quotation: warningButton.yellow,

  // Orange
  Void: warningButton.orange,

  //Purple
  Reissued: warningButton.purple,

  //Pink
  "Refund Processing": warningButton.pink,

  //Teal
  Refunded: warningButton.teal,
};

const textColorMap = {
  // green
  Completed: textColors.green,
  Approved: textColors.green,
  Paid: textColors.green,
  Accepted: textColors.green,
  "Full Paid": textColors.green,
  Ticketed: textColors.green,
  Regular: textColors.green,
  // red
  Rejected: textColors.red,
  Cancelled: textColors.red,
  Unpaid: textColors.red,
  Failed: textColors.red,
  "Failed Booking": textColors.red,
  Closed: textColors.red,
  "Partial Paid": textColors.red,

  // blue
  Pending: textColors.blue,
  Booked: textColors.blue,
  Initiated: textColors.blue,
  Requested: textColors.blue,
  Processing: textColors.blue,
  Manual: textColors.blue,

  // yellow
  Quotation: textColors.yellow,

  //Orange
  Void: textColors.orange,

  //purple
  Reissued: textColors.purple,

  //Pink
  "Refund Processing": textColors.pink,

  //Teal
  Refunded: textColors.teal,
};

export const colorMapping = (status: string) => {
  // Fallback to Pending style if status is not found
  return bgColorMap[status as keyof typeof bgColorMap] || bgColorMap.Pending;
};

export const textColorMapping = (status: string) => {
  return (
    textColorMap[status as keyof typeof textColorMap] || textColorMap.Pending
  );
};

function getCssVarValue(varName: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
}

export function getColors() {
  return {
    primary: getCssVarValue("--color-primary"),
    secondary: getCssVarValue("--color-secondary"),
    tertiary: getCssVarValue("--color-tertiary"),
    success: getCssVarValue("--color-success"),
    warning: getCssVarValue("--color-warning"),
    neutral: getCssVarValue("--color-neutral"),
    text: getCssVarValue("--color-text"),
    bg: getCssVarValue("--color-bg"),
  };
}
