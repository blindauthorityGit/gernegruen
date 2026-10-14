"use client";

import {useEffect, useId, useMemo, useRef, useState} from "react";
import Image from "next/image";
import {createImageUrlBuilder} from "@sanity/image-url";
import {A11y, Pagination} from "swiper/modules";
import {Swiper, SwiperSlide} from "swiper/react";
import Lightbox from "yet-another-react-lightbox";
import {Captions, Counter} from "yet-another-react-lightbox/plugins";
import {useReducedMotion} from "motion/react";
import {useIsPresentationTool} from "next-sanity/hooks";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";

import "swiper/css";
import "swiper/css/pagination";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/counter.css";

import {Container} from "@/components/layout/Container";
import {Heading} from "@/components/ui/Heading";

import styles from "./AssortmentGallery.module.css";

export type AssortmentGalleryImage = {
  src: string;
  width?: number;
  height?: number;
  crop?: {top?: number; bottom?: number; left?: number; right?: number};
  hotspot?: {x: number; y: number; width: number; height: number};
};

export type AssortmentGalleryItem = {
  _key: string;
  image?: AssortmentGalleryImage;
  altText: string;
  caption?: string;
};

export type AssortmentGalleryContent = {
  _sourceId?: string;
  _sourceType?: "assortmentPage" | "aboutPage";
  eyebrow?: string;
  heading?: string;
  description?: string;
  images?: AssortmentGalleryItem[];
};

const imageBuilder = createImageUrlBuilder({projectId: "zqaggz4f", dataset: "production"});
const mobileBreakpoint = "(max-width: 760px)";

function imageUrl(image: AssortmentGalleryImage, useHotspot: boolean) {
  const builder = imageBuilder.image({
    asset: {url: image.src},
    ...(useHotspot ? {crop: image.crop, hotspot: image.hotspot} : {}),
  });
  return builder;
}

function GalleryImageButton({
  item,
  index,
  location,
  registerButton,
  onOpen,
  shouldSuppressClick,
  disableLightbox,
  dataAttribute,
}: {
  item: AssortmentGalleryItem;
  index: number;
  location: "desktop" | "mobile";
  registerButton: (location: "desktop" | "mobile", index: number, element: HTMLButtonElement | null) => void;
  onOpen: (index: number, element: HTMLButtonElement) => void;
  shouldSuppressClick?: () => boolean;
  disableLightbox: boolean;
  dataAttribute?: string;
}) {
  const image = item.image;
  if (!image?.src) return null;

  return (
    <button
      aria-haspopup="dialog"
      aria-label={`Bild vergrößern: ${item.caption || item.altText}`}
      className={styles.imageButton}
      data-sanity={dataAttribute}
      onClick={(event) => {
        if (disableLightbox || shouldSuppressClick?.()) return;
        onOpen(index, event.currentTarget);
      }}
      ref={(element) => registerButton(location, index, element)}
      type="button"
    >
      <span className={styles.imageMask}>
        <Image
          alt=""
          className={styles.image}
          fill
          loader={({width, quality}) => imageUrl(image, true).width(width).height(Math.round(width * 0.75)).fit("crop").quality(quality ?? 80).auto("format").url()}
          sizes="(max-width: 760px) 88vw, (max-width: 1100px) 45vw, 30vw"
          src={image.src}
        />
        <span aria-hidden="true" className={styles.expandIcon}>↗</span>
      </span>
    </button>
  );
}

