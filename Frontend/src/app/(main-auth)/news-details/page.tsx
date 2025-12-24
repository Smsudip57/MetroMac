import { API_CONFIG } from "@/lib/config";
import Image from "next/image";

// Optional: If you have a component to render HTML content safely, import it here
import ConvertHtmlToContent from "@/components/reuseable/rich-text/ConvertHtmlToContent";
import { CalendarDays, Clock } from "lucide-react";
import BackButton from "@/components/reuseable/buttons/BackButton";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const NewsDetails = async ({
  searchParams,
}: {
  searchParams: { slug: string };
}) => {
  const { slug } = searchParams;

  const response = await fetch(
    `${API_CONFIG.base_url}/api/v1/cms/news/${slug}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch news details");
  }

  const data = await response.json();
  const news = data?.data;

  return (
    <div className="bg-[#0b1a1a] min-h-screen">
      <div className="container !lg:pt-36 md:!pt-32 !pt-28 !pb-10">
        <BackButton color="#14F0EE" className="!text_highlight-alpha" />
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-dark-stroke-beta pb-8 mb-8">
            <div className="flex flex-col justify-between gap-2">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text_highlight-alpha capitalize">
                {news?.title}
              </h1>
              <div className="flex items-center gap-6  text_highlight-alpha font-semibold mb-2 text-sm md:text-base">
                <div className="flex items-center gap-1">
                  <CalendarDays className="size-4 text_highlight-emerald-lightest" />
                  <span>
                    {news?.created_at ? formatDate(news?.created_at) : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="size-4 text_highlight-emerald-lightest" />
                  <span>2 Minute Read</span>
                </div>
              </div>
            </div>
            <div className="lg:flex justify-end ">
              <div className="max-h-[255px] lg:w-[90%] w-[100%] ">
                <Image
                  src={news?.image || ""}
                  alt={news?.title || "News Thumbnail"}
                  width={600}
                  height={250}
                  className="object-cover w-full lg:h-full h-[250px] rounded-xl"
                  priority
                />
              </div>
            </div>
          </div>
          <p className="text_highlight-beta md:text-base text-sm mb-4 font-medium">
            {news?.short_description}
          </p>
          <div className="prose prose-invert max-w-none text_highlight-beta font-medium md:text-base text-sm   ">
            <ConvertHtmlToContent content={news?.content || ""} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetails;
