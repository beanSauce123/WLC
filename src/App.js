import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function DNASegment({ points }) {
  const lineRef = useRef();

  useFrame(() => {
    if (lineRef.current) {
      const positions = new Float32Array(points.length * 3);
      for (let i = 0; i < points.length; i++) {
        positions.set(points[i], i * 3);
      }
      lineRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial color="blue" />
    </line>
  );
}

function calculateWLCChain(length, persistenceLength, temperature, time, bendingRigidity, noiseLevel, externalForce) {
  const points = [[0, 0, 0]]; // Start at origin
  const thermalFluctuation = (temperature / persistenceLength) ** 0.5 * noiseLevel;
  const direction = new THREE.Vector3(1, 0, 0);
  const force = new THREE.Vector3(externalForce.x, externalForce.y, externalForce.z);

  for (let i = 1; i < length; i++) {
    // Add thermal fluctuations to the direction
    const fluctuation = new THREE.Vector3(
      (Math.sin(time + i) * 0.5) * thermalFluctuation,
      (Math.cos(time + i) * 0.5) * thermalFluctuation,
      (Math.sin(time * 0.5) * 0.5) * thermalFluctuation
    );

    direction.add(fluctuation).normalize();
    direction.add(force.multiplyScalar(1 / bendingRigidity));

    const newPoint = points[i - 1].slice();
    newPoint[0] += direction.x;
    newPoint[1] += direction.y;
    newPoint[2] += direction.z;

    points.push(newPoint);
  }

  return points;
}

function DNAModel({ length, persistenceLength, temperature, bendingRigidity, noiseLevel, externalForce }) {
  const [points, setPoints] = useState([]);
  const timeRef = useRef(0);

  useFrame(() => {
    timeRef.current += 0.01; // Increment time for animation
    const newPoints = calculateWLCChain(length, persistenceLength, temperature, timeRef.current, bendingRigidity, noiseLevel, externalForce);
    setPoints(newPoints);
  });

  return <DNASegment points={points} />;
}

export default function App() {
  const [length, setLength] = useState(100);
  const [persistenceLength, setPersistenceLength] = useState(50);
  const [temperature, setTemperature] = useState(300);
  const [bendingRigidity, setBendingRigidity] = useState(1);
  const [noiseLevel, setNoiseLevel] = useState(1);
  const [externalForce, setExternalForce] = useState({ x: 0, y: 0, z: 0 });

  return (
    <>
      <Canvas 
        camera={{ position: [0, 0, 150], fov: 50 }}
        style={{ height: '100vh', width: '100vw' }} // Ensure the Canvas takes full viewport size
      >
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <DNAModel
          length={length}
          persistenceLength={persistenceLength}
          temperature={temperature}
          bendingRigidity={bendingRigidity}
          noiseLevel={noiseLevel}
          externalForce={externalForce}
        />
        <OrbitControls />
      </Canvas>

      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1 }}>
        <h2>DNA Simulation Using the Worm-Like Chain (WLC) Model</h2>
        <p>
          This simulation models DNA as a flexible chain using the Worm-Like Chain (WLC) model. The WLC model describes
          the DNA as a continuous, flexible polymer that can bend and twist. It helps us understand how DNA behaves under
          different conditions and forces.
        </p>
        <p><strong>Parameters:</strong></p>
        <ul>
          <li><strong>Length:</strong> The total number of segments in the DNA chain.</li>
          <li><strong>Persistence Length:</strong> A measure of the DNA's stiffness. Higher values mean the DNA is more rigid.</li>
          <li><strong>Temperature:</strong> Represents the thermal energy affecting the DNA. Higher temperatures increase thermal fluctuations.</li>
          <li><strong>Bending Rigidity:</strong> Controls the resistance of the DNA to bending. Higher values result in stiffer DNA.</li>
          <li><strong>Noise Level:</strong> Represents the intensity of thermal fluctuations. Higher values introduce more randomness to the DNA's shape.</li>
          <li><strong>External Force X, Y, Z:</strong> Adjust the force applied to the DNA in the X, Y, and Z directions. This simulates external influences that can stretch or compress the DNA.</li>
        </ul>

        <label>
          Length:
          <input
            type="range"
            min="50"
            max="200"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
          />
        </label>
        <br />
        <label>
          Persistence Length:
          <input
            type="range"
            min="10"
            max="100"
            value={persistenceLength}
            onChange={(e) => setPersistenceLength(parseInt(e.target.value))}
          />
        </label>
        <br />
        <label>
          Temperature:
          <input
            type="range"
            min="100"
            max="500"
            value={temperature}
            onChange={(e) => setTemperature(parseInt(e.target.value))}
          />
        </label>
        <br />
        <label>
          Bending Rigidity:
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={bendingRigidity}
            onChange={(e) => setBendingRigidity(parseFloat(e.target.value))}
          />
        </label>
        <br />
        <label>
          Noise Level:
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={noiseLevel}
            onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
          />
        </label>
        <br />
        <label>
          External Force X:
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={externalForce.x}
            onChange={(e) => setExternalForce((prev) => ({ ...prev, x: parseFloat(e.target.value) }))}
          />
        </label>
        <br />
        <label>
          External Force Y:
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={externalForce.y}
            onChange={(e) => setExternalForce((prev) => ({ ...prev, y: parseFloat(e.target.value) }))}
          />
        </label>
        <br />
        <label>
          External Force Z:
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={externalForce.z}
            onChange={(e) => setExternalForce((prev) => ({ ...prev, z: parseFloat(e.target.value) }))}
          />
        </label>
      </div>
    </>
  );
}
