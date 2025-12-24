import {SvgProps} from "@/types/svg";

const AdultIcon = ({color = "#6A7575"}: SvgProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
                fill={color}
                d="M12 4.597A2.298 2.298 0 1 0 12 0a2.298 2.298 0 0 0 0 4.597Zm6.121 7.877L15.56 6.599a1.879 1.879 0 0 0-1.425-1.091c-.094-.025-4.175-.025-4.272 0A1.88 1.88 0 0 0 8.44 6.6l-2.56 5.873a1.141 1.141 0 0 0 2.09.912l.966-2.213v11.583a1.245 1.245 0 1 0 2.49 0v-7.813h1.149v7.813a1.245 1.245 0 0 0 2.489 0V11.172l.966 2.215a1.14 1.14 0 0 0 2.091-.912Z"
            />
        </svg>
    );
};

export default AdultIcon;
