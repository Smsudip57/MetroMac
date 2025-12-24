import React from "react";

interface TitleWithBorderProps {
    title: string;
}

export const TitleWithBorder = ({title}: TitleWithBorderProps) => {
    return (
        <h2 className="self-stretch relative text-base md:text-lg lg:text-heading-3 font-semibold text-white capitalize leading-7 text-center">
            {title}
            <span className="absolute left-1/2 -bottom-4 transform -translate-x-1/2 mt-2 h-[3px] group">
                <span
                    className="
                        absolute block h-full rounded-[50%] 
                        bg-[linear-gradient(to_right,_#FFFFFF00,_#E8B442,_#FFFFFF00)]
                        w-[calc(100%+100px)]
                        md:w-[calc(100%+160px)]
                        lg:w-[calc(100%+200px)]
                    "
                    style={{
                        left: "50%",
                        transform: "translateX(-50%)",
                    }}></span>
                <span
                    className="
                    block h-full invisible 
                    w-[calc(100%+60px)]
                    md:w-[calc(100%+120px)]
                    lg:w-[calc(100%+150px)]
                ">
                    {title}
                </span>
            </span>
        </h2>
    );
};
