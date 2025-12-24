export const SearchIcon = ({color = "#fff"}: {color?: string}) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M10.546 17.09a6.545 6.545 0 1 0 0-13.09 6.545 6.545 0 0 0 0 13.09Z"
            />
            <path
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="m20 20-4.727-4.727m-1.091-4.727a3.636 3.636 0 0 0-3.637-3.637"
            />
        </svg>
    );
};
