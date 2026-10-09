import * as THREE from "three";
import { createWaterMaterial, withDepth } from "../three/Water";
import { fbm, litMaterial, mulberry32, paint, shared, smooth } from "../three/kit";
import {
  bushGeometry,
  createArmy,
  createBoat,
  createDalada,
  createGopuram,
  createHouseGeometry,
  createLighthouse,
  createLotus,
  createPalace,
  createPavilion,
  createRampart,
  createStupa,
  instanced,
  mats,
  palmGeometry,
  treeGeometry,
  type Placement,
} from "../three/models";
import { LANDMARKS, MAP, KOTTE, buildRoute, coastX, riverInfo, routeAltitude, terrainHeight } from "./geo";

/**
 * Builds the whole diorama once: terrain, sea and river, vegetation, landmark buildings,
 * glowing route line and per-landmark beams. Everything is merged or instanced.
 */

const ROUTE_VERT = /* glsl */ `
  varying float vU;
  varying vec3 vWorld;
  void main() {
    vU = uv.x;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const ROUTE_FRAG = /* glsl */ `
  precision highp float;
  uniform float uProgress, uTime, uLength;
  varying float vU;
  varying vec3 vWorld;
  void main() {
    float travelled = step(vU, uProgress);
    float dash = smoothstep(0.35, 0.5, fract(vU * uLength * 1.6 - uTime * 0.55));
    vec3 gold = vec3(1.0, 0.8, 0.38);
    vec3 dim = vec3(0.95, 0.9, 0.8);
    vec3 col = mix(dim * 0.9, gold * 2.0, travelled);
    float a = mix(0.35 + 0.35 * dash, 0.95, travelled);
    // fade near the head so the bird "draws" the path
    a *= 1.0 - smoothstep(0.0, 0.01, vU - uProgress) * 0.0;
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;
const BEAM_VERT = /* glsl */ `
  varying float vY;
  void main() { vY = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const BEAM_FRAG = /* glsl */ `
  precision highp float;
  uniform float uOpacity;
  uniform vec3 uColor;
  varying float vY;
  void main() {
    float a = (1.0 - vY) * uOpacity;
    gl_FragColor = vec4(uColor * 1.6, a);
    #include <colorspace_fragment>
  }
`;

export type World = ReturnType<typeof buildWorld>;

export function buildWorld() {
  const root = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const m = mats();
  const rng = mulberry32(2025);

  /* ------------------------------ terrain ------------------------------ */
  const geo = new THREE.PlaneGeometry(MAP.width, MAP.depth, MAP.segX, MAP.segZ);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.getAttribute("position");
  const trueH = new Float32Array(pos.count);
  const depth = new Float32Array(pos.count);
  const stride = MAP.segX + 1;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const h = terrainHeight(x, z);
    trueH[i] = h;
    depth[i] = Math.max(0, MAP.water - h);
    const ix = i % stride;
    const iz = Math.floor(i / stride);
    const border = ix === 0 || ix === MAP.segX || iz === 0 || iz === MAP.segZ;
    pos.setY(i, border ? MAP.skirt : h);
  }
  geo.computeVertexNormals();

  const c = new THREE.Color();
  const tmp = new THREE.Color();
  let vi = 0;
  paint(geo, (x, y, z) => {
    const i = vi++;
    const h = trueH[i];
    if (y <= MAP.skirt + 0.001) return "#43362a";
    const d = x - coastX(z);
    if (h < 0) {
      // sea and river bed, seen through the water
      return c.set("#d3c08f").lerp(tmp.set("#17475a"), smooth(0.0, 1.4, -h)).getHex();
    }
    // lowland: paddy mosaic
    c.set("#4f8d3a").lerp(tmp.set("#2f6a30"), fbm(x * 0.4, z * 0.4));
    const cell = Math.floor(x * 2.4) * 928371 + Math.floor(z * 2.4) * 7919;
    const cr = ((cell ^ (cell >>> 13)) >>> 0) % 100;
    const paddy = smooth(0.62, 0.25, h) * smooth(2.5, 4.5, d) * smooth(0.4, 0.52, fbm(x * 0.09 + 11, z * 0.09));
    if (paddy > 0.2) c.lerp(tmp.set(cr < 33 ? "#a4cf56" : cr < 66 ? "#88bb48" : "#c9d36c"), paddy * 0.9);
    // forest and hills
    c.lerp(tmp.set("#2a5a2e"), smooth(0.7, 2.2, h));
    c.lerp(tmp.set("#6f6a4e"), smooth(3.2, 6.5, h));
    c.lerp(tmp.set("#e0d3a2"), smooth(1.0, 0.1, d));
    // river banks
    const r = riverInfo(x, z);
    c.lerp(tmp.set("#a89368"), smooth(r.w * 2.2, r.w * 0.7, r.d) * 0.8);
    // towns and temple grounds
    for (const l of LANDMARKS) {
      if (l.pad <= 0) continue;
      c.lerp(tmp.set("#cbbd98"), smooth(l.pad * 1.3, l.pad * 0.6, Math.hypot(x - l.x, z - l.z)) * 0.8);
    }
    c.lerp(tmp.set("#b3a07a"), smooth(2.6, 0.8, Math.hypot(x + 8.2, z + 2.4)) * 0.7);
    return c.getHex();
  });
  const groundMat = litMaterial({ flat: false, roughness: 1, rim: 0.2 });
  const ground = new THREE.Mesh(geo, groundMat);
  root.add(ground);
  disposables.push(geo, groundMat);

  /* ------------------------------- water -------------------------------- */
  const wgeo = new THREE.PlaneGeometry(MAP.width, MAP.depth, MAP.segX, MAP.segZ);
  wgeo.rotateX(-Math.PI / 2);
  withDepth(wgeo, depth);
  const water = createWaterMaterial(0.045);
  const waterMesh = new THREE.Mesh(wgeo, water.material);
  waterMesh.position.y = MAP.water;
  waterMesh.renderOrder = 2;
  root.add(waterMesh);
  disposables.push(wgeo, water.material);

  /* --------------------------- vegetation / houses --------------------------- */
  const palmGeo = palmGeometry();
  const treeGeo = treeGeometry();
  const bushGeo = bushGeometry();
  const houseGeo = createHouseGeometry();
  const houseMat = litMaterial({ rim: 0.35 });
  disposables.push(houseMat);

  // keep a clear corridor along the flight route so the path and bird stay readable
  const routeSamples = buildRoute()
    .curve.getPoints(160)
    .map((p) => [p.x, p.z] as const);
  const nearRoute = (x: number, z: number, r: number) => routeSamples.some(([rx, rz]) => (x - rx) ** 2 + (z - rz) ** 2 < r * r);
  const farFromLandmarks = (x: number, z: number, scale = 1) =>
    LANDMARKS.every((l) => l.pad <= 0 || Math.hypot(x - l.x, z - l.z) > l.pad * 0.95 * scale) && !nearRoute(x, z, 0.75 * scale);
  const halfW = MAP.width / 2 - 1.2;
  const halfD = MAP.depth / 2 - 1.2;

  const palms: Placement[] = [];
  for (let tries = 0; palms.length < 520 && tries < 40000; tries++) {
    const x = (rng() * 2 - 1) * halfW;
    const z = (rng() * 2 - 1) * halfD;
    const h = terrainHeight(x, z);
    if (h < 0.14 || h > 1.3) continue;
    const d = x - coastX(z);
    const p = d < 3.5 ? 0.8 : d < 14 ? 0.16 : 0.05;
    if (rng() > p || !farFromLandmarks(x, z)) continue;
    palms.push({ x, y: h - 0.02, z, s: 0.22 + rng() * 0.16, r: rng() * 6.28, tilt: (rng() - 0.5) * 0.1 });
  }
  const trees: Placement[] = [];
  const bushes: Placement[] = [];
  for (let tries = 0; trees.length < 1100 && tries < 50000; tries++) {
    const x = (rng() * 2 - 1) * halfW;
    const z = (rng() * 2 - 1) * halfD;
    const h = terrainHeight(x, z);
    if (h < 0.18 || h > 5.2) continue;
    const d = x - coastX(z);
    const forest = smooth(0.4, 2.2, h);
    const p = 0.05 + forest * 0.55;
    if (d < 2.5 || rng() > p || !farFromLandmarks(x, z, 1.1)) continue;
    trees.push({ x, y: h - 0.02, z, s: 0.26 + rng() * 0.3, r: rng() * 6.28 });
    if (rng() < 0.35) bushes.push({ x: x + (rng() - 0.5) * 0.6, y: h, z: z + (rng() - 0.5) * 0.6, s: 0.3 + rng() * 0.3, r: rng() * 6.28 });
  }
  const houses: Placement[] = [];
  const addHouses = (cx: number, cz: number, radius: number, n: number, skip = 0) => {
    for (let tries = 0, added = 0; added < n && tries < n * 30; tries++) {
      const a = rng() * 6.28;
      const rr = Math.sqrt(rng()) * radius;
      const x = cx + Math.cos(a) * rr;
      const z = cz + Math.sin(a) * rr;
      const h = terrainHeight(x, z);
      if (h < 0.15 || Math.hypot(x - cx, z - cz) < skip || !farFromLandmarks(x, z, 0.85)) continue;
      houses.push({ x, y: h, z, s: 0.38 + rng() * 0.3, r: rng() * 6.28 });
      added++;
    }
  };
  addHouses(-8.2, -2.4, 2.4, 90); // Colombo
  addHouses(KOTTE.x, KOTTE.z, 1.9, 26, 1.0);
  addHouses(-1.0, -7.0, 3.2, 34, 1.6); // Kelaniya
  addHouses(-1.0, 0.2, 5.5, 20);
  for (let i = 0; i < 12; i++) addHouses((rng() * 2 - 1) * halfW * 0.8, (rng() * 2 - 1) * halfD * 0.8, 1.0, 5);

  root.add(instanced(palmGeo, m.leaf, palms));
  root.add(instanced(treeGeo, m.canopy, trees));
  root.add(instanced(bushGeo, m.canopy, bushes));
  root.add(instanced(houseGeo, houseMat, houses));

  /* ------------------------------ lake lotus ------------------------------ */
  const lotus: Placement[] = [];
  for (let tries = 0; lotus.length < 46 && tries < 3000; tries++) {
    const a = rng() * 6.28;
    const rr = 2.4 + rng() * 0.8;
    const x = KOTTE.x + Math.cos(a) * rr;
    const z = KOTTE.z + Math.sin(a) * rr;
    if (terrainHeight(x, z) > -0.08) continue;
    lotus.push({ x, y: 0.02, z, s: 0.4 + rng() * 0.4, r: rng() * 6.28 });
  }
  const lotusGeo = createLotus(mulberry32(5));
  disposables.push(lotusGeo);
  root.add(instanced(lotusGeo, m.litSmooth, lotus));

  /* ------------------------------ landmarks ------------------------------ */
  const place = (obj: THREE.Object3D, x: number, z: number, ry = 0, lift = -0.02) => {
    obj.position.set(x, Math.max(terrainHeight(x, z), 0.1) + lift, z);
    obj.rotation.y = ry;
    root.add(obj);
    return obj;
  };

  // Kotte
  place(createRampart(1.95), KOTTE.x, KOTTE.z);
  place(createPalace(0.42), -0.9, 4.3, 0.2);
  place(createDalada(0.4), 1.25, 5.7, -0.4);
  place(createPavilion(0.4), 0.7, 3.7, 0.3);
  place(createPavilion(0.34), -1.1, 5.9, -0.2);
  // Isvara kovil
  place(createGopuram(0.42), -0.8, 1.3, 0.1);
  // Sapumal's army on the road
  const army = createArmy(9);
  army.scale.setScalar(1.35);
  place(army, -1.5, -1.7, 0.9, 0.04);
  // Kitsirimevan: little stupa and bo tree
  place(createStupa(0.26), -1.0, -4.2);
  root.add(instanced(treeGeo, m.canopy, [{ x: -1.7, y: terrainHeight(-1.7, -4.1), z: -4.1, s: 0.85, r: 1.1 }]));
  // Kelaniya: great stupa, image house, bo tree, robe stupa
  place(createStupa(0.5), -1.0, -7.0);
  place(createPavilion(0.55), -0.1, -7.6, 0.4);
  place(createStupa(0.16), -1.9, -7.9);
  root.add(instanced(treeGeo, m.canopy, [{ x: -2.0, y: terrainHeight(-2.0, -6.4), z: -6.4, s: 1.0, r: 0.6 }]));
  // Vibhishana devale
  place(createPavilion(0.62), 0.9, -6.2, -0.3);
  place(createGopuram(0.25), 1.8, -6.0, -0.5);
  // Colombo lighthouse
  place(createLighthouse(0.7), -9.2, -1.4);

  // Boats at sea and on the estuary
  const boats: { obj: THREE.Group; phase: number; y: number }[] = [];
  for (let i = 0; i < 11; i++) {
    const z = -12 + rng() * 24;
    const x = coastX(z) - 2.5 - rng() * 6;
    const b = createBoat(0.55);
    b.position.set(x, 0.03, z);
    b.rotation.y = rng() * 6.28;
    root.add(b);
    boats.push({ obj: b, phase: rng() * 6, y: 0.03 });
  }

  /* ----------------------------- route and beams ----------------------------- */
  const { curve, nodeU } = buildRoute();
  const lengthTotal = curve.getLength();
  const roadPts = curve.getPoints(260).map((p) => new THREE.Vector3(p.x, Math.max(terrainHeight(p.x, p.z), 0.1) + 0.12, p.z));
  const roadCurve = new THREE.CatmullRomCurve3(roadPts);
  const tube = new THREE.TubeGeometry(roadCurve, 500, 0.045, 6, false);
  const routeMat = new THREE.ShaderMaterial({
    vertexShader: ROUTE_VERT,
    fragmentShader: ROUTE_FRAG,
    transparent: true,
    depthWrite: false,
    uniforms: { uProgress: { value: 0 }, uTime: shared.uTime, uLength: { value: lengthTotal } },
  });
  const route = new THREE.Mesh(tube, routeMat);
  route.renderOrder = 3;
  root.add(route);
  disposables.push(tube, routeMat);

  const beams: Record<string, { mat: THREE.ShaderMaterial; head: THREE.Mesh; ring: THREE.Mesh; top: THREE.Vector3; weight: number }> = {};
  const headGeo = new THREE.OctahedronGeometry(0.11, 0);
  const headMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffd98a"), toneMapped: false });
  disposables.push(headGeo, headMat);
  for (const l of LANDMARKS) {
    const base = Math.max(terrainHeight(l.x, l.z), 0.1);
    const h = l.pin;
    const g = new THREE.CylinderGeometry(0.035, 0.07, h, 8, 1, true);
    const mat = new THREE.ShaderMaterial({
      vertexShader: BEAM_VERT,
      fragmentShader: BEAM_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { uOpacity: { value: 0.35 }, uColor: { value: new THREE.Color("#ffd27a") } },
    });
    const beam = new THREE.Mesh(g, mat);
    beam.position.set(l.x, base + h / 2, l.z);
    beam.renderOrder = 4;
    root.add(beam);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(l.x, base + h, l.z);
    root.add(head);
    const ringGeo = new THREE.RingGeometry(Math.max(l.pad, 0.4) * 0.8, Math.max(l.pad, 0.4) * 0.9, 48);
    ringGeo.rotateX(-Math.PI / 2);
    const ring = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({ color: "#ffd27a", transparent: true, opacity: 0.0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }),
    );
    ring.position.set(l.x, base + 0.08, l.z);
    ring.renderOrder = 4;
    root.add(ring);
    beams[l.id] = { mat, head, ring, top: new THREE.Vector3(l.x, base + h, l.z), weight: 0 };
    disposables.push(g, mat, ringGeo, ring.material as THREE.Material);
  }

  return {
    root,
    groundMat,
    water,
    boats,
    army,
    route: { curve, nodeU, mesh: route, mat: routeMat, length: lengthTotal },
    beams,
    dispose: () => disposables.forEach((d) => d.dispose()),
    altitude: routeAltitude,
  };
}
