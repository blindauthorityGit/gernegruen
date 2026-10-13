import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/sortiment", "/diese-woche", "/ueber-uns", "/kontakt", "/impressum", "/datenschutz", "/barrierefreiheit"];
  return routes.map((path) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency: path === "/diese-woche" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
