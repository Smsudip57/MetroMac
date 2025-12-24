import {SvgProps} from "@/types/svg";

const FirstSkeletonIcon = ({
    width = 37,
    height = 30,
    color = "#FAFFFF",
}: SvgProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            fill="none"
            viewBox="0 0 37 30">
            <path
                stroke={color}
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M25.407 11.51H16.58l-2.878-6.72a1.668 1.668 0 0 1 .131-1.547c.146-.227.344-.413.578-.542a1.579 1.579 0 0 1 1.847.234l9.149 8.576Z"
            />
            <path
                stroke={color}
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6.603 11.51 4.684 7.596a1.441 1.441 0 0 0-.529-.575 1.402 1.402 0 0 0-1.744.221c-.265.272-.413.64-.413 1.023v7.163c0 1.039.404 2.035 1.124 2.769.356.364.78.652 1.245.849a3.77 3.77 0 0 0 1.469.298h25.327a3.8 3.8 0 0 0 2.714-1.147A3.957 3.957 0 0 0 35 15.426a3.957 3.957 0 0 0-1.124-2.768 3.8 3.8 0 0 0-2.714-1.147H6.603Z"
            />
            <path
                stroke={color}
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m15.046 19.334-1.535 6.38a1.713 1.713 0 0 0 .2 1.527c.15.219.35.399.582.524.232.125.49.191.753.194a1.63 1.63 0 0 0 1.228-.56l8.076-8.065"
            />
        </svg>
    );
};

const SecondSkeletonIcon = ({
    color = "#FAFFFF",
    width = 27,
    height = 26,
}: SvgProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            fill="none"
            viewBox="0 0 27 26">
            <path
                stroke={color}
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1.5 23.382V4.387a1 1 0 0 1 .684-.948L8.868 1.21a2 2 0 0 1 1.264 0l6.736 2.245a2 2 0 0 0 1.265 0l6.05-2.017a1 1 0 0 1 1.317.948v17.995a1 1 0 0 1-.553.894l-6.553 3.277a2 2 0 0 1-1.788 0l-6.212-3.106a2 2 0 0 0-1.788 0l-5.659 2.83a1 1 0 0 1-1.447-.895Z"
            />
        </svg>
    );
};

const ThirdSkeletonIcon = ({
    color = "#FAFFFF",
    width = 32,
    height = 32,
}: SvgProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            fill="none"
            viewBox="0 0 32 32">
            <circle
                cx="15.5"
                cy="16"
                r="12"
                stroke={color}
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
            />
            <path
                stroke={color}
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16.833 4.064a6.667 6.667 0 0 0 1.309 11.067c2.691 1.35 3.718-.47 5.176.512a2.064 2.064 0 0 1 .558 2.865c-.667.99-1.71 1.492-1.53 3.115.102.915.665 1.704 1.394 2.377M4.833 12.373a6.64 6.64 0 0 1 3.741 2.461A6.642 6.642 0 0 1 9.897 19.4c-.07.835.475 1.677 1.175 2.137a3.615 3.615 0 0 1 .428 5.718"
            />
        </svg>
    );
};

const FourthSkeletonIcon = ({
    color = "#fff",
    width = 32,
    height = 31,
}: SvgProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            fill="none"
            viewBox="0 0 32 31">
            <path
                stroke={color}
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.167 6.333a2 2 0 0 1 2-2h6.667a2 2 0 0 1 2 2v19.333H10.167V6.333Z"
            />
            <path
                stroke={color}
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.167 6.333a2 2 0 0 1 2-2h6.667a2 2 0 0 1 2 2v19.333H10.167V6.333Z"
            />
            <rect
                width="24"
                height="16"
                x="3.5"
                y="9.667"
                stroke={color}
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                rx="2"
            />
        </svg>
    );
};

const FifthSkeletonIcon = ({
    color = "#fff",
    width = 32,
    height = 33,
}: SvgProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            fill="none"
            viewBox="0 0 32 33">
            <path
                stroke={color}
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M18.666 19.681v-6.57M8.236 7H16a2.918 2.918 0 0 0 2.916 2.837A2.918 2.918 0 0 0 21.832 7h1.933A4.238 4.238 0 0 1 28 11.24v10.52A4.238 4.238 0 0 1 23.765 26h-1.933a2.918 2.918 0 0 0-2.915-2.837A2.918 2.918 0 0 0 16 26H8.235A4.238 4.238 0 0 1 4 21.76V11.24A4.238 4.238 0 0 1 8.235 7Z"
            />
        </svg>
    );
};

const SixthSkeletonIcon = ({
    color = "#fff",
    width = 32,
    height = 32,
}: SvgProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            fill="none"
            viewBox="0 0 32 32">
            <path
                stroke={color}
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m16.664 17.9-3.23 5.597m9.09-17.28c-2.737 1.67-8.272 6.037-8.519 10.149m9.847-9.381c-.017 3.24-.928 10.276-4.438 12.503M1.9 26.587 5.278 25.1a12.279 12.279 0 0 1 6.574-.931l.103.013a12.28 12.28 0 0 1 6.177 2.691l2.702 2.225M8.389 13.123l16.55 9.555c.936.54 2.133.22 2.674-.716 3.062-5.305 1.245-12.087-4.06-15.15l-.73-.422c-5.305-3.063-12.088-1.245-15.15 4.06a1.956 1.956 0 0 0 .716 2.673Z"
            />
        </svg>
    );
};

export {
    FirstSkeletonIcon,
    SecondSkeletonIcon,
    ThirdSkeletonIcon,
    FourthSkeletonIcon,
    FifthSkeletonIcon,
    SixthSkeletonIcon,
};
