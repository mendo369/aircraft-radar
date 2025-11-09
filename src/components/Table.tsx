import { PlaneIcon } from 'lucide-react';
import { useAircraft } from '../contexts/AircraftContext'; // Importa el hook

export function Table() {
  const { state } = useAircraft(); // Obtiene el estado de los aviones

  return (
    <section className='w-[300px] p-4'> {/* Añadido bg y text para contraste */}
      <div className='border border-main-green w-full p-2'>
        <h2 className='text-center font-bold text-xl'>Control Aéreo</h2>
        <ul className='flex flex-col gap-2 max-h-[calc(100vh-100px)] overflow-y-auto'> {/* Añadido scroll si hay muchos */}
          {state.aircrafts.map((aircraft) => (
            <li key={aircraft.id} className='flex items-center gap-1'>
              <PlaneIcon size={16} /> {/* Ajusta el tamaño del icono */}
              {aircraft.callsign} (X:{aircraft.x.toFixed(2)}, Y:{aircraft.y.toFixed(2)})
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}