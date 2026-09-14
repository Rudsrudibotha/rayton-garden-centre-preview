# Connected photo journey — design and QA

## Direction and reference
Forest and chartreuse botanical composition: three staggered original plant posters linked by an original hand-drawn stem with leaves.

The Adorable Bekkies Academy repository was inspected read-only as the user's storytelling benchmark. Reused ideas are continuous photo sequencing, asymmetric composition, meaningful captions, progressive connectors and once-only visibility. No school assets, code files or child-themed graphics were copied.

An image-generated section concept was produced before implementation: `exec-95e8956b-15cd-4a28-a9c8-1751e8e5cfe6.png` (session generated_images/01a09fa4-b649-7500-8e96-50097d4c56bf). It is a layout reference only and is not shipped as business imagery.

## Comparison ledger
| Area | Final result |
|---|---|
| Composition | Retains the distinct hero, palette and typography; replaces viewport blocks with the concept's staggered connected photo journey. |
| Photographs | Actual downloaded business originals replace every generated example. Calathea Burle Marx, Plectranthus Lemon and Lime, and Chrysanthemum originals retain their published promotional text. No current-stock claim is made. The ornamental Plectranthus is not described as an edible herb. |
| Connectors | Original inline SVG, decorative and hidden from assistive technology. Paths complete on fast jumps and never erase on reverse scroll. |
| Copy | Editorial captions describe actual subjects. No invented process, owner history, prices, statistics or testimonials. |
| Phone adaptation | Compact alternating photographs and growing caption rows with local connector segments; no horizontal overflow. |
| Intentional departures | Generated logos, invented photographs, unsupported labels and decorative fake browser chrome were omitted. Original source aspect ratios and meaningful caption space take priority. |

## Verification — 14 September 2026
- Rendered in Chrome at 1280 × 720 and 390 × 844, including all photo chapters, section navigation and full-photo viewing.
- Measured native forward and reverse scrolling: a 360px scroll moves the scene exactly 360px, without sticky dwell. Direct drift changes immediately; path progress preserves its maximum on reverse scroll.
- Fast section jumps complete paths and reveal skipped images. Mobile photos have no scroll transform; connectors retain the staggered sequence.
- Menu, next/previous photo controls, arrow-key navigation, Escape closing and focus restoration checked. No broken images or horizontal overflow in inspected views; no browser warnings/errors.
- Eight lifecycle checks against each site's actual controller passed: initial off-screen state, zero-size hidden connector, monotonic reverse progress, fast-exit completion, focus reveal, desktop/phone resize and reduced-motion on/off memory.
- Reduced motion was exercised in the controller test harness and checked in CSS; the operating-system preference was not changed during browser QA.
- Saved browser screenshots were visually inspected. Session evidence is in outputs/story-journeys and work/services-journey-qa.json.

## Remaining review
User visual review and business approval are outstanding. This builder did not publish or contact the business during this revision.


### Whole-story skip regression
A direct hero-to-contact jump was found to skip the IntersectionObserver boundary entirely, leaving an unread scene and pending photos. Scheduled frames now batch geometry for all three scenes and still-unseen reveal targets, so nonzero-size content jumped above the viewport completes even without an observer event. Hidden phone/desktop connector variants remain untouched. The exact below-to-above case is covered by the controller regression and rechecked through native browser anchor/End navigation.
