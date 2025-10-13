# Como usar o hook e a estrutura HTML de camadas

Guia rápido para integrar o **`useScrollTRS`** e montar a cena 3D com camadas (fundo, 3D e topo) no React + `@react-three/fiber`.

---

## 1) Pré-requisitos

```bash
npm i three @react-three/fiber @react-three/drei react-icons
```

Estrutura mínima sugerida:

```
src/
  hooks/
    useScrollTRS.js
  components/
    CarModel.jsx
    CanModel.jsx
  App.jsx
  App.css
```

> Coloque o código do hook em `src/hooks/useScrollTRS.js`.

---

## 2) Conceito de camadas

* **Fundo**: seu conteúdo/sections do `<main>`.
* **Camada 3D**: `<Canvas>` transparente, ocupando a tela inteira.
* **Topo**: header e conteúdo por cima do 3D.

CSS base:

```css
/* App.css */
html, body, #root {
  height: 100%;
}

.threeLayer {
  position: fixed;
  inset: 0;             /* top/right/bottom/left: 0 */
  width: 100%;
  height: 100vh;
  z-index: 1;
  pointer-events: none; /* não bloquear cliques no conteúdo */
}

header, .principal, main { z-index: 3; position: relative; }

main {
  position: relative;
}

main > section {
  min-height: 100vh;     /* cada section vira um "slide" */
  display: grid;
  place-items: center;
}

.principal { max-width: 1100px; margin: 0 auto; padding: 2rem; }
```

No `<Canvas>`, use `alpha: true`:

```jsx
<Canvas gl={{ antialias: true, alpha: true }} shadows camera={{ position: [0,1.2,4], fov: 45 }}>
  {/* ... */}
</Canvas>
```

---

## 3) O hook `useScrollTRS`

Importe e use:

```jsx
import { useScrollTRS } from "./hooks/useScrollTRS";
```

### Configuração mínima

* `names`: ordens de sections presentes no `main` (ex.: `["start","midle","end"]`).
* `nameModels`: nomes lógicos de cada modelo controlado.
* `frames`: TRS por **device** (`pc`, `tablet`, `mobile`) e por **section**.

Exemplo:

```jsx
const config = {
  names: ["start", "midle", "end"],
  nameModels: ["can", "car"],
  frames: {
    pc: {
      car: [
        { name: "start", position: [10,-1,-2.0], rotationDeg: [0,45,0], scale: 1.35 },
        { name: "midle", position: [2.5,-1,-1.0], rotationDeg: [0,-50,0], scale: 1.00 },
        { name: "end",   position: [0,-8,-20],    rotationDeg: [0,180,0], scale: 1.10 },
      ],
      can: [
        { name: "start", position: [0.7,-4.3,-4.0], rotationDeg: [0,-20,20], scale: 1.00 },
        { name: "midle", position: [-2.5,-1.5,-1.2], rotationDeg: [0,-1,25], scale: 0.50 },
        { name: "end",   position: [2,-0.3,-1.0],   rotationDeg: [0,35,0],   scale: 0.00 },
      ],
    },
    tablet: { /* ...frames adaptados... */ },
    mobile: { /* ...frames adaptados... */ }
  }
};
```

Chamada do hook:

```jsx
const { trs, deviceKey, sectionNames, segment } = useScrollTRS(config);
```

* `trs.car` e `trs.can` já trazem `{ position, rotation, scale }` interpolados pelo scroll.
* `deviceKey`: `"pc" | "tablet" | "mobile"`.
* `sectionNames`: nomes efetivos detectados.
* `segment`: `{ index, t }` do segmento de scroll.

---

## 4) Exemplo completo do Canvas e camadas

