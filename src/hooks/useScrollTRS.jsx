// src/hooks/useScrollTRS.js
import { useEffect, useMemo, useState } from "react";

/* ===== Utils ===== */
const R = (deg) => (deg * Math.PI) / 180;
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];
const normalizeFrame = (f = {}) => ({
  position: f.position ?? [0, 0, 0],
  rotation: [
    R(f.rotationDeg?.[0] ?? 0),
    R(f.rotationDeg?.[1] ?? 0),
    R(f.rotationDeg?.[2] ?? 0),
  ],
  scale: f.scale ?? 1,
});
const blendTRS = (A, B, t) => ({
  position: lerp3(A.position, B.position, t),
  rotation: lerp3(A.rotation, B.rotation, t),
  scale: lerp(A.scale, B.scale, t),
});

/* Lê as sections reais do DOM, senão usa o fallback */
function useSectionNames(fallback) {
  const [names, setNames] = useState(fallback?.length ? fallback : ["start"]);
  useEffect(() => {
    const update = () => {
      const els = Array.from(document.querySelectorAll("main > section"));
      const found = els.map((el) => el.classList?.item(0) || "section");
      setNames(found.length ? found : fallback);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [fallback]);
  return names;
}

/* Converte scroll em [index,t] */
function useScrollSegment(sectionCount) {
  const [seg, setSeg] = useState({ index: 0, t: 0 });
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      const n = Math.max(1, sectionCount - 1);
      const segLen = 1 / n;
      const idx = Math.min(n - 1, Math.floor(p / segLen));
      const t = Math.min(1, Math.max(0, (p - idx * segLen) / segLen));
      setSeg({ index: idx, t });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sectionCount]);
  return seg;
}

/* Detecta device por largura */
function useDeviceKey(breakpoints) {
  const { tabletMin = 600, pcMin = 1024 } = breakpoints || {};
  const [key, setKey] = useState("pc");
  useEffect(() => {
    const decide = () => {
      const w = window.innerWidth;
      if (w >= pcMin) setKey("pc");
      else if (w >= tabletMin) setKey("tablet");
      else setKey("mobile");
    };
    decide();
    window.addEventListener("resize", decide);
    return () => window.removeEventListener("resize", decide);
  }, [tabletMin, pcMin]);
  return key;
}

/* Aplica overrides pontuais: overrides[modelName][sectionName] = { position|rotationDeg|scale } */
function applyOverrides(framesByModel, overrides) {
  if (!overrides) return framesByModel;
  const out = {};
  Object.keys(framesByModel).forEach((modelName) => {
    const arr = framesByModel[modelName] || [];
    const ovModel = overrides[modelName] || {};
    out[modelName] = arr.map((f) => {
      const ov = ovModel[f.name];
      if (!ov) return f;
      return {
        ...f,
        position: ov.position ?? f.position,
        rotationDeg: ov.rotationDeg ?? f.rotationDeg,
        scale: ov.scale ?? f.scale,
      };
    });
  });
  return out;
}

/* ===== Hook principal =====
   config = {
     names: ["start","midle","end"],
     models?: ["/Model/a.glb", ...],   // opcional, só informativo
     nameModels: ["can","car",...],
     frames: { pc: {car:[...], can:[...]}, tablet:{...}, mobile:{...} }
   }
   options = { breakpoints?: {tabletMin, pcMin}, overrides?: { car: { start: {...} } } }
*/
export function useScrollTRS(config, options) {
  const sectionNames = useSectionNames(config.names || ["start"]);
  const deviceKey = useDeviceKey(options?.breakpoints);

  const framesForDevice = useMemo(() => {
    const base =
      config.frames?.[deviceKey] ??
      config.frames?.pc ??
      config.frames?.tablet ??
      config.frames?.mobile ??
      {};
    return applyOverrides(base, options?.overrides);
  }, [config.frames, deviceKey, options?.overrides]);

  const normalized = useMemo(() => {
    const out = {};
    (config.nameModels || []).forEach((modelName) => {
      const arr = framesForDevice[modelName] || [];
      out[modelName] = arr.map(normalizeFrame);
    });
    return out;
  }, [config.nameModels, framesForDevice]);

  const { index, t } = useScrollSegment(sectionNames.length);

  const trs = useMemo(() => {
    const result = {};
    (config.nameModels || []).forEach((modelName) => {
      const arr = normalized[modelName] || [normalizeFrame()];
      const idxA = Math.min(index, arr.length - 1);
      const idxB = Math.min(index + 1, arr.length - 1);
      result[modelName] = blendTRS(arr[idxA], arr[idxB], t);
    });
    return result;
  }, [config.nameModels, normalized, index, t]);

  return { trs, deviceKey, sectionNames, segment: { index, t } };
}
