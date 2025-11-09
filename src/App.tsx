import './App.css';
import { Panel } from './components/Panel';
import { Table } from './components/Table';
import { AircraftProvider } from './contexts/AircraftContext'; // Importa el proveedor

function App() {
  return (
    // Envuelve toda la aplicación (o la parte que lo necesita) con el proveedor
    <AircraftProvider>
      <main className='w-[100dvw] h-[100dvh]'>
        <div className='w-full h-full flex'>
          <Panel />
          <Table />
        </div>
      </main>
    </AircraftProvider>
  );
}

export default App;