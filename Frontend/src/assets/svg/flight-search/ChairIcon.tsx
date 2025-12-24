const ChairIcon = ({
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
                fill-rule="evenodd"
                d="M6.287 13.756a2.293 2.293 0 0 0 2.252 1.869h6.118c.805 0 1.458-.653 1.458-1.458V12.5a2.293 2.293 0 0 0-2.292-2.292h-3.471a.208.208 0 0 1-.205-.17L8.853 2.922a2.292 2.292 0 0 0-2.255-1.881H5.66a1.459 1.459 0 0 0-1.433 1.727l2.06 10.987Z"
                clip-rule="evenodd"
            />
            <path
                fill="#006564"
                fill-rule="evenodd"
                d="M9.543 14.67s-.7 1.116-1.287 2.057a1.46 1.46 0 0 0 1.237 2.231h5.58a.626.626 0 0 0 0-1.25h-5.58a.208.208 0 0 1-.177-.319l1.287-2.058a.625.625 0 0 0-1.06-.662ZM9.24 8.124h5a.626.626 0 0 0 0-1.25h-5a.625.625 0 0 0 0 1.25Z"
                clip-rule="evenodd"
            />
        </svg>
    );
};

export default ChairIcon;
