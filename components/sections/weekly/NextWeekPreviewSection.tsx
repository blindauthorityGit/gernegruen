import Image from "next/image"

import {ProductWishTrigger} from "@/components/cta/ProductWishTrigger"
import {Container} from "@/components/layout/Container"
import {Reveal} from "@/components/motion/Reveal"
import {Heading} from "@/components/ui/Heading"
import type {NextWeekPreviewData} from "@/lib/weekly/preview-types"

import styles from "./NextWeekPreviewSection.module.css"
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute"
import {stegaClean} from "next-sanity"

export function NextWeekPreviewSection({preview}: {preview: NextWeekPreviewData}) {
  return (
    <section className={styles.section} aria-labelledby="next-week-preview-title" data-sanity={sanityDataAttribute(preview._id, "nextWeekPreview", "products")}>
      <Container>
        <div className={styles.layout}>
          <div className={styles.content}>
            <Reveal className={styles.intro}>
              <p className={styles.eyebrow}>Ein kleiner Vorgeschmack</p>
              <Heading id="next-week-preview-title" data-sanity={sanityDataAttribute(preview._id, "nextWeekPreview", "title")}>{preview.title}</Heading>
              <p data-sanity={sanityDataAttribute(preview._id, "nextWeekPreview", "description")}>{preview.description}</p>
            </Reveal>

            <div className={styles.products}>
              {preview.products.map((product, index) => (
                <Reveal className={styles.product} delay={Math.min(index * 0.06, 0.3)} key={product._key}>
                  <div className={styles.imageFrame} data-sanity={sanityDataAttribute(preview._id, "nextWeekPreview", `products[_key=="${product._key}"].image`)}>
                    <Image
                      alt={product.name}
                      fill
                      placeholder={product.image.lqip ? "blur" : "empty"}
                      blurDataURL={product.image.lqip ? stegaClean(product.image.lqip) : undefined}
                      sizes="(max-width: 520px) 38vw, (max-width: 900px) 24vw, 150px"
                      src={stegaClean(product.image.src)}
                    />
                  </div>
                  <div className={styles.productCopy} data-sanity={sanityDataAttribute(preview._id, "nextWeekPreview", `products[_key=="${product._key}"]`)}>
                    {product.label && <span className={styles.label}>{product.label}</span>}
                    <h3>{product.name}</h3>
                    {product.additionalText && <p>{product.additionalText}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal className={styles.wish} delay={0.12}>
            <span className={styles.wishTwig} aria-hidden="true"><i /><i /></span>
            <div className={styles.wishInner}>
              <h3>Du vermisst etwas?</h3>
              <p>Sag uns, was du dir für nächste Woche wünschst – wir freuen uns über deine Anregungen!</p>
              <ProductWishTrigger className={styles.wishButton}>
                <span>Wunsch mitteilen</span><span aria-hidden="true">→</span>
              </ProductWishTrigger>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
