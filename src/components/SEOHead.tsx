import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "event";
  publishedAt?: string;
  author?: string;
}

const SEOHead = ({ title, description, image, url, type = "website", publishedAt, author }: SEOHeadProps) => {
  useEffect(() => {
    const fullTitle = `${title} | শিশুফুল`;
    document.title = fullTitle;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        if (property.startsWith("og:") || property.startsWith("article:")) {
          el.setAttribute("property", property);
        } else {
          el.setAttribute("name", property);
        }
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description || "শিশুফুল - প্রতিটি শিশুর মুখে হাসি");
    setMeta("og:title", fullTitle);
    setMeta("og:description", description || "");
    setMeta("og:type", type);
    if (image) setMeta("og:image", image);
    if (url) setMeta("og:url", url);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description || "");
    if (image) setMeta("twitter:image", image);
    if (publishedAt) setMeta("article:published_time", publishedAt);
    if (author) setMeta("article:author", author);

    return () => { document.title = "শিশুফুল"; };
  }, [title, description, image, url, type, publishedAt, author]);

  return null;
};

export default SEOHead;
