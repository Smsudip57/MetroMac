export interface ICountry {
    id: number;
    name: string;
    slug: string;
    iso: string;
    iso3: string;
    numcode: string;
    phone_code: string;
    traffic: "right" | "left"; // Assuming traffic can only be 'right' or 'left'
    nationality: string;
    continent: string;
    sub_continent: string;
    flag: string;
}
