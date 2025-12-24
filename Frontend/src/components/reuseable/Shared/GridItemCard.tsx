const GridItemCard = ({
    label,
    value,
    valueClassName,
}: {
    label: string;
    value?: string;
    valueClassName?: string;
}) => {
    return (
        <div
            className={`flex flex-col gap-1 font-semibold md:text-sm text-xs text-light-alpha`}>
            <h5>{label}</h5>
            <p className={`text-light-beta ${valueClassName}`}>
                {value ? value : "N/A"}
            </p>
        </div>
    );
};

export default GridItemCard;
