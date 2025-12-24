import {SvgProps} from "@/types/svg";

export const NightIcon = ({
    color = "#AEB7B7",
}: SvgProps): React.ReactElement => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
                fill={color}
                d="M20.112 18.624c-4.032 4.2-10.8 4.152-14.784-.216C1.968 14.712 1.872 9 5.088 5.184a10.347 10.347 0 0 1 3.888-2.856c.36-.144.72.24.504.576-2.256 3.696-1.728 8.592 1.536 11.712 2.664 2.544 6.432 3.216 9.696 2.04.36-.144.696.288.48.6-.312.48-.672.936-1.08 1.368Z"
            />
        </svg>
    );
};
