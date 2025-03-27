import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import { MandelbrotExplorer } from './components/MandelbrotExplorer';
import './App.css';

function App() {
  return (
    <div className="App">
      <Canvas
        style={{
          width: '100vw',
          height: '100vh',
          background: '#000'
        }}
        camera={{ position: [0, 0, 1], fov: 75 }}
      >
        <MandelbrotExplorer />
        {/* <Stats /> */}
      </Canvas>
    </div>
  );
}

export default App;
