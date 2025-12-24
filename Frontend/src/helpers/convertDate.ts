import {format} from "date-fns";

export function convertDate(dateString: string): string {
    const date = new Date(dateString);
    return format(date, "EEE dd MMM, yyyy");
}
