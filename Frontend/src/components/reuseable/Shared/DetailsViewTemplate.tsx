interface DetailsViewTemplateProps {
    title?: string;
    children: React.ReactNode;
}

const DetailsViewTemplate = ({title, children}: DetailsViewTemplateProps) => {
    return (
        <div>
            {title && (
                <div className="w-full capitalize bg-light-emerald-base md:h-16 h-14 rounded-t-2xl font-bold text-white  pt-4 md:px-6 px-4 md:text-base text-sm">
                    {title}
                </div>
            )}

            <div className="relative md:pl-6 pl-4 md:pr-4 pr-2 pt-6 md:-mt-3 -mt-2 pb-6  w-full bg-white rounded-2xl shadow-[0px_12px_48px_0px_rgba(85,153,153,0.16)]">
                {children}
            </div>
        </div>
    );
};

export default DetailsViewTemplate;
