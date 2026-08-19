# Digital twin

*A model of an object linked to it by a data stream and updated together with the original.*

## Editorial thesis

The digital twin matters because it introduces feedback into design: a model stops being an intention and becomes a report on the state of an existing thing.

## Reader question

How does a model receiving data from an object differ from an ordinary three-dimensional model?

## Short answer

By a live link: without a data stream it is merely a model. A twin is defined not by geometric accuracy but by updating.

## 1. Definition and boundaries

A digital twin is a model of a particular instance, linked to it by a stream of state data. The key word is "particular": a twin describes not a product type but an individual thing with its history.

## 2. Difference from model and simulation

An ordinary model describes an intention, a simulation tests a hypothesis, a twin reflects a fact. The difference lies in the direction of the link: in a twin data flows from object to model.

## 3. Origins in aerospace

The practice of maintaining an exact model of a particular vehicle on the ground grew from the need to diagnose faults at a distance. The term was established later than the practice.

## 4. Three mandatory elements

A twin requires an object, a model, and a channel between them. The absence of any one turns the construction into ordinary visualisation with an attractive name.

## 5. Sensors as a condition

A twin’s quality is determined by what is measured. A building model without temperature and occupancy sensors is not a twin, however accurate its geometry.

## 6. Update frequency

Different tasks require different frequencies: from milliseconds for a machine tool to months for a building. Choosing a frequency is a design decision determining the cost of the whole system.

## 7. Application in manufacturing

A twin of a machine or a line allows wear to be predicted and maintenance planned by actual condition rather than by schedule. The economic effect here is measurable.

## 8. Application in architecture

A building twin joins the design model with operational data: energy use, occupancy, microclimate. This moves a building from object to process.

## 9. Application in retail

A store twin combines layout with data on customer movement. A route stops being a designer’s assumption and becomes a measured quantity.

## 10. Application in fashion

A garment twin holds pattern, composition, supplier, and repair history. This is the technical basis for the product passport regulators are beginning to require.

## 11. The product passport as regulatory requirement

Traceability and repairability requirements are turning twin maintenance from voluntary practice into obligation. This changes the economics of the approach.

## 12. Link to building information modelling

Building information modelling supplied a ready data structure. A twin adds a temporal dimension to it: not as designed, but as it is now.

## 13. Divergence of model and object

The chief practical problem is drift: what was built differs from what was designed, and what is operated from what was built. Without regular reconciliation a twin quietly becomes a falsehood.

## 14. Scanning as a means of reconciliation

Laser scanning and photogrammetry are used to bring a model into line with actual state. The operation is expensive and is therefore performed less often than it should be.

## 15. The data ownership problem

Data about an object’s operation belongs to several parties: manufacturer, owner, service provider. Legal uncertainty slows adoption more than technical limitations do.

## 16. Privacy

A twin of a space records the behaviour of people in it. This makes the system an instrument of surveillance regardless of its original purpose.

## 17. Interchange standards

A twin’s durability is determined by format: a vendor’s proprietary format ties the owner to that vendor for the object’s entire service life, which may span decades.

## 18. Prediction as the goal

Value arises not from observation but from prediction: when it will fail, where it overheats, how much life remains. A twin without a predictive model is an expensive monitor.

## 19. The role of machine learning

Models trained on operating history give forecasts where physical simulation is too expensive. This complements rather than replaces engineering calculation.

## 20. Visualisation as interface

A three-dimensional presentation aids understanding but is not the essence. Many working twins have no visualisation at all and exist as tables and streams.

## 21. Cost of adoption

The main expense falls not on the model but on sensors, connectivity, and data maintenance. Projects most often stall at this stage.

## 22. What is usually misunderstood

A common error is to call any detailed model a twin. Without a data stream and a link to a particular instance it is visualisation, and the substitution of terms obstructs project assessment.

## 23. Counterargument

The objection is justified: in many cases sensors and reporting suffice, while a three-dimensional model adds cost without adding decisions.

## 24. Where the counterargument holds

It holds for simple objects with few parameters. There a table of indicators is more informative than a model and an order of magnitude cheaper.

## 25. Where it fails

It fails for spatial problems: heat propagation, pedestrian flow, structural clash. Such questions cannot even be posed without geometry.

## 26. A twin’s lifespan

A twin should outlive its object to be useful at decommissioning and recycling. This is an archival requirement that is almost never provided for.

## 27. Link to sustainability

Data on actual consumption and wear gives a verifiable basis for environmental claims. It is one of the few applications where a claim can be supported by a figure.

## 28. Impact on the profession

A designer receives feedback on how their decisions perform in operation. Historically this link was absent, and its appearance changes the nature of professional responsibility.

## 29. Current state

The term is used far more widely than the practice: most declared twins are models without a live link. The gap between word and implementation remains large.

## 30. How to read the subject today

Ask one question: what is measured, and how often. If there is no answer, you are looking at a model rather than a twin, whatever the project is called.

## Sources

- [OpenUSD — Introduction](https://openusd.org/release/intro.html)
- [AOUSD — What is OpenUSD](https://aousd.org/blog/explainer-series-what-is-openusd/)
- [Unity — Documentation](https://docs.unity.com/en-us)
- [Epic Games — Unreal Engine documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/designing-visuals-rendering-and-graphics-with-unreal-engine)
