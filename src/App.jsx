// App.jsx
import "./App.css";
import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useScrollTRS } from "./hooks/useScrollTRS";
import CarModel from "./components/CarModel";
import CanModel from "./components/CanModel";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export default function App() {
  const carStartDefault = [10, -1.2, -2.0];
  const canStartDefault = [0.7, -4.3, -4.0];

  const [carStart, setCarStart] = useState([10, -1, -2.0]);
  const [canStart, setCanStart] = useState([0.7, -4.3, -4.0]);

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
              scale: 1.25,
            },
            {
              name: "midle",
              position: [2.0, -1.1, -1.2],
              rotationDeg: [0, -50, 0],
              scale: 0.95,
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
              position: [-2.2, -1.4, -1.1],
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
              scale: 1.1,
            },
            {
              name: "midle",
              position: [1.8, -1.1, -1.3],
              rotationDeg: [0, -45, 0],
              scale: 0.9,
            },
            {
              name: "end",
              position: [0, -7, -16],
              rotationDeg: [0, 180, 0],
              scale: 1.0,
            },
          ],
          can: [
            {
              name: "start",
              position: canStart,
              rotationDeg: [0, -20, 20],
              scale: 0.85,
            },
            {
              name: "midle",
              position: [-2.0, -1.3, -1.1],
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

  const toggleStarts = () => {
    const same =
      canStart[0] === 0.7 && canStart[1] === -4.3 && canStart[2] === -4.0;
    if (same) {
      setCanStart([10, -4.3, -4.0]);
      setCarStart([0, -1.2, -2.0]);
    } else {
      setCarStart(carStartDefault);
      setCanStart(canStartDefault);
    }
  };

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