```jsx
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
  const [carStart, setCarStart] = useState([10,-1,-2.0]);
  const [canStart, setCanStart] = useState([0.7,-4.3,-4.0]);

  const carStartDefault = [10,-1.2,-2.0];
  const canStartDefault = [0.7,-4.3,-4.0];

  const config = useMemo(() => ({
    names: ["start","midle","end"],
    nameModels: ["can","car"],
    frames: {
      pc: {
        car: [
          { name:"start", position: carStart, rotationDeg:[0,45,0],  scale:1.35 },
          { name:"midle", position:[2.5,-1,-1.0], rotationDeg:[0,-50,0], scale:1.00 },
          { name:"end",   position:[0,-8,-20],    rotationDeg:[0,180,0], scale:1.10 },
        ],
        can: [
          { name:"start", position: canStart, rotationDeg:[0,-20,20], scale:1.00 },
          { name:"midle", position:[-2.5,-1.5,-1.2], rotationDeg:[0,-1,25], scale:0.50 },
          { name:"end",   position:[2,-0.3,-1.0],    rotationDeg:[0,35,0],  scale:0.00 },
        ],
      },
      tablet: { /* ... */ },
      mobile: { /* ... */ },
    }
  }), [carStart, canStart]);

  const { trs } = useScrollTRS(config);

  const toggleStarts = () => {
    const same = canStart[0] === 0.7 && canStart[1] === -4.3 && canStart[2] === -4.0;
    if (same) {
      setCanStart([10,-4.3,-4.0]);
      setCarStart([0,-1.2,-2.0]);
    } else {
      setCarStart(carStartDefault);
      setCanStart(canStartDefault);
    }
  };

  return (
    <>
      {/* TOPO */}
      <header>
        <img src="/RedBull.png" alt="" />
        <img src="/RedBull_logo.png" alt="" />
      </header>

      {/* CAMADA 3D */}
      <div className="threeLayer" aria-hidden>
        <Canvas gl={{ antialias: true, alpha: true }} shadows camera={{ position: [0,1.2,4], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5,5,5]} intensity={1.2} castShadow />
          <Suspense fallback={null}>
            <CarModel position={trs.car.position} rotation={trs.car.rotation} scale={trs.car.scale} />
            <CanModel position={trs.can.position} rotation={trs.can.rotation} scale={trs.can.scale} />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>

      {/* FUNDO + CONTEÚDO */}
      <main>
        <section className="start">
          <div className="principal">
            <h1>RedBull te dá <span>asas</span></h1>
            <div className="containerButtons">
              <button onClick={toggleStarts}><IoIosArrowBack /></button>
              <button onClick={toggleStarts}><IoIosArrowForward /></button>
            </div>
          </div>
        </section>

        <section className="midle">
          <div className="principal">
            <div className="leftContainer">
              <h1>Red Bull Racing: <span>A Busca Incansável pela Vitória</span></h1>
              <p>Seu texto aqui…</p>
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
```

---

## 5) Adicionar novos modelos

1. Inclua o nome no array `nameModels`:

```js
nameModels: ["can", "car", "wing"]
```

2. Adicione `frames` para esse modelo em cada device:

```js
frames: {
  pc: {
    wing: [
      { name:"start", position:[0,0,0], rotationDeg:[0,0,0], scale:1.0 },
      { name:"midle", position:[1,0,0], rotationDeg:[0,30,0], scale:0.9 },
      { name:"end",   position:[2,0,0], rotationDeg:[0,60,0], scale:0.8 },
    ],
    // ...
  }
}
```

3. No `<Canvas>`, renderize seu componente usando `trs.wing`.

---

## 6) Responsividade e breakpoints

O hook detecta automaticamente `"mobile" | "tablet" | "pc"` por largura.
Para customizar:

```jsx
const { trs, deviceKey } = useScrollTRS(config, {
  breakpoints: { tabletMin: 600, pcMin: 1024 }
});
```

Defina frames distintos por device em `config.frames`.

---

## 7) Overrides em tempo real (opcional)

Sobrescreva posições/rotações/escala por modelo e section dinamicamente:

```jsx
const { trs } = useScrollTRS(config, {
  overrides: {
    car: {
      start: { position: [0,-1.2,-2.0] }  // apenas o que deseja alterar
    }
  }
});
```

---

## 8) Erros comuns

* `names` não bate com as classes das `<section>` no `main`.
  Garanta `<section className="start" />`, `<section className="midle" />`, `<section className="end" />`.
* `mobile` escrito diferente de `mobile` no `frames`.
* `rotationDeg` em graus, não em radianos. O hook converte para rad.
* Canvas sem `alpha: true` deixa fundo sólido.

---

## 9) Checklist

* [ ] Hook em `src/hooks/useScrollTRS.js`.
* [ ] `names` iguais às classes das sections.
* [ ] `nameModels` e `frames` definidos para todos os modelos.
* [ ] Canvas com `alpha: true`.
* [ ] `.threeLayer` fixa e com `pointer-events: none`.

---

## 10) Como um dev sênior faria?

* Criaria um `GenericGLTFModel` que recebe `url` e TRS. Assim não precisa um componente por modelo.
* Guardaria `overrides` em um store (Zustand/Context) para ajustar posições via UI.
* Usaria `Quaternion.slerp` para rotação perfeita se houver spins longos.
* Evitaria criar objetos por frame dentro de `useFrame` dos modelos. Reutilizaria vetores/quaternions.
* Debounce de `resize` e cálculo de segmento em páginas com muito conteúdo.
* Validaria o schema de `config` com Zod/Yup em dev para detectar keys faltando.

---

Pronto. Copie, cole, ajuste seus frames e modele sua cena.
