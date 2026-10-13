"use client";

import { useEffect } from "react";

function hasVisibleBackground(color: string) {
  return color !== "transparent" && color !== "rgba(0, 0, 0, 0)";
}

export function FooterBleedSync() {
  useEffect(() => {
    const footer = document.querySelector<HTMLElement>("[data-site-footer]");
    const main = footer?.previousElementSibling;
    const section = main?.lastElementChild;

    if (!(footer instanceof HTMLElement) || !(main instanceof HTMLElement) || !(section instanceof HTMLElement)) return;

    let frame = 0;
    const updateBleedColor = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const sectionBounds = section.getBoundingClientRect();
        const candidates = [section, ...Array.from(section.querySelectorAll<HTMLElement>("*"))].reverse();
        const background = candidates.find((element) => {
          const bounds = element.getBoundingClientRect();
          const coversSection = bounds.left <= sectionBounds.left + 1
            && bounds.top <= sectionBounds.top + 1
            && bounds.right >= sectionBounds.right - 1
            && bounds.bottom >= sectionBounds.bottom - 1;

          return coversSection && hasVisibleBackground(getComputedStyle(element).backgroundColor);
        });

        footer.style.setProperty(
          "--footer-bleed-color",
          background ? getComputedStyle(background).backgroundColor : "var(--color-canvas)",
        );
      });
    };

    const resizeObserver = new ResizeObserver(updateBleedColor);
    resizeObserver.observe(main);
    resizeObserver.observe(section);

    const mutationObserver = new MutationObserver(updateBleedColor);
    mutationObserver.observe(main, { attributes: true, childList: true, subtree: true });
    window.addEventListener("resize", updateBleedColor, { passive: true });
    updateBleedColor();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", updateBleedColor);
    };
  }, []);

  return null;
}
