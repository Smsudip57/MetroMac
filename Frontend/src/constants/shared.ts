export const fileExportOptions = [
    {slug: "xlsx", name: "XLSX"},
    {slug: "csv", name: "CSV"},
];

export const monthNames: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export const dayNames: string[] = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
];

export type ITripType =
    | "one-way"
    | "round-trip"
    | "multi-city"
    | "multi-carrier";

export const flightClasses = [
    {name: "Economy", value: "Economy"},
    {name: "Business Class", value: "BusinessClass"},
    {name: "Premium Economy", value: "PremiumEconomy"},
    {name: "First Class", value: "FirstClass"},
];

export const defaultQueryParams = {
    page: "1",
    page_size: "10",
    search: "",
    export_as: "",
    to_date: "",
    from_date: "",
};


export const noGutterRoutes = [
    "/projects"
]
