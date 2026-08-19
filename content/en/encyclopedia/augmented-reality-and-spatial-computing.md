# Augmented reality and spatial computing

*The image stops being a frame and becomes a layer anchored to the real geometry of a room.*

## Editorial thesis

The technology matters not as a screen near the face but as the first case in which an image had to know the shape of a room in order to exist at all.

## Reader question

What changes in design when an image must account for the real geometry and lighting of the place where it is shown?

## Short answer

Composition stops being authorial: the frame is set by the room and the viewer’s position, and the author designs an object’s rules of behaviour rather than a picture.

## 1. Definition and boundaries

Augmented reality places a synthetic object into an image of real space while preserving its anchoring to that space’s geometry. Spatial computing is the broader term: it describes a system for which a room is a data structure.

## 2. Difference from virtual reality

Virtual reality replaces the surroundings entirely and therefore need not know them. Augmented reality must: it requires a map of surfaces, lighting, and viewer position, or the object will not sit in place.

## 3. Origins and prehistory

The line runs from head-mounted displays and laboratory head-tracking systems. For a long time the problem was military and aeronautical, where aligning a symbol with a real object solves a practical task.

## 4. Why the subject became mass

The decisive factor was not the display but the sensor: once camera, gyroscope, and sufficient compute entered consumer devices, the problem no longer required a laboratory.

## 5. Scene understanding

The system must recognise planes, boundaries, and obstacles before placing an object. This is a separate and difficult problem: an error of a few centimetres in locating the floor immediately destroys plausibility.

## 6. Positional tracking

The device continuously computes its own position from visible features and sensor data. Accumulated drift shows up as an object slowly sliding away — a characteristic defect that immediately reveals the technology.

## 7. Occlusion as a condition of plausibility

A virtual object must be hidden by real objects that come in front of it. Without correct occlusion it reads as a sticker on the image rather than as a thing present in the room.

## 8. Lighting as reconciliation

A synthetic object must take the room’s light: direction, temperature, and intensity. Estimating illumination from a camera remains approximate, and this is where credibility most often breaks.

## 9. Scale as a verifiable quantity

Unlike a screen image, scale here is absolute: an object has a size in metres and is compared with furniture. A scale error is not a stylistic decision; it reads as a fault.

## 10. Latency and bodily response

Permissible latency is measured in milliseconds, because a mismatch with head movement causes physical discomfort. It is a rare case of an engineering requirement set by physiology.

## 11. Composition without a frame

The author loses control of the frame: the viewer chooses viewpoint and distance. What is designed is not an image but an object that must survive viewing from any side.

## 12. Inheritance from scenography

The task is closer to exhibition than to screen work: visitor route, distance, and what is seen first all matter. Museum display experience transfers here more accurately than layout experience.

## 13. Interface without controls

Interaction is built on gaze, gesture, and voice rather than on a button. The absence of physical feedback makes confirmation of an action a design problem in its own right.

## 14. Fatigue as a constraint

Device weight, visual load, and the need to hold hands raised limit a session. This imposes hard limits on scenarios that a screen does not have.

## 15. Retail application

Placing furniture in an interior and trying footwear on the foot are the most justified cases: they solve a specific purchasing problem in which scale and colour cannot be judged from a photograph.

## 16. Production application

Overlaying a drawing on real construction on site gives measurable benefit: a discrepancy is visible at once. Here the technology works as an instrument of inspection rather than as an image.

## 17. Exhibition application

In a museum a layer can show an object’s lost state over its surviving one. The device has documentary value but demands a clear mark of where evidence ends and reconstruction begins.

## 18. Material in an augmented scene

Synthetic surfaces read convincingly only with correct reflection. Metal and glass expose an error immediately, whereas matt materials forgive lighting inaccuracy.

## 19. Photography as by-product

Most people see such scenes not through a device but through someone else’s photograph or video. This restores the frame and turns the result into an ordinary image with ordinary rules.

## 20. Privacy of the room

Operation requires continuous scanning of a dwelling, producing a detailed map of private space. This differs substantially from a camera: what is captured is not a frame but a geometry.

## 21. Standards and interoperability

Scenes are described by interchange formats inheriting the logic of three-dimensional production. Interoperability determines whether work survives a change of device, and therefore matters more than platform choice.

## 22. The production chain

Model, material, light, and behaviour logic are prepared with the same tools as in film. The only difference is at the end of the chain: the result is computed on the device in real time.

## 23. The compute budget

A standalone device is limited by heat and battery, so quality is bounded not by taste but by a frame budget. Design here is closer to engineering calculation than to visual choice.

## 24. What is usually misunderstood

The main error is treating the problem as graphical. The principal difficulty lies in scene understanding and tracking — that is, in computer vision rather than in model quality.

## 25. Counterargument

The objection is justified: over three decades the technology has repeatedly been declared mass-market and has each time remained niche. No durable consumer scenario has yet appeared.

## 26. Where the counterargument holds

It holds for entertainment use, where an advantage over the screen is unproven. Nobody will wear a device for something more conveniently viewed on a phone.

## 27. Where it fails

It fails in industrial tasks where alignment with a real object is mandatory: assembly, maintenance, surgery, navigation. There the benefit is measurable and demonstrated.

## 28. Impact on adjacent fields

The requirement to understand a room pushed forward scanning and scene reconstruction. These methods proved more useful than augmented reality itself and migrated into film and mapping.

## 29. Current state

The technology exists simultaneously as a professional tool with proven benefit and as a consumer product with an undefined scenario. These two states should be discussed separately.

## 30. What to check

When assessing a project, ask about occlusion, drift, and lighting estimation. These three parameters determine whether an object reads as present or as overlaid.

## 31. How to read the subject today

Separate demonstration from operation. A promotional clip is shot in a prepared room with ideal light; the technology’s working value is tested in an ordinary room under ordinary lighting.

## Sources

- [Apple — visionOS for developers](https://developer.apple.com/visionos/)
- [Apple — ARKit in visionOS](https://developer.apple.com/documentation/arkit/arkit-in-visionos)
- [Apple Support — visionOS guide](https://support.apple.com/guide/apple-vision-pro/welcome/visionos)
- [Unity — Documentation](https://docs.unity.com/en-us)
- [OpenUSD — Introduction](https://openusd.org/release/intro.html)
