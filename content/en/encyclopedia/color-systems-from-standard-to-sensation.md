# Colour systems — from standard to sensation

*Colour as sensation and colour as number are linked by a chain of agreements, every link of which can be broken.*

## Editorial thesis

A colour system matters as an agreement about what counts as the same colour: without such an agreement colour can neither be transmitted nor verified.

## Reader question

Why does the same file look different on two screens and in print?

## Short answer

Because the numbers in a file describe a colour only together with a device profile; without one they are an instruction rather than a value.

## 1. Definition and boundaries

A colour system is a way of putting a set of numbers into correspondence with a colour sensation. Systems are many because the tasks differ: to measure, transmit, reproduce, or name.

## 2. Colour as sensation, not property

Colour does not belong to an object: it arises in the interaction of illumination, surface, and visual system. Any system is a model of that interaction rather than a description of a thing.

## 3. Additive and subtractive mixing

Light adds, ink subtracts. A screen emits and therefore mixes additively, print reflects and therefore mixes subtractively. Hence the mismatch between the two worlds.

## 4. Three channels as physiology

A three-component description of colour follows from the structure of the retina rather than from the properties of light. It is a model of the observer, fixed as an engineering agreement.

## 5. The standard observer

Contemporary colorimetry rests on an averaged model of human vision established by measurement. All subsequent computation depends on that assumption.

## 6. Device-dependent values

Numbers of the form "one hundred per cent red" describe an instruction to a device, not a colour. The same instruction on two screens gives different results.

## 7. The profile as translator

A profile links a device’s numbers to a device-independent space. Without a profile a file is not portable, and all contemporary colour work rests on this mechanism.

## 8. Gamut

Every device reproduces a limited subset of visible colours. A saturated colour available on screen is frequently unattainable in print, and the converse also holds.

## 9. Rendering intents

In transfer, out-of-gamut colours are brought inside: either preserving relative relationships or preserving the accuracy of individual shades. The choice is an editorial decision.

## 10. Metamerism

Two samples may match under one illuminant and diverge under another. It is the principal practical problem in matching materials and the reason standard viewing conditions exist.

## 11. Viewing conditions

Colour is assessed under specified illumination against a neutral surround. Without this, comparing samples is meaningless — the surround shifts perception more than most expect.

## 12. Simultaneous contrast

The same colour looks different against different grounds. This is a property of perception rather than of measurement, and it explains divergence between instrumental and visual assessment.

## 13. Colour naming systems

Spot-colour catalogues solve a different problem: not measuring but naming and repeating. Their value is that a number corresponds to a physical sample.

## 14. The swatch book as physical standard

A printed sample fades and therefore has a shelf life. A colour standard is a consumable, which is regularly forgotten.

## 15. Colour as brand property

Tying a specific shade to a brand requires reproducing it on every carrier: print, screen, textile, plastic. This is a problem of reconciliation rather than of choice.

## 16. Perceptually uniform spaces

Ordinary colour coordinates do not correspond to perceived difference. Spaces exist that are built so equal numerical distances mean equal visual differences.

## 17. Why this matters for interfaces

A uniform space allows scales to be built in which steps are genuinely equal. Without it a palette looks uneven although the numbers change uniformly.

## 18. Contrast as a measurable requirement

Accessibility requirements set a minimum luminance ratio between text and ground. It is the only part of colour work with a verifiable numerical criterion.

## 19. Wide gamut on screen

Contemporary displays exceed the earlier standard, and files without a stated space render oversaturated. Declaring a profile has become mandatory rather than advisable.

## 20. High dynamic range

An image with extended luminance range describes light rather than reflectance and therefore requires different preparation. Earlier grading habits do not work here.

## 21. New colour notations on the web

The current specification allows colour to be stated directly in perceptually uniform and wide-gamut spaces. It is the first substantial expansion of web colour capability in decades.

## 22. First turn: colour became measurable

The advent of colorimetry turned colour from a judgement of taste into a quantity that could be argued about with instruments. It is the precondition of any industrial consistency.

## 23. Second turn: colour management became a system

Profiles and their automatic application made portability possible without manual conversion. Complexity moved from the operator’s head into infrastructure.

## 24. Third turn: the screen overtook print

Displays began reproducing colours unattainable on paper. Print became the limiting link for the first time, and the logic of preparing materials changed.

## 25. What is usually misunderstood

The error is to think the numbers in a file specify a colour. They do so only together with a profile; a file without one has no defined colour at all.

## 26. Counterargument

The objection is that all this precision is excessive: a viewer does not compare an image with a standard and does not notice deviations.

## 27. Where the counterargument holds

It holds for a single image without comparison. Absolute accuracy is genuinely unnecessary there, and approximate agreement suffices.

## 28. Where it fails

It fails when colour is an identity or a specification: a brand shade, a fabric sample, a catalogue entry. There a discrepancy means a returned order.

## 29. Link to materials

The same colour on matt and gloss surfaces is perceived differently, because the proportion of specular reflection differs. Colour cannot be discussed apart from texture.

## 30. How to read the subject today

Ask not for a colour number but for the space and the viewing conditions. A number without those two pieces of information is not a claim that can be checked.

## Sources

- [International Color Consortium](https://www.color.org/)
- [W3C — CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/)
- [Adobe — Understanding colour management](https://helpx.adobe.com/photoshop/using/understanding-color-management.html)
- [MoMA — Collection](https://www.moma.org/collection/)