export function AssortmentGallery({content, layout = "grid"}: {content: AssortmentGalleryContent; layout?: "grid" | "carousel"}) {
  const headingId = useId();
  const items = useMemo(() => content.images?.filter((item) => item.image?.src) ?? [], [content.images]);
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const desktopButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mobileButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const galleryRef = useRef<HTMLUListElement | null>(null);
  const pointerRef = useRef<{x: number; scrollLeft: number} | null>(null);
  const draggedRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const isPresentation = useIsPresentationTool();

  useEffect(() => {
    const media = window.matchMedia(mobileBreakpoint);
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const lightboxSlides = useMemo(() => items.flatMap((item) => {
    const image = item.image;
    if (!image?.src) return [];
    const width = image.width ?? 2400;
    const height = image.height ?? Math.round(width * 0.75);
    const original = imageUrl(image, false).width(Math.min(width, 2400)).fit("max").auto("format").url();
    const srcSet = [640, 960, 1280, 1920]
      .filter((size) => size < width)
      .map((size) => ({
        src: imageUrl(image, false).width(size).fit("max").auto("format").url(),
        width: size,
        height: Math.round(size * height / width),
      }));
    return [{src: original, alt: item.altText, width, height, description: item.caption, srcSet}];
  }), [items]);

  if (!items.length) return null;

  const registerButton = (location: "desktop" | "mobile", index: number, element: HTMLButtonElement | null) => {
    (location === "desktop" ? desktopButtonRefs : mobileButtonRefs).current[index] = element;
  };
  const openAt = (index: number, element: HTMLButtonElement) => {
    openerRef.current = element;
    setActiveIndex(index);
    setLightboxOpen(true);
  };
  const suppressDraggedClick = () => {
    const dragged = draggedRef.current;
    draggedRef.current = false;
    return dragged;
  };
  const closeLightbox = () => setLightboxOpen(false);
  const restoreOpenerFocus = () => {
    const opener = openerRef.current;
    if (opener?.isConnected && opener.getClientRects().length) opener.focus({preventScroll: true});
    else (isMobile ? mobileButtonRefs : desktopButtonRefs).current[activeIndex]?.focus({preventScroll: true});
  };

  return (
    <section className={[styles.section, layout === "carousel" ? styles.carouselSection : ""].filter(Boolean).join(" ")} aria-labelledby={headingId}>
      <Container>
        <header className={styles.header}>
          {content.eyebrow && <p className={styles.eyebrow}>{content.eyebrow}</p>}
          <Heading id={headingId}>{content.heading || "Einblicke in unseren Markt"}</Heading>
          {content.description && <p className={styles.description}>{content.description}</p>}
        </header>

        {layout === "carousel" && !isMobile && items.length > 1 && <div className={styles.controls} aria-label="Galerie-Steuerung">
          <button aria-label="Vorherige Bilder" onClick={() => galleryRef.current?.scrollBy({left: -galleryRef.current.clientWidth * 0.72, behavior: reducedMotion ? "instant" : "smooth"})} type="button">←</button>
          <button aria-label="Nächste Bilder" onClick={() => galleryRef.current?.scrollBy({left: galleryRef.current.clientWidth * 0.72, behavior: reducedMotion ? "instant" : "smooth"})} type="button">→</button>
        </div>}
        <ul className={styles.gallery} ref={galleryRef}
          onPointerDown={layout === "carousel" ? (event) => { draggedRef.current = false; pointerRef.current = {x: event.clientX, scrollLeft: event.currentTarget.scrollLeft}; event.currentTarget.setPointerCapture(event.pointerId); } : undefined}
          onPointerMove={layout === "carousel" ? (event) => { if (pointerRef.current) { const delta = event.clientX - pointerRef.current.x; if (Math.abs(delta) > 10) draggedRef.current = true; event.currentTarget.scrollLeft = pointerRef.current.scrollLeft - delta; } } : undefined}
          onPointerUp={layout === "carousel" ? () => { pointerRef.current = null; } : undefined}
          onPointerCancel={layout === "carousel" ? () => { pointerRef.current = null; } : undefined}>
          {items.map((item, index) => (
            <li className={styles.item} key={item._key}>
              <figure className={styles.figure}>
                <GalleryImageButton index={index} item={item} location="desktop" onOpen={openAt} registerButton={registerButton} shouldSuppressClick={layout === "carousel" ? suppressDraggedClick : undefined} disableLightbox={isPresentation === true} dataAttribute={content._sourceId ? sanityDataAttribute(content._sourceId, content._sourceType ?? "assortmentPage", `gallery.images[_key=="${item._key}"].image`) : undefined} />
                {item.caption && <figcaption className={styles.caption}>{item.caption}</figcaption>}
              </figure>
            </li>
          ))}
        </ul>

        {isMobile && <Swiper
          a11y={{enabled: true}}
          className={styles.mobileSwiper}
          modules={[A11y, Pagination]}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          pagination={{clickable: true}}
          resistanceRatio={0.65}
          slidesPerView="auto"
          spaceBetween={18}
          threshold={8}
          touchAngle={45}
          touchMoveStopPropagation={false}
          touchStartPreventDefault={false}
          watchOverflow
        >
          {items.map((item, index) => (
            <SwiperSlide className={styles.mobileSlide} key={item._key}>
              <figure className={styles.figure}>
                <GalleryImageButton index={index} item={item} location="mobile" onOpen={openAt} registerButton={registerButton} disableLightbox={isPresentation === true} dataAttribute={content._sourceId ? sanityDataAttribute(content._sourceId, content._sourceType ?? "assortmentPage", `gallery.images[_key=="${item._key}"].image`) : undefined} />
                {item.caption && <figcaption className={styles.caption}>{item.caption}</figcaption>}
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>}
      </Container>

      <Lightbox
        animation={reducedMotion ? {fade: 0, swipe: 0, navigation: 0} : {fade: 180, swipe: 240, navigation: 260}}
        carousel={{imageFit: "contain"}}
        close={closeLightbox}
        controller={{closeOnBackdropClick: true, closeOnEscape: true}}
        index={activeIndex}
        on={{view: ({index}) => setActiveIndex(index), exited: restoreOpenerFocus}}
        labels={{Close: "Galerie schließen", Next: "Nächstes Bild", Previous: "Vorheriges Bild", Lightbox: "Bildergalerie"}}
        open={lightboxOpen}
        plugins={[Captions, Counter]}
        slides={lightboxSlides}
        className={styles.lightbox}
      />
    </section>
  );
}
