/* =========================================
   ALBERTO WATCH COMPANY - CLOCK DATA
   Every clock shown on clocks.html lives in this one file.

   Each row:  [ name, category, price (USD), image name, description, size, material ]

   - Image path = folder + image name + extension.
     The 24 pictures are images/clock/clock1 ... clock24 (see "folder" and "extension").
   - category: Classic | Modern | Vintage | Everyday  (these make the filter buttons)
   - The names, prices and descriptions below are SAMPLE text. Change them freely.
========================================= */
window.ALBERTO_CLOCKS = {
  prefix: "c",                    // ids become c01, c02, ... (used by cart and wishlist)
  folder: "images/clockImages/",
  extension: "jpg",               // if a picture is not found, png / jpeg / webp are tried too
  brand: "Alberto",
  items: [
    // ---- Classic ----
    ["Heritage Roman Wall Clock", "Classic", 189, "clock1",  "Roman numerals on a cream dial, framed in polished brass. A quiet centrepiece for any living room.", "40 cm", "Brass & glass"],
    ["Regent Brass Clock",        "Classic", 229, "clock2",  "Slim gold hands and a deep brass rim. Understated elegance that suits formal and relaxed rooms alike.", "38 cm", "Solid brass"],
    ["Windsor Pendulum Clock",    "Classic", 349, "clock3",  "A swinging pendulum below a traditional dial. Gentle movement that fills a hallway with character.", "62 cm", "Walnut & brass"],
    ["Oxford Walnut Clock",       "Classic", 205, "clock4",  "Warm walnut frame with fine black numerals. Made to sit beside a bookshelf or a reading chair.", "36 cm", "Walnut wood"],
    ["Sovereign Gold Clock",      "Classic", 279, "clock5",  "A gold-finished case with a sunray dial that catches the light across the room.", "42 cm", "Gold-finish steel"],
    ["Chateau Ivory Clock",       "Classic", 165, "clock6",  "Soft ivory face with slender hands. Inspired by the clocks of old French drawing rooms.", "34 cm", "Painted metal"],

    // ---- Modern ----
    ["Minimal Slate Clock",       "Modern",  119, "clock7",  "No numerals, just clean lines on a slate-grey face. Calm and quietly confident.", "30 cm", "Slate & steel"],
    ["Aero Steel Clock",          "Modern",  149, "clock8",  "Brushed steel with a sweeping second hand. A sharp, precise look for modern interiors.", "35 cm", "Brushed steel"],
    ["Orbit Matte Black Clock",   "Modern",  135, "clock9",  "A matte black ring with thin gold markers. Light, graphic and easy to place.", "32 cm", "Powder-coated metal"],
    ["Halo Ring Clock",           "Modern",  169, "clock10", "An open ring design with floating hands. Lets the wall show through the dial.", "45 cm", "Aluminium"],
    ["Linear Aluminium Clock",    "Modern",  129, "clock11", "Thin linear markers and an ultra-slim case. Designed to disappear into a modern room.", "33 cm", "Aluminium"],
    ["Nordic White Clock",        "Modern",   99, "clock12", "A bright white face with soft wooden accents. Fresh, simple and easy to live with.", "30 cm", "Wood & metal"],

    // ---- Vintage ----
    ["Station Master Clock",      "Vintage", 259, "clock13", "Inspired by old railway platforms. Bold numerals and a pure white enamel dial.", "45 cm", "Enamel & iron"],
    ["Railway Ledger Clock",      "Vintage", 215, "clock14", "A weathered black frame with brass details. Brings a little station-house history home.", "40 cm", "Iron & brass"],
    ["Gentleman's Mantel Clock",  "Vintage", 239, "clock15", "A compact mantel clock with a warm wooden case and a soft, steady tick.", "28 cm", "Mahogany wood"],
    ["Atelier Brass Clock",       "Vintage", 199, "clock16", "Aged brass with an antique finish. Looks right at home in a studio or study.", "36 cm", "Antique brass"],
    ["Parlour Wall Clock",        "Vintage", 185, "clock17", "A round parlour clock with a glass front and slender black hands. Simple and lasting.", "38 cm", "Wood & glass"],
    ["Archive Enamel Clock",      "Vintage", 175, "clock18", "A glossy enamel dial with bold black numerals, in the style of old schoolhouse clocks.", "34 cm", "Enamel steel"],

    // ---- Everyday ----
    ["Kitchen Companion Clock",   "Everyday",  59, "clock19", "A bright, easy-to-read clock that keeps mornings on schedule.", "28 cm", "Painted metal"],
    ["Studio Desk Clock",         "Everyday",  49, "clock20", "A small clock for the desk or shelf. Neat, readable and quietly stylish.", "15 cm", "Metal & glass"],
    ["Morning Light Clock",       "Everyday",  69, "clock21", "A soft, pale dial that feels calm at the start of the day.", "30 cm", "Wood & glass"],
    ["Hallway Round Clock",       "Everyday",  79, "clock22", "Large, clear numerals for a busy entrance. Easy to read from across the room.", "40 cm", "Metal"],
    ["Bedside Quiet Clock",       "Everyday",  45, "clock23", "A silent sweep movement, so nothing ticks while you sleep.", "18 cm", "Wood & metal"],
    ["Family Room Clock",         "Everyday",  89, "clock24", "A friendly, generous face made for shared spaces and everyday life.", "42 cm", "Wood"]
  ]
};