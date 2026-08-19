# ControlNet and controlled generation

*A generative model receives a spatial condition — pose, edge, or depth — and stops being a lottery.*

## Editorial thesis

The method matters because it returned composition to generation: the author again sets where things are, and the model answers only for how they look.

## Reader question

How can a precise composition be given to a generative model when a text description cannot convey it?

## Short answer

Through an additional spatial condition: an edge map, a pose, or a depth map that the model must respect while synthesising.

## 1. Definition and boundaries

The method adds a second branch to a diffusion model, accepting a spatial condition map. Generation obeys that map while retaining freedom in colour, material, and style.

## 2. The problem it solves

A text description specifies position poorly: words struggle to state that an arm is bent at a particular angle. A spatial condition solves what language handles badly.

## 3. Origin

The work was presented in 2023 and quickly became a standard addition to open diffusion models thanks to simple training and high practical return.

## 4. Weight copying as device

The key engineering decision is a trainable copy of part of the original model, connected through layers initialised to zero. This allows a condition to be added without damaging the already-trained model.

## 5. Zero initialisation

The connecting layers begin with zero influence and gradually acquire it. The device protects the original capabilities from destruction during early training steps.

## 6. Types of condition

Edge maps, boundaries, depth, normals, human pose, and segmentation are used in practice. Each type serves a different purpose and requires a separately trained module.

## 7. Pose as the most used condition

A skeletal diagram sets a figure’s position precisely and repeatably. This made the method usable for images of people, where anatomical error is most noticeable.

## 8. Depth as a scene condition

A depth map sets spatial construction while leaving content free. The device suits interiors and architecture, where geometry matters more than a particular object.

## 9. Edges as a product condition

A boundary map preserves an object’s silhouette while environment and lighting change. For product imagery this is the closest case to production use.

## 10. Repeatability as the main consequence

The same condition yields a consistent result across different prompts. This moves generation from the domain of chance into that of a controlled process.

## 11. A return to storyboarding

The device restored the classical working order: composition first, image second. The storyboard again became an input document rather than an explanation.

## 12. Condition strength as a parameter

The condition’s influence is adjustable: strict adherence gives precision, weak adherence gives freedom. Tuning this balance is the principal authorial work.

## 13. Combining several conditions

Pose and depth can be supplied simultaneously, giving control over both figure and scene. Conflicting conditions then produce characteristic distortions.

## 14. Application in fashion

Clothing is transferred onto a given pose with silhouette preserved. The method suits lookbooks and catalogues but reproduces the behaviour of a specific fabric poorly.

## 15. Application in architecture

A rough three-dimensional scene becomes a finished image with geometry preserved. This speeds visualisation at early stages when material accuracy is unnecessary.

## 16. Application in product photography

One captured object is placed into many environments without reshooting. The economic effect here is most obvious and already realised in retail.

## 17. Accuracy limits

A condition sets position but does not guarantee detail: a logotype, lettering, and small hardware reproduce unreliably. For exact reproduction of a product the method is unsuitable.

## 18. The material problem

The model convincingly synthesises a plausible surface but not a specific material with its specification. For a catalogue where fabric must match an article number this is a disqualifying limitation.

## 19. Relation to compositing

The method occupies an intermediate position between shooting and assembly: composition is given, content synthesised. This is a new position in the production chain.

## 20. Training data provenance

The module is trained on pairs of an image and a condition extracted from it, but the base model is trained on a third-party corpus. The method does not resolve the question of rights to that corpus.

## 21. Labelling the result

The image remains synthesised regardless of the condition’s precision. A record of the production method is as necessary as for unconstrained generation.

## 22. What is usually misunderstood

The error is to think control removes the question of veracity. Precise composition makes an image more convincing but does not turn it into evidence.

## 23. Counterargument

The objection is that at this level of control it is simpler to render or shoot the scene by ordinary means and obtain full accuracy.

## 24. Where the counterargument holds

It holds when a specific object with exact detail is required. Shooting remains cheaper and more reliable than repeated attempts to obtain a required detail.

## 25. Where it fails

It fails at the exploratory stage, when twenty variants of lighting and setting must be seen quickly. There speed outweighs accuracy.

## 26. Impact on the profession

Value shifts to whoever can construct the condition: set a pose, define depth, plan a composition. These are classical art-direction skills rather than prompt work.

## 27. Link to storyboarding and art direction

The method restored the value of documents preceding the image. Storyboard and reference diagram again determine the result.

## 28. Development of the approach

Lighter conditioning mechanisms requiring less memory have appeared. The principle remains the same: separate spatial specification from synthesis.

## 29. Current state

Controlled generation has become the norm in professional use, while free text-to-image generation has remained a tool for idea search.

## 30. How to read the subject today

Ask what condition was given and who constructed it. The answer separates authorial work from prompt enumeration and shows where in the chain a decision was made.

## Sources

- [Zhang et al. — Adding Conditional Control to Text-to-Image Diffusion Models (ICCV 2023)](https://openaccess.thecvf.com/content/ICCV2023/html/Zhang_Adding_Conditional_Control_to_Text-to-Image_Diffusion_Models_ICCV_2023_paper.html)
- [arXiv — Adding Conditional Control to Text-to-Image Diffusion Models](https://arxiv.org/abs/2302.05543)
- [GitHub — lllyasviel/ControlNet](https://github.com/lllyasviel/ControlNet)
- [OpenAI — Advancing content provenance](https://openai.com/index/advancing-content-provenance/)
