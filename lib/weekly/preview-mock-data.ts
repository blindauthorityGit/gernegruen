import type {NextWeekPreviewData} from "./preview-types"

export const nextWeekPreviewMock: NextWeekPreviewData = {
  _id: "development-next-week-preview",
  _updatedAt: "",
  title: "Nächste Woche bei uns",
  description:
    "Ab Donnerstag zeigen wir dir, was ab Montag frisch bei uns eintrifft. Hier schon ein kleiner Vorgeschmack – Änderungen vorbehalten.",
  offerWeek: "development-preview",
  isDevelopmentPreview: true,
  products: [
    {_key: "apple", name: "Äpfel", image: {src: "/graphics/weekly-apple.png", width: 250, height: 250}},
    {_key: "radish", name: "Radieschen", image: {src: "/graphics/weekly-radish.png", width: 250, height: 250}},
    {_key: "broccoli", name: "Brokkoli", image: {src: "/graphics/weekly-broccoli.png", width: 420, height: 420}},
    {_key: "herbs", name: "Frische Kräuter", image: {src: "/graphics/weekly-parsley.png", width: 250, height: 250}},
    {_key: "blueberries", name: "Heidelbeeren", image: {src: "/graphics/weekly-blueberries.png", width: 200, height: 200}},
  ],
}
