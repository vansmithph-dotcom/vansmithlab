# 3D Gaussian splatting

*A scene is represented by millions of translucent blobs instead of surfaces, delivering display speed at high quality.*

## Editorial thesis

The method matters as a return to explicit scene representation after the neural one: quality remained while a hidden function was replaced by a set of objects that can be drawn quickly.

## Reader question

Why did abandoning a neural network in favour of a set of elementary primitives turn out to be a step forward?

## Short answer

Because an explicit representation is drawn directly by the existing graphics pipeline, without marching a ray through a volume or querying a network per pixel.

## 1. Definition and boundaries

A scene is described by a set of three-dimensional Gaussians — translucent ellipsoids, each with its own position, shape, colour, and opacity. An image is produced by projecting and compositing them.

## 2. Origin

The method was proposed in 2023 by a research group in France and almost immediately displaced the preceding approach in applied work thanks to its display speed.

## 3. Difference from a neural field

The preceding method stored a scene in network weights and required a query for every point along a ray. Here the scene is stored explicitly and drawing reduces to sorting and compositing primitives.

## 4. Why it is faster

Projecting an ellipsoid onto a plane is an operation for which graphics hardware has been optimised for decades. The method uses the existing pipeline instead of bypassing it.

## 5. Initialisation from a point cloud

Training begins with the sparse cloud obtained when computing camera positions. Each point becomes an initial primitive that is subsequently refined.

## 6. Adaptive densification

During training primitives are split where detail is lacking and removed where they are unnecessary. Density adapts to the scene automatically rather than being set in advance.

## 7. Anisotropy as the key property

An ellipsoid can be elongated along one axis, allowing thin structures — wires, grass, hair — to be described with few elements. An isotropic point would require an order of magnitude more.

## 8. View-dependent colour

Each primitive’s colour varies with viewing angle, reproducing highlights and reflections. This is inherited from the preceding method and remains a condition of plausibility.

## 9. Compositing order as bottleneck

Translucent elements must be composited in correct depth order. Sorting millions of primitives per frame is the method’s principal computational load.

## 10. Characteristic artefacts

Moving away from captured viewpoints produces elongated streaks and disintegrating edges. The defect indicates directly where capture coverage was insufficient.

## 11. Data volume

A scene occupies substantially more space than a neural representation: millions of primitives with parameters. Compressing such scenes has become a separate line of work.

## 12. Editability as an advantage

An explicit representation is easier to edit: primitives can be selected, moved, or deleted. This is markedly more practical than an opaque network in which objects are not localised.

## 13. The absence of a surface as a limitation

The method yields no geometry in the usual sense, so collision, shadow, and physics computation requires separate mesh extraction. In production this is a significant inconvenience.

## 14. Lighting is fixed

Light is baked into primitive colour at capture time. A scene cannot be relit without additional methods for separating material from illumination.

## 15. Capture requirements

Like its predecessor, the method requires dense viewpoint coverage under constant lighting. Result quality is determined by capture discipline more than by the algorithm.

## 16. Application in documentation

Capturing an interior or an object yields a navigable scene within minutes. For recording the state of a room this is faster and more complete than photography.

## 17. Application in film and advertising

Reconstructed locations serve as background and as a source of illumination. The method is especially convenient for vegetation and complex textures that are expensive to model.

## 18. Application in retail and property

Inspecting a room or a product from an arbitrary viewpoint has become practical. This is the method’s closest case to mass application.

## 19. Dynamic scenes

Extensions describe movement by making parameters time-dependent. Quality is below the static case, and the direction is under active development.

## 20. Pipeline compatibility

The method integrates poorly with existing polygon-oriented tools. Practical use usually requires conversion that loses some quality.

## 21. Documentary status

As with its predecessor, the result is synthesised and contains inferred regions. It documents appearance but is not photographic evidence.

## 22. What is usually misunderstood

The error is to treat the method as a form of photogrammetry. It does not build a surface and solves a different problem: synthesising a view rather than measuring a form.

## 23. Counterargument

The objection is practical: production needs a mesh, and a method that does not supply one remains an intermediate link rather than a final format.

## 24. Where the counterargument holds

It holds for tasks requiring physics, collision, and scene recomposition. There explicit geometry is mandatory.

## 25. Where it fails

It fails for inspection and presentation tasks where only a view is needed. In that class the method surpasses alternatives in the ratio of quality to speed.

## 26. Speed of adoption

Roughly a year passed between publication and appearance in commercial products — an unusually short interval, explained by compatibility with existing hardware.

## 27. Link to graphics history

Representing scenes by points was discussed for decades and considered a dead end. The method showed the old idea works given the right primitive parameterisation.

## 28. Impact on adjacent fields

The approach quickly entered robotics and mapping, where reconstructing surroundings from a camera is the founding task.

## 29. Current state

The method has become a practical standard for novel view synthesis, displacing its predecessor in applied work. Limitations on relighting remain unresolved.

## 30. How to read the subject today

Move away from the captured viewpoints. The method is tested precisely where the camera was not: disintegrating edges show the boundary of reliability.

## Sources

- [INRIA — 3D Gaussian Splatting for Real-Time Radiance Field Rendering](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/)
- [ACM — SIGGRAPH proceedings](https://dl.acm.org/doi/10.1145/3592433)
- [NVlabs — Instant-NGP project page](https://nvlabs.github.io/instant-ngp/)
- [NVIDIA — Instant Neural Graphics Primitives](https://research.nvidia.com/publication/2022-07_instant-neural-graphics-primitives-multiresolution-hash-encoding)
