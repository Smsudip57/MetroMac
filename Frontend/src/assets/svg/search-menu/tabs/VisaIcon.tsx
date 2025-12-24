const VisaIcon = ({color = "#AEB7B7"}: {color?: string}) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="29"
            height="28"
            fill="none"
            viewBox="0 0 29 28">
            <path
                fill={color}
                fill-rule="evenodd"
                d="M10.72 15.743a3.539 3.539 0 1 1 7.078 0 3.539 3.539 0 0 1-7.078 0Zm3.538-2.123a2.123 2.123 0 1 0 0 4.246 2.123 2.123 0 0 0 0-4.246Z"
                clip-rule="evenodd"
            />
            <path
                fill={color}
                fill-rule="evenodd"
                d="M20.628 6.595a2.596 2.596 0 0 0-2.962-2.569L7.477 5.481A1.717 1.717 0 0 0 6.001 7.25v13.21A3.539 3.539 0 0 0 9.541 24h9.436a3.538 3.538 0 0 0 3.539-3.539v-9.437a3.54 3.54 0 0 0-1.888-3.13v-1.3ZM7.711 8.9h11.275a2.123 2.123 0 0 1 2.114 2.123v9.437a2.123 2.123 0 0 1-2.123 2.123H9.54a2.123 2.123 0 0 1-2.123-2.123V8.901h.294Zm11.277-1.415h.225v-.891a1.179 1.179 0 0 0-1.347-1.168L7.677 6.882a.303.303 0 0 0 .039.603h11.272Z"
                clip-rule="evenodd"
            />
        </svg>
    );
};

export default VisaIcon;
