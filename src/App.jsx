// App.jsx
import "./App.css";
import { Suspense, useMemo, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useScrollTRS } from "./hooks/useScrollTRS";
import CarModel from "./components/CarModel";
import CanModel from "./components/CanModel";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

function useDeviceKey({ tabletMin = 768, pcMin = 1025 } = {}) {
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

export default function App() {
  // Descobre se é pc, mobile ou tablet para modificar os valores padrão
  const deviceKey = useDeviceKey({ tabletMin: 768, pcMin: 1025 });

  // presets por dispositivo
  const presets = {
    pc: { car: [10, -1.2, -2.0], can: [0.7, -4.3, -4.0] },
    tablet: { car: [10, -1.2, -2.0], can: [0.7, -4.3, -4.0] },
    mobile: { car: [10, -1.2, -2.0], can: [0.45, -2.4, -4.0] },
  };

  const { carStartDefault, canStartDefault } = useMemo(() => {
    const p = presets[deviceKey] || presets.pc;
    return { carStartDefault: p.car, canStartDefault: p.can };
  }, [deviceKey]);

  useEffect(() => {
    setCarStart(carStartDefault);
    setCanStart(canStartDefault);
  }, [deviceKey]);

  // Valores padrão de inicio dos elementos na dev start

  const [carStart, setCarStart] = useState(carStartDefault);
  const [canStart, setCanStart] = useState(canStartDefault);

  const config = useMemo(
    () => ({
      names: ["start", "midle", "end"],
      // models: ["/Model/redbull_lata.glb", "/Model/red_bull_f1.glb"], // opcional
      nameModels: ["can", "car"],
      frames: {
        pc: {
          car: [
            {
              name: "start",
              position: carStart,
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
              position: canStart,
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
        },
        tablet: {
          car: [
            {
              name: "start",
              position: carStart,
              rotationDeg: [0, 45, 0],
              scale: 0.9,
            },
            {
              name: "midle",
              position: [1.6, -1.1, -1.2],
              rotationDeg: [0, -50, 0],
              scale: 0.6,
            },
            {
              name: "end",
              position: [0, -7.5, -18],
              rotationDeg: [0, 180, 0],
              scale: 1.05,
            },
          ],
          can: [
            {
              name: "start",
              position: canStart,
              rotationDeg: [0, -20, 20],
              scale: 0.9,
            },
            {
              name: "midle",
              position: [-1.5, -1.4, -1.1],
              rotationDeg: [0, -1, 25],
              scale: 0.45,
            },
            {
              name: "end",
              position: [2, -0.3, -1.0],
              rotationDeg: [0, 35, 0],
              scale: 0,
            },
          ],
        },
        mobile: {
          car: [
            {
              name: "start",
              position: carStart,
              rotationDeg: [0, 45, 0],
              scale: 0.5,
            },
            {
              name: "midle",
              position: [0, 4.5, 0],
              rotationDeg: [0, -45, 0], 
              scale: 0  ,
            },
            {
              name: "end",
              position: [0, -7, -19],
              rotationDeg: [1, 178,0],
              scale: 0.8,
            },
          ],
          can: [
            {
              name: "start",
              position: canStart,
              rotationDeg: [0, -20, 20],
              scale: 0.65,
            },
            {
              name: "midle",
              position: [0, -1.3, -1.1],
              rotationDeg: [0, -1, 25],
              scale: 0.4,
            },
            {
              name: "end",
              position: [2, -0.3, -1.0],
              rotationDeg: [0, 35, 0],
              scale: 0,
            },
          ],
        },
      },
    }),
    [carStart, canStart]
  );

  const { trs } = useScrollTRS(config);

  // Carrossel -start

  // helpers
  const eqVec = (a = [], b = [], eps = 1e-4) =>
    a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < eps);

  // mapa de alternância por device
  const swapMap = {
    pc: {
      A: { car: presets.pc.car, can: presets.pc.can }, // estado inicial (default do device)
      B: { car: [0, -1.2, -2.0], can: [10, -4.3, -4.0] }, // invertido
    },
    tablet: {
      A: { car: presets.tablet.car, can: presets.tablet.can },
      B: { car: [0, -1.2, -2.0], can: [10, -4.3, -4.0] },
    },
    mobile: {
      A: { car: presets.mobile.car, can: presets.mobile.can },
      // defina o “invertido” específico do mobile:
      B: { car: [-0.1, -0.25, -2.0], can: [10, -2.4, -4.0] },
    },
  };

  const toggleStarts = () => {
    const dev = swapMap[deviceKey] || swapMap.pc;

    // Está no estado A?
    const isA = eqVec(carStart, dev.A.car) && eqVec(canStart, dev.A.can);

    // Alterna para B ou volta para A
    if (isA) {
      setCarStart(dev.B.car);
      setCanStart(dev.B.can);
    } else {
      setCarStart(dev.A.car);
      setCanStart(dev.A.can);
    }
  };

  useEffect(() => {
    const dev = swapMap[deviceKey] || swapMap.pc;
    setCarStart(dev.A.car);
    setCanStart(dev.A.can);
  }, [deviceKey]); // <- importante

  // Carrossel -end
  return (
    <>
      <header>
        <img src="/RedBull.png" alt="" />
        <img src="/RedBull_logo.png" alt="" />
      </header>

      {/* Layer 3D fixa e transparente */}
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
              position={trs.car.position}
              rotation={trs.car.rotation}
              scale={trs.car.scale}
            />
            <CanModel
              position={trs.can.position}
              rotation={trs.can.rotation}
              scale={trs.can.scale}
            />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>

      {/* Fundo + Texto */}
      <main>
        <section className="start">
          <div className="principal">
            <h1>
              RedBull te dá <span>asas</span>
            </h1>
            <div className="containerButtons">
              <button onClick={toggleStarts}>
                <IoIosArrowBack />
              </button>
              <button onClick={toggleStarts}>
                <IoIosArrowForward />
              </button>
            </div>
          </div>
        </section>

        <section className="midle">
          <div className="principal">
            <div className="leftContainer">
              <h1>
                Red Bull Racing: <span>A Busca Incansável pela Vitória</span>
              </h1>
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
          <div className="principal">
            <h1>
              Voe com <span>Red Bull</span>
            </h1>
          </div>
        </section>
      </main>
    </>
  );
}
