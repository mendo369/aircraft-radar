import { PlaneIcon } from 'lucide-react';
import { useAircraft } from '../contexts/AircraftContext';

export function Panel() {
  const { state } = useAircraft();

  // Función para calcular el ángulo en grados a partir de dx y dy
  const calculateAngle = (dx: number, dy: number): number => {
    // Math.atan2 devuelve el ángulo en radianes entre -π y π
    // Lo convertimos a grados
    let angleInRadians = Math.atan2(dy, dx);
    let angleInDegrees = angleInRadians * (180 / Math.PI);

    // Opcional: Ajustar el ángulo si tu icono original no apunta hacia la derecha (0 grados)
    // Por ejemplo, si apunta hacia arriba (como un avión convencional en SVG), sumarías 90 grados.
    // const adjustedAngle = angleInDegrees + 90; // Descomenta si es necesario
    return angleInDegrees;
  };

  return (
    <section className='flex-1  relative overflow-hidden'>
      <h1 className='absolute top-2 left-1/2 transform -translate-x-1/2 text-white font-bold z-10'>
        Radar de Aviones
      </h1>

      {/* Plano cartesiano - Puedes personalizar el fondo con CSS o una imagen */}
      <div className="w-full h-full">
        {/* Renderiza cada avión */}
        {state.aircrafts.map((aircraft) => (
          <div
            key={aircraft.id}
            className="absolute w-4 h-4 flex items-center justify-center text-xs font-bold"
            style={{
              left: `${aircraft.x}%`,
              top: `${aircraft.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            title={`${aircraft.callsign} (X:${aircraft.x.toFixed(2)}, Y:${aircraft.y.toFixed(2)}, Dir:${calculateAngle(aircraft.dx, aircraft.dy).toFixed(2)}°)`} // Mostrar ángulo en tooltip
          >
            {/* Contenedor para el icono que aplica la rotación */}
            <div
              className="flex items-center justify-center"
              style={{
                transform: `rotate(${calculateAngle(aircraft.dx, aircraft.dy)-290}deg)`, // Aplica la rotación aquí
              }}
            >
              <PlaneIcon size={24} />
            </div>
            {/* Mostrar el indicativo si lo deseas */}
            {/* <span className="absolute -bottom-5 text-[0.6rem] bg-black bg-opacity-70 px-1 rounded">{aircraft.callsign.substring(3, 6)}</span> */}
          </div>
        ))}
      </div>
    </section>
  );
}