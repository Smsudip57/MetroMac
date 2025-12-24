import { useDebounce } from "@/hooks/useDebounce";
import React, { useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import AuthInputField from "./form-field/AuthInputField";
import AuthSearchSelect from "./form-field/AuthSearchSelect";
import { RegisterFormData } from "./Register";

interface RegisterFormStep1Props {
  onNext: () => void;
}

// Mock country data
const MOCK_COUNTRIES = [
  { slug: "bangladesh", name: "Bangladesh" },
  { slug: "india", name: "India" },
  { slug: "pakistan", name: "Pakistan" },
  { slug: "usa", name: "USA" },
  { slug: "uk", name: "United Kingdom" },
];

// Mock cities data by country
const MOCK_CITIES: { [key: string]: { slug: string; city: string }[] } = {
  bangladesh: [
    { slug: "dhaka", city: "Dhaka" },
    { slug: "chittagong", city: "Chittagong" },
    { slug: "sylhet", city: "Sylhet" },
  ],
  india: [
    { slug: "delhi", city: "Delhi" },
    { slug: "mumbai", city: "Mumbai" },
    { slug: "bangalore", city: "Bangalore" },
  ],
  usa: [
    { slug: "new-york", city: "New York" },
    { slug: "los-angeles", city: "Los Angeles" },
    { slug: "chicago", city: "Chicago" },
  ],
};

const RegisterFormStep1: React.FC<RegisterFormStep1Props> = ({ onNext }) => {
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [citySearchTerm, setCitySearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("bangladesh");

  // Use parent form context
  const methods = useFormContext<RegisterFormData>();

  const debouncedCountrySearch = useDebounce(countrySearchTerm, 300);
  const debouncedCitySearch = useDebounce(citySearchTerm, 300);

  // Filter countries based on search
  const countryOptions = useMemo(() => {
    return MOCK_COUNTRIES.filter((country) =>
      country.name.toLowerCase().includes(debouncedCountrySearch.toLowerCase())
    ).map((country) => ({
      value: country.slug,
      label: country.name,
    }));
  }, [debouncedCountrySearch]);

  // Filter cities based on selected country and search
  const cityOptions = useMemo(() => {
    const cities = MOCK_CITIES[selectedCountry] || [];
    return cities
      .filter((city) =>
        city.city.toLowerCase().includes(debouncedCitySearch.toLowerCase())
      )
      .map((city) => ({
        value: city.slug,
        label: city.city,
      }));
  }, [selectedCountry, debouncedCitySearch]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger validation for step 1 fields only
    const step1Fields: (keyof RegisterFormData)[] = [
      "agency",
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "country",
      "city",
      "postCode",
    ];

    const isValid = await methods.trigger(step1Fields);

    if (isValid) {
      onNext();
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="text_highlight-alpha text-xl capitalize leading-normal mb-2">
        Account Information
      </div>

      {/* Agency, First Name, Last Name */}
      <div className="flex flex-col lg:flex-row gap-4">
        <AuthInputField
          name="agency"
          label="Agency/Company Name"
          placeholder="Enter name"
        />
        <AuthInputField
          name="firstName"
          label="First Name"
          placeholder="Enter first name"
        />
        <AuthInputField
          name="lastName"
          label="Last Name"
          placeholder="Enter last name"
        />
      </div>

      {/* Email and Phone */}
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <AuthInputField
          name="email"
          label="Email Address"
          type="email"
          placeholder="Enter email"
        />

        <AuthInputField
          name="phone"
          label="Phone"
          type="number"
          placeholder="01XXXXXXXXX"
        />
      </div>

      <div className="text_highlight-alpha text-xl capitalize leading-normal mb-2 mt-10">
        Address
      </div>

      {/* Address, Country, City, Post Code */}
      <div className="flex flex-col md:flex-row gap-4">
        <AuthInputField
          name="address"
          label="Address"
          placeholder="Enter address"
        />

        <AuthSearchSelect
          name={`country`}
          label="Country"
          options={countryOptions}
          placeholder="Choose country"
          searchable={true}
          onSearch={(value) => setCountrySearchTerm(value)}
          onChange={(country) => {
            setSelectedCountry(country.value);
          }}
        />
        <AuthSearchSelect
          name={`city`}
          label="City"
          placeholder="Choose City"
          options={cityOptions}
          searchable={true}
          onSearch={(value) => setCitySearchTerm(value)}
        />

        <AuthInputField
          name="postCode"
          label="Post Code"
          placeholder="Enter post code"
        />
      </div>

      <div className="w-full flex justify-center items-center mt-14">
        <button
          type="submit"
          className="max-w-[280px] w-full mx-auto bg-dark-emerald-lighter text_highlight-alpha font-semibold py-2.5 text-lg rounded-xl hover:opacity-90 transition"
        >
          Save & Next
        </button>
      </div>
    </form>
  );
};

export default RegisterFormStep1;
