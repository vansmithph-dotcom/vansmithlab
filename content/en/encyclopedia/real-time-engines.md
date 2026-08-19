# Real-time engines

*The image is computed in milliseconds, which moves the decision out of post-production and back onto the set.*

## Editorial thesis

A real-time engine matters not for speed but because it makes the result discussable while work happens: the image stops being a report on a decision and becomes an instrument for making one.

## Reader question

What changes in production when a final image is available immediately rather than after hours of computation?

## Short answer

The distribution of decisions in time changes: what used to be agreed from description is now agreed from a picture, and the number of iterations rises sharply.

## 1. Definition and boundaries

A real-time engine computes an image within a time sufficient for interactive response — usually under twenty milliseconds per frame. It is the time constraint, not a quality one, that determines its whole architecture.

## 2. Difference from offline rendering

Offline rendering can compute a frame for hours in pursuit of physical accuracy. Real time works the other way: quality is fitted to a fixed time budget.

## 3. Origins in the games industry

The technology grew out of games, where interactivity is a mandatory condition. It was the games market that funded three decades of development whose results other industries now use.

## 4. Rasterisation as compromise

The classical method quickly determines which pixels a triangle covers but describes light behaviour poorly. Speed is achieved by declining to model interreflection.

## 5. Precomputed lighting

For many years light was computed in advance and baked into textures. This delivered quality at the cost of immobility: a scene could not be changed without recomputation.

## 6. Real-time ray tracing

Hardware-accelerated tracing made it possible to compute reflections and shadows physically correctly during operation. This removed the principal visual difference from offline rendering.

## 7. Dynamic global illumination

Contemporary systems recompute indirect light as a scene changes. Being able to move a source and see the result immediately changed the working method of a lighting artist.

## 8. Geometry detail management

Automatic model simplification by distance removed the manual preparation of detail levels. Artists gained the ability to use dense source geometry without hand optimisation.

## 9. The frame budget as a design constraint

Every effect is paid for in milliseconds, and the total is fixed. This makes the work resemble a cost sheet: adding one decision requires giving up another.

## 10. Iteration as the main benefit

The principal value is not frame speed but the number of variants tested. Seeing twenty versions instead of two changes the quality of the final decision.

## 11. Agreement on set

When an image is visible immediately, director, cinematographer, and designer decide together and at once. This shortens an approval chain usually stretched over weeks.

## 12. Architectural visualisation

Walking through a project instead of viewing static angles changed the character of discussion with a client. Route and scale are discussed rather than a chosen picture.

## 13. Product visualisation

A configurator with instant response lets a buyer assemble a variant themselves. This moves part of the selection work from salesperson to client.

## 14. Virtual production

Computing a background in real time on an LED wall is the technology’s most conspicuous application in film. It is possible only because the image is computed faster than the camera moves.

## 15. A shared scene instead of files

Collaborative work requires several specialists to edit one scene simultaneously. This led to formats describing a scene as a layered structure rather than as a file.

## 16. Material as a program

Surfaces are described not by a picture but by a graph of operations computed on the device. This makes material parametric: the same metal is tuned for any scene.

## 17. Memory limits

Everything visible in frame must fit into device memory. This constraint determines texture size and geometry density more strictly than any artistic decision.

## 18. Data streaming

Large scenes are loaded as the camera approaches. Making that loading imperceptible is a separate engineering problem determining the sense of a continuous world.

## 19. Temporal accumulation

Many effects accumulate quality over several frames using previous results. Hence the characteristic defect: a trail behind a fast-moving object.

## 20. Upscaling and resolution reconstruction

The image is often computed at low resolution and enlarged algorithmically. This frees budget for other effects and has become standard practice.

## 21. The gap between demo and product

Demonstration scenes are built for a fixed camera path and therefore look better than working ones. Distinguishing these two regimes is essential when assessing any technology.

## 22. Who now decides

Moving decisions onto the set strengthens the role of those present and weakens post-production. This is an organisational consequence of a technical change.

## 23. What is usually misunderstood

The error is to think real time means lower quality. The difference today shows mainly in difficult cases — refraction, hair, volumetric light — rather than in the overall look of a frame.

## 24. Counterargument

The objection is justified: speed encourages quantity of variants over deliberation, and work shifts from decision to enumeration.

## 25. Where the counterargument holds

It holds where iteration replaces defining the problem. Twenty variants without a selection criterion are worse than two with a clear rationale.

## 26. Where it fails

It fails where a decision depends on perceiving the whole: light, atmosphere, editing rhythm. These qualities cannot be judged from a description; they must be seen.

## 27. Impact on adjacent fields

The technology has moved well beyond entertainment: it is used in design, training, simulation, and industrial visualisation. The game engine has become a general-purpose instrument.

## 28. Platform dependence

Work is tied to a specific engine and its licence, creating risk for long-term projects. Portability is secured only by scene interchange formats.

## 29. Current state

The boundary between real time and offline computation has almost dissolved for most tasks. The difference persists in extreme cases and in hardware requirements.

## 30. How to read the subject today

Ask not about frame quality but about how many variants were tested and who was present at the choice. The technology’s value shows in the process rather than in a single image.

## Sources

- [Epic Games — Designing visuals, rendering and graphics](https://dev.epicgames.com/documentation/en-us/unreal-engine/designing-visuals-rendering-and-graphics-with-unreal-engine)
- [Epic Games — Guidelines for optimizing rendering for real time](https://dev.epicgames.com/documentation/unreal-engine/guidelines-for-optimizing-rendering-for-real-time-in-unreal-engine)
- [Unity — Documentation](https://docs.unity.com/en-us)
- [OpenUSD — Introduction](https://openusd.org/release/intro.html)
