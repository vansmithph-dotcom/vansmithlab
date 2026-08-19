# Screen graphics — the image as interface

*On screen an image must not only show but respond: it is a control.*

## Editorial thesis

Screen graphics matter because the image here has state: it responds to the cursor, window size, colour theme, and user settings.

## Reader question

How does designing a screen image differ from designing a printed one?

## Short answer

A printed image has one final appearance; a screen image has many states, and what is designed is the rule generating them rather than a single picture.

## 1. Definition and boundaries

Screen graphics are images existing in an interactive environment with variable display conditions. What defines them is not the carrier but the presence of states.

## 2. The pixel as unit and as fiction

A logical pixel has long ceased to correspond to a physical one: devices render several physical dots per logical unit. Design proceeds in abstract units rather than in screen dots.

## 3. Screen density

The same graphic must work at different densities. A raster image requires several variants while a vector scales itself — hence the practical dominance of vector in interfaces.

## 4. Vector and raster

A vector describes a form as a set of curves and is therefore size-independent; a raster describes a result. The choice between them is determined not by quality but by what is depicted.

## 5. Markup as image

A vector format on the web is part of the document and is therefore available to styling and scripts. The image here stops being an attachment and becomes a structural element.

## 6. Element states

A button exists in at least five states: default, hover, focus, active, and disabled. What is designed is the set, and omitting any state is a defect.

## 7. Focus as a mandatory state

A visible focus ring is required by anyone navigating with a keyboard. Removing it for visual cleanliness is the commonest accessibility error in screen graphics.

## 8. No hover on touch

On touch devices the hover state does not exist. An interface in which meaning is revealed on hover simply does not work on a phone.

## 9. Touch target size

The minimum size of an interactive area is set by a finger rather than a cursor. It is a physical constraint establishing the lower bound of interface density.

## 10. Responsiveness as rule, not layout

What is designed is behaviour under changing width, not a set of fixed layouts. A breakpoint is chosen by content rather than by popular device sizes.

## 11. Dark theme as a second set

A dark theme is not an inversion of a light one: shadows, saturation, and stroke weight all require revision. It is a second complete set of decisions.

## 12. Saturation in dark themes

Bright saturated colours on a dark ground produce halation and fatigue. A dark-theme palette is usually more muted, and this is a technical requirement rather than a preference.

## 13. Respecting user settings

The system reports preferences: theme, reduced motion, increased contrast, font size. Ignoring these signals is an error rather than a stylistic decision.

## 14. Font scaling

A user is entitled to enlarge text, and a layout must survive it. A layout that breaks on enlargement fails a basic requirement.

## 15. Font rasterisation

On-screen rendering of a glyph depends on the system, and one typeface looks different across platforms. Full control over the appearance of screen text is unattainable.

## 16. Variable fonts

A single file containing a continuous range of weights reduces payload and allows type to be tuned to size and density. It is a rare case in which quality and performance improve together.

## 17. Image weight as a design constraint

Every kilobyte is paid for in load time. A decision about picture quality is simultaneously a decision about whether a user will see it.

## 18. Format as compromise

Contemporary compression formats give lower weight at equal quality but require a fallback. Choosing a format is an engineering rather than a visual decision.

## 19. Layout shift on load

An image without declared proportions displaces content as it appears. This is a measurable defect that directly degrades page assessment.

## 20. The image as a link

On screen a picture is sometimes a control, and then the requirements for an element apply: state, accessibility, target size. Confusing decorative and interactive images muddles an interface.

## 21. Alternative text

An image carrying meaning must have a text description; a decorative one must not. Distinguishing the two cases is editorial work.

## 22. First turn: the screen became variable

The arrival of many sizes and densities abolished the fixed layout. Design moved from appearance to rule.

## 23. Second turn: component instead of page

Interfaces came to be assembled from reusable elements with described behaviour. The unit of design became the component rather than the screen.

## 24. Third turn: the user gained a vote

System settings for theme, motion, and contrast made some decisions the user’s. The designer specifies a range rather than a single version.

## 25. What is usually misunderstood

The error is designing a screen as a page. A page has one appearance, a screen has many states, and a layout without described states is not finished work.

## 26. Counterargument

The objection is that accounting for every state and setting makes work colourless: attempting to work everywhere yields a result that works nowhere well.

## 27. Where the counterargument holds

It holds for promotional pages and authored projects with a known audience. Narrowing conditions there is a legitimate decision.

## 28. Where it fails

It fails for mass-use products. Ignoring accessibility settings there is not a stylistic choice and in many jurisdictions is unlawful.

## 29. Link to design systems

Describing states and tokens is precisely what makes screen graphics transmissible. Without it, work is not reproducible by another team.

## 30. How to read the subject today

Test work in awkward conditions rather than ideal ones: enlarged type, dark theme, keyboard navigation, slow connection. There it becomes visible what was designed and what was merely drawn.

## Sources

- [W3C — CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/)
- [International Color Consortium](https://www.color.org/)
- [Adobe — Nondestructive editing in Photoshop](https://helpx.adobe.com/photoshop/using/nondestructive-editing.html)
- [Computer History Museum — Make Software: Photoshop](https://www.computerhistory.org/makesoftware/exhibit/photoshop/)
