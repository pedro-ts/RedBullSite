// App.jsx
// Camadas:
//  - Fundo: <section> (background)
//  - 3D: Canvas transparente fixo [z-index:1]
//  - Topo: header e .principal por cima do 3D [z-index:3]
import "./App.css";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import CarModel from "./components/CarModel";
import CanModel from "./components/CanModel";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

// ===== Utils =====
// Formula que converte graus em radianos
// Definir valores padrão para evitar dar NaN
const R = (deg) => (deg * Math.PI) / 180;
const normalizeFrame = (f) => ({
  position: f?.position ?? [0, 0, 0],
  rotation: [
    R(f?.rotationDeg?.[0] ?? 0),
    R(f?.rotationDeg?.[1] ?? 0),
    R(f?.rotationDeg?.[2] ?? 0),
  ],
  scale: f?.scale ?? 1,
});
// aplicação do lerp(suavização de animação) em 3D(x,y,z) e em numeros normal(tipo scale)
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];
// Aplica as 4 funções criadas até agora e retorna um novo TRS renderizado com as otimizações das funções criadas até agora
const blendTRS = (A, B, t) => ({
  position: lerp3(A.position, B.position, t),
  rotation: lerp3(A.rotation, B.rotation, t),
  scale: lerp(A.scale, B.scale, t),
});

// Lê as sections na ordem (só para quantidade)
function useSectionNames() {
  const [names, setNames] = useState(["start", "midle", "end"]);
  useEffect(() => {
    const update = () => {
      const sections = Array.from(document.querySelectorAll("main > section"));
      const result = sections.map((el) => el.classList?.item(0) || "section");
      if (result.length) setNames(result);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return names;
}

// Converte scroll em segmento [index,t]
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

// framesRaw é um array; se houver mais sections que frames, fixa no último
function useBlendedTRS(framesRaw, sectionNames, defaultFrame) {
  const frames = framesRaw?.length
    ? framesRaw.map(normalizeFrame)
    : [normalizeFrame(defaultFrame)];
  const { index, t } = useScrollSegment(sectionNames.length);
  const idxA = Math.min(index, frames.length - 1);
  const idxB = Math.min(index + 1, frames.length - 1);
  const A = frames[idxA];
  const B = frames[idxB];
  return useMemo(() => blendTRS(A, B, t), [A, B, t]);
}

function App() {
  const sectionNames = useSectionNames();

  // Default para quando faltar frame
  const DEFAULT_FRAME = useMemo(
    () => ({ position: [0, 0, -1], rotationDeg: [0, 0, 0], scale: 1 }),
    []
  );
  
  const carPositionStartDefaultValue = [10, -1.2, -2.0];
  const canPositionStartDefaultValue = [0.7, -4.3, -4.0];

  const [carPositionStart, setCarPositionStart] = useState([10, -1, -2.0]);
  const [canPositionStart, setCanPositionStart] = useState([0.7, -4.3, -4.0]);

  // Frames dependentes de estado
  const FRAMES = useMemo(
    () => ({
      car: [
        {
          name: "start",
          position: carPositionStart,
          rotationDeg: [0, 45, 0],
          scale: 1.35,
        },
        {
          name: "midle",
          position: [2.5, -1, -1.0],
          rotationDeg: [0, -50, 0],
          scale: 1,
        },
        {
          name: "end",
          position: [0, -8, -20],
          rotationDeg: [0, 180, 0],
          scale: 1.1,
        },
      ],
      can: [
        {
          name: "start",
          position: canPositionStart,
          rotationDeg: [0, -20, 20],
          scale: 1,
        },
        {
          name: "midle",
          position: [-2.5, -1.5, -1.2],
          rotationDeg: [0, -1, 25],
          scale: 0.5,
        },
        {
          name: "end",
          position: [2, -0.3, -1.0],
          rotationDeg: [0, 35, 0],
          scale: 0,
        },
      ],
    }),
    [carPositionStart, canPositionStart]
  );

  // TRS interpolados pelo scroll
  const carTRS = useBlendedTRS(FRAMES.car, sectionNames, DEFAULT_FRAME);
  const canTRS = useBlendedTRS(FRAMES.can, sectionNames, DEFAULT_FRAME);

  // Alterar componentes no start
  // Função utilitária para comparar o conteúdo de dois arrays
  const areArraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    return a.every((value, index) => value === b[index]);
  };

  const alterComponents = () => {
    console.log("clicou");
    if (areArraysEqual(canPositionStart, canPositionStartDefaultValue)) {
      setCanPositionStart([10, -4.3, -4.0]);
      setCarPositionStart([0, -1.2, -2.0]);
    } else{
      setCarPositionStart(carPositionStartDefaultValue);
      setCanPositionStart(canPositionStartDefaultValue);
    }
  };
  return (
    <>
      <header>
        <img src="/RedBull.png" alt="" />
        <img src="/RedBull_logo.png" alt="" />
      </header>

      {/* Camada 3D fixa e transparente */}
      <div className="threeLayer" aria-hidden>
        <Canvas
          gl={{ antialias: true, alpha: true }}
          shadows
          camera={{ position: [0, 1.2, 4], fov: 45 }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
          <Suspense fallback={null}>
            <CarModel
              position={carTRS.position}
              rotation={carTRS.rotation}
              scale={carTRS.scale}
            />
            <CanModel
              position={canTRS.position}
              rotation={canTRS.rotation}
              scale={canTRS.scale}
            />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>

      {/* Fundo e conteúdo */}
      <main>
        <section className="start">
          <div className="principal">
            <h1>
              RedBull te dá <span>asas</span>
            </h1>
            <div className="containerButtons">
              <button onClick={alterComponents}>
                <IoIosArrowBack />
              </button>
              <button onClick={alterComponents}>
                <IoIosArrowForward />
              </button>
            </div>
          </div>
        </section>
        <section className="midle">
          <div className="principal">
            <div className="leftContainer">
              <h1>Red Bull Racing: <span>A Busca Incansável pela Vitória</span> </h1>
              <p>
                A Red Bull Racing representa mais do que uma equipe de Fórmula
                1; é sinônimo de ambição, inovação e a busca incessante por
                quebrar limites. Desde sua entrada na elite do automobilismo, a
                equipe austríaca se destacou por sua abordagem audaciosa, tanto
                na estratégia de corrida quanto no desenvolvimento de seus
                carros. Com talentos como Max Verstappen ao volante, a Red Bull
                tem consolidado sua posição como uma força dominante, desafiando
                os rivais e proporcionando momentos eletrizantes para os fãs ao
                redor do mundo. A paixão pela velocidade e a cultura de alta
                performance são os pilares que impulsionam a equipe a cada
                curva, cada ultrapassagem e em cada campeonato.
              </p>
            </div>
            <div className="rightContainer"></div>
          </div>
        </section>
        <section className="end">
          <div className="principal"><h1>Voe com <span>Red Bull</span></h1></div>
        </section>
      </main>
    </>
  );
}

export default App;
