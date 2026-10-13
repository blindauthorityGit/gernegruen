import type {AssortmentSectionData} from '@/components/sections/AssortmentSection';

// Original Figma content, used only before the CMS section is configured.
export const assortmentFallback: AssortmentSectionData = {
  id: 'figma-assortment',
  topline: 'Diese Woche bei uns - 7. - 12. September',
  heading: 'Gerade frisch, gerade besonders',
  description: 'Aktuelles, Aktionen und Highlights\naus unserem Laden',
  callout: 'KW 38 - KW 39',
  cta: {label: 'alle Aktionen ansehen', href: '/news-aktionen'},
  cards: [
    {
      _key: 'produce', title: 'Obst & Gemüse', marker: 'leaf',
      image: {src: '/graphics/assortment-fruit-vegetables.png', alt: 'Frische Auswahl an Obst und Gemüse'},
      entries: [
        'Strauchtomaten', 'Karotten', 'Erdbeeren', 'Kopfsalat', 'Himbeeren', 'Äpfel',
        'Heidelbeeren', 'Kürbis', 'Brokkoli', 'Radieschen', 'Petersilie', 'Zucchini',
      ].map((title, i) => ({_key: `produce-${i}`, title})),
      cta: {label: 'Wochenauswahl ansehen', href: '/sortiment#obst-gemuese'},
    },
    {
      _key: 'bakery', title: 'Brot & Kuchen', marker: 'bread',
      image: {src: '/graphics/assortment-bakery.png', alt: 'Auswahl an Brot, Brötchen und süßem Gebäck'},
      entries: [{_key: 'bread', title: 'Brot der Woche', description: 'Kürbiskern-Karotten-Brot'}, {_key: 'cake', title: 'Kuchen der Woche', description: 'Dinkel-Schoko-Heidelbeer-Kuchen'}],
      note: 'Eine Auswahl weiterer Backwaren findest du täglich bei uns im Laden.',
      cta: {label: 'Zur Produktliste', href: '/sortiment#brot-kuchen'},
    },
    {
      _key: 'promotions', title: 'Aktionen', marker: 'promotion',
      image: {src: '/graphics/assortment-promotions.png', alt: 'Getränke mit Gurke und Kräutern'},
      intro: 'Aktuelle Aktionen auf diverse Produkte',
      cta: {label: 'Alle Aktionen ansehen', href: '/news-aktionen'},
    },
  ],
};

