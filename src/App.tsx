import { Canvas } from '@react-three/fiber';
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
      </Canvas>
    </div>
  );
}

export default App;
