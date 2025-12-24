interface ConvertHtmlToContentProps {
    content: string;
}

const isHtml = (str: string) => /<\/?[a-z][\s\S]*>/i.test(str);

const ConvertHtmlToContent: React.FC<ConvertHtmlToContentProps> = ({
    content,
}) => {
    if (!content) return null;

    if (isHtml(content)) {
        return (
            <div
                className="custom-reset w-full whitespace-pre-wrap first-letter:capitalize"
                dangerouslySetInnerHTML={{__html: content}}
            />
        );
    }

    // If not HTML, render as plain text (preserving whitespace and line breaks)
    return (
        <div className="custom-reset w-full whitespace-pre-wrap first-letter:capitalize">
            {content}
        </div>
    );
};

export default ConvertHtmlToContent;
