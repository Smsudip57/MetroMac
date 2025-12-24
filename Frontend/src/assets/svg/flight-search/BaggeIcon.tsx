const BaggeIcon = ({
    width = 21,
    height = 20,
}: {
    width?: number;
    height?: number;
}) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            fill="none"
            viewBox="0 0 21 20">
            <path
                fill="#006564"
                d="M16.83 5h-2.5V3.75a1.88 1.88 0 0 0-1.875-1.875h-3.75A1.88 1.88 0 0 0 6.83 3.75V5h-2.5a2.5 2.5 0 0 0-2.5 2.5v8.125a2.5 2.5 0 0 0 2.5 2.5h12.5a2.5 2.5 0 0 0 2.5-2.5V7.5a2.497 2.497 0 0 0-2.5-2.5ZM5.58 15.706a.625.625 0 1 1-1.25 0v-8.28a.625.625 0 0 1 1.25 0v8.28ZM13.08 5h-5V3.75a.627.627 0 0 1 .625-.625h3.75a.627.627 0 0 1 .625.625V5Zm3.75 10.781a.625.625 0 0 1-1.25 0V7.5a.625.625 0 1 1 1.25 0v8.281Z"
            />
        </svg>
    );
};

export default BaggeIcon;
