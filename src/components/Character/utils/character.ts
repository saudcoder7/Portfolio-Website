import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";

// Apply proper skin, clothing, and feature colors to the character meshes
// Matched to Saood Faisal's actual appearance
// Apply proper skin, clothing, and feature colors to the character meshes
// Matched to Saood Faisal's actual appearance from his photo
function applyCharacterColors(character: THREE.Object3D) {
  // Warm golden-tan South Asian skin tone matching Saood's photo
  const skinColor = new THREE.Color(0xd2996c);
  // Rich dark navy blue Nike hoodie matching Saood's photo
  const hoodieColor = new THREE.Color(0x1c2b3e);
  // Jet black hair
  const hairColor = new THREE.Color(0x111114);
  // Dark defined eyebrows
  const eyebrowColor = new THREE.Color(0x0a0a0c);
  // Eye iris dark brown
  const eyeIrisColor = new THREE.Color(0x28180e);
  // Eye white
  const eyeWhiteColor = new THREE.Color(0xf6f6f6);
  // Black jogger pants matching Saood's photo
  const pantsColor = new THREE.Color(0x121316);
  // Clean off-white/cream sneakers matching Saood's photo
  const shoeColor = new THREE.Color(0xf2ede4);
  // Subtle warm grey sole
  const soleColor = new THREE.Color(0xdcd7cd);
  // Keyboard keys
  const keyColor = new THREE.Color(0x242426);
  // Keyboard base
  const keyboardBaseColor = new THREE.Color(0x18181a);
  // Desk
  const deskColor = new THREE.Color(0x22222a);
  // Chair
  const chairColor = new THREE.Color(0x282832);

  character.traverse((child: any) => {
    if (!child.isMesh) return;
    const mesh = child as THREE.Mesh;

    // Clone material so each mesh has its own unique instance (prevents cross-talk)
    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((m) => m.clone());
    } else if (mesh.material) {
      mesh.material = mesh.material.clone();
    }

    const meshName = (mesh.name || "").toLowerCase();
    const parentName = (mesh.parent?.name || "").toLowerCase();
    const userDataName = (((mesh.userData?.name || "") as string) || "").toLowerCase();
    const allNames = [meshName, parentName, userDataName];
    const matches = (term: string) => allNames.some((n) => n.includes(term));

    // Get bounding box min/max Y to detect body parts even if names are altered
    if (!mesh.geometry.boundingBox) {
      mesh.geometry.computeBoundingBox();
    }
    const bbox = mesh.geometry.boundingBox;
    const minY = bbox ? bbox.min.y : 0;
    const maxY = bbox ? bbox.max.y : 0;

    const setMatProps = (
      color: THREE.Color,
      roughness = 0.6,
      metalness = 0.0,
      emissive?: THREE.Color
    ) => {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((mat) => {
        if (
          mat instanceof THREE.MeshStandardMaterial ||
          mat instanceof THREE.MeshPhysicalMaterial
        ) {
          mat.color.copy(color);
          mat.roughness = roughness;
          mat.metalness = metalness;
          mat.vertexColors = false; // Turn off vertex colors so white attributes don't wash out skin/clothes
          if (emissive) {
            mat.emissive.copy(emissive);
            mat.emissiveIntensity = 0.15;
          }
          mat.needsUpdate = true;
        }
      });
    };

    // 1. HAIR
    // Mesh 1 "Iron:pCube3.004", Node "hair"
    if (
      matches("hair") ||
      meshName.includes("iron:pcube3") ||
      meshName === "mesh_1"
    ) {
      setMatProps(hairColor, 0.75, 0.05);
      return;
    }

    // 2. EYEBROWS
    // Mesh 3 "Plane.004", Node "Eyebrow"
    if (
      matches("eyebrow") ||
      matches("brow") ||
      (meshName === "plane.004" && minY > 13)
    ) {
      setMatProps(eyebrowColor, 0.85, 0.0);
      return;
    }

    // 3. EYES
    // Mesh 4 "Sphere.002", Node "EYEs.001"
    if (matches("eye") || meshName.includes("sphere.002")) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((mat) => {
        if (
          mat instanceof THREE.MeshStandardMaterial ||
          mat instanceof THREE.MeshPhysicalMaterial
        ) {
          mat.roughness = 0.1;
          mat.needsUpdate = true;
        }
      });
      return;
    }

    // 4. EARS
    // Mesh 2 "Plane.003", Node "Ear.001"
    // Bbox: min=[-1.47, 12.82, -0.03], max=[1.45, 13.51, 0.25]
    if (
      matches("ear") ||
      meshName.includes("003") ||
      (minY > 12.0 && maxY < 14.0 && bbox && bbox.max.x > 1.2)
    ) {
      setMatProps(skinColor, 0.58, 0.04);
      return;
    }

    // 5. FACE / HEAD (Saood's face in skin colour)
    // Mesh 8 "Plane.007", Node "Plane.007"
    // Bbox: min=[-1.00, 11.92, -0.94], max=[1.00, 14.02, 1.11]
    if (
      matches("face") ||
      matches("head") ||
      meshName.includes("007") ||
      meshName.includes("plane007") ||
      meshName.includes("plane_007") ||
      meshName.includes("plane.007") ||
      (minY > 11.5 && maxY < 14.5 && bbox && bbox.max.x < 1.25)
    ) {
      setMatProps(skinColor, 0.55, 0.04);
      return;
    }

    // 6. NECK
    // Mesh 6 "Plane.005", Node "Neck"
    // Bbox: min=[-0.44, 11.41, -0.88], max=[0.44, 12.52, 0.19]
    if (
      matches("neck") ||
      meshName.includes("005") ||
      (minY > 11.0 && maxY < 13.0 && bbox && bbox.max.x < 0.8)
    ) {
      setMatProps(skinColor, 0.58, 0.04);
      return;
    }

    // 7. HANDS
    // Mesh 5 "Mesh.002", Node "Hand"
    // Bbox: min=[-7.51, 10.81, -0.73], max=[7.51, 11.51, 0.46]
    if (
      matches("hand") ||
      matches("arm") ||
      meshName.includes("mesh.002") ||
      meshName.includes("mesh002") ||
      (minY > 10.0 && maxY < 12.0)
    ) {
      setMatProps(skinColor, 0.58, 0.04);
      return;
    }

    // Fallback for any head/face/skin mesh above neck
    if (minY > 11.0 && maxY < 14.5) {
      setMatProps(skinColor, 0.55, 0.04);
      return;
    }

    // 8. HOODIE / SHIRT / BODY TORSO (Dark Navy Blue Nike hoodie)
    // Mesh 0 "Cube.002", Node "BODY.SHIRT"
    // Bbox: min=[-5.86, 6.95, -1.44], max=[5.86, 12.15, 0.72]
    if (
      matches("shirt") ||
      matches("hoodie") ||
      matches("body") ||
      meshName.includes("cube002") ||
      meshName.includes("cube.002") ||
      (minY > 6.0 && maxY < 13.0)
    ) {
      setMatProps(hoodieColor, 0.85, 0.0);
      return;
    }

    // 9. PANTS / JOGGERS (Black)
    // Mesh 7 "Cube.004", Node "Pant"
    // Bbox: min=[-1.52, 0.93, -1.29], max=[1.52, 7.17, 0.47]
    if (
      matches("pant") ||
      matches("trouser") ||
      matches("jean") ||
      meshName.includes("cube004") ||
      meshName.includes("cube.004") ||
      (minY > 0.5 && maxY < 8.0)
    ) {
      setMatProps(pantsColor, 0.82, 0.0);
      return;
    }

    // 10. SHOES (Off-white / cream sneakers)
    // Mesh 9 "Cylinder.005", Node "Shoe"
    if (
      matches("shoe") ||
      meshName.includes("cylinder005") ||
      meshName.includes("cylinder.005") ||
      (minY >= 0 && maxY < 2.0)
    ) {
      setMatProps(shoeColor, 0.55, 0.05);
      return;
    }

    // 11. SOLES (Subtle warm grey)
    // Mesh 10 "Cylinder.008", Node "Sole"
    if (
      matches("sole") ||
      meshName.includes("cylinder008") ||
      meshName.includes("cylinder.008") ||
      (minY <= 0.1 && maxY < 0.5)
    ) {
      setMatProps(soleColor, 0.75, 0.0);
      return;
    }

    // 12. KEYBOARD KEYS
    // Nodes "KEYS", Meshes "Cube.012" - "Cube.092"
    if (
      matches("key") ||
      (meshName.startsWith("cube.0") &&
        parseInt(meshName.replace("cube.0", "")) >= 12)
    ) {
      setMatProps(keyColor, 0.4, 0.1);
      return;
    }

    // 13. KEYBOARD BASE
    // Node "Keyboard", Mesh "Cube.011"
    if (matches("keyboard") || meshName === "cube.011") {
      setMatProps(keyboardBaseColor, 0.35, 0.7);
      return;
    }

    // 14. SCREEN / MONITOR
    if (matches("screen") || meshName === "glass.001") {
      setMatProps(
        new THREE.Color(0x1a1a2e),
        0.2,
        0.8,
        new THREE.Color(0x3838ff)
      );
      return;
    }

    // 15. DESK / CHAIR
    if (
      matches("chair") ||
      meshName === "cube.007" ||
      (meshName === "cube.002" && minY < 0)
    ) {
      setMatProps(chairColor, 0.7, 0.1);
      return;
    }
  });
}

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        const encryptedBlob = await decryptFile(
          "/models/character.enc",
          "Character3D#@"
        );
        const blobUrl = URL.createObjectURL(new Blob([encryptedBlob]));

        let character: THREE.Object3D;
        loader.load(
          blobUrl,
          async (gltf) => {
            character = gltf.scene;
            await renderer.compileAsync(character, camera, scene);
            character.traverse((child: any) => {
              if (child.isMesh) {
                const mesh = child as THREE.Mesh;
                child.castShadow = true;
                child.receiveShadow = true;
                mesh.frustumCulled = true;
              }
            });
            // Apply proper skin, clothing, and feature colors
            applyCharacterColors(character);
            resolve(gltf);
            setCharTimeline(character, camera);
            setAllTimeline();
            character!.getObjectByName("footR")!.position.y = 3.36;
            character!.getObjectByName("footL")!.position.y = 3.36;
            dracoLoader.dispose();
          },
          undefined,
          (error) => {
            console.error("Error loading GLTF model:", error);
            reject(error);
          }
        );
      } catch (err) {
        reject(err);
        console.error(err);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;
