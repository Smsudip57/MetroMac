import {format} from "date-fns";

export const formatParamsDate = (date: string | Date | undefined) => {
    if (!date) return undefined;
    return format(date, "yyyy-MM-dd");
};
