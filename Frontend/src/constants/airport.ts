export type Airport = {
    name: string;
    slug?: string;
    city: string;
    country?: string;
    iata: string;
};

type DefaultLocations = {
    from: Airport;
    to: Airport | null;
};

//In from location the first item will be used as a default data
export const AirportStaticData: Airport[] = [
    {
        name: "Dhaka Shahjalal International Airport",
        slug: "dhaka-shahjalal-international-airport",
        city: "Dhaka",
        country: "Bangladesh",
        iata: "DAC",
    },
    {
        name: "Cox's Bazar Airport",
        slug: "coxs-bazar-airport",
        city: "Cox's Bazar",
        country: "Bangladesh",
        iata: "CXB",
    },

    {
        name: "John F. Kennedy International Airport",
        slug: "john-f-kennedy-international-airport",
        city: "New York",
        country: "United States",
        iata: "JFK",
    },
    {
        name: "Suvarnabhumi Airport",
        slug: "suvarnabhumi-airport",
        city: "Bangkok",
        country: "Thailand",
        iata: "BKK",
    },
    {
        name: "Sultan Abdul Aziz Shah Airport",
        slug: "sultan-abdul-aziz-shah-airport",
        city: "Kuala Lumpur",
        country: "Malaysia",
        iata: "SZB",
    },
    {
        name: "Netaji Subhas Chandra Bose International Airport",
        slug: "netaji-subhas-chandra-bose-international-airport",
        city: "Dum Dum/Kolkata",
        country: "India",
        iata: "CCU",
    },
];

// Default locations object
export const defaultLocation: DefaultLocations = {
    from: AirportStaticData[0],
    to: AirportStaticData[1],
};
