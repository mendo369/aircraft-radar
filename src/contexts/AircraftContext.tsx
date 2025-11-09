import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Definición del tipo para un avión
interface Aircraft {
  id: string;
  x: number; // Coordenada X en el radar (0 a 100)
  y: number; // Coordenada Y en el radar (0 a 100)
  dx: number; // Componente X de la velocidad (trayectoria)
  dy: number; // Componente Y de la velocidad (trayectoria)
  callsign: string; // Indicativo del avión
}

// Acciones que pueden ocurrir en el contexto
type Action =
  | { type: 'SET_AIRCRAFTS'; payload: Aircraft[] }
  | { type: 'UPDATE_AIRCRAFT_POSITIONS' };

// Estado del contexto
interface AircraftState {
  aircrafts: Aircraft[];
}

// Reducer para manejar las acciones
const aircraftReducer = (state: AircraftState, action: Action): AircraftState => {
  switch (action.type) {
    case 'SET_AIRCRAFTS':
      return { ...state, aircrafts: action.payload };
    case 'UPDATE_AIRCRAFT_POSITIONS':
      // Actualiza la posición de cada avión basado en su velocidad (dx, dy)
      const updatedAircrafts = state.aircrafts.map(ac => {
        let newX = ac.x + ac.dx;
        let newY = ac.y + ac.dy;

        // Lógica de rebote en los bordes (ajusta según necesites)
        if (newX < 0 || newX > 100) {
          return { ...ac, x: ac.x, dx: -ac.dx }; // Invierte dx, mantiene x actual
        }
        if (newY < 0 || newY > 100) {
          return { ...ac, y: ac.y, dy: -ac.dy }; // Invierte dy, mantiene y actual
        }

        return { ...ac, x: newX, y: newY };
      });
      return { ...state, aircrafts: updatedAircrafts };
    default:
      return state;
  }
};

// Creación del contexto
const AircraftContext = createContext<{
  state: AircraftState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

// Hook para usar el contexto
export const useAircraft = () => {
  const context = useContext(AircraftContext);
  if (!context) {
    throw new Error('useAircraft must be used within an AircraftProvider');
  }
  return context;
};

// Componente Provider
export const AircraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(aircraftReducer, { aircrafts: [] });

  // Genera aviones iniciales cuando el componente Provider se monta
  useEffect(() => {
    const generateInitialAircrafts = (): Aircraft[] => {
      const numAircrafts = Math.floor(Math.random() * 11) + 10; // 10 a 20 aviones
      const aircrafts: Aircraft[] = [];
      const existingPositions: { x: number; y: number }[] = []; // Para evitar superposiciones iniciales

      for (let i = 0; i < numAircrafts; i++) {
        let x:number, y:number;
        let attempts = 0;
        const maxAttempts = 50; // Evitar bucles infinitos

        do {
          x = parseFloat((Math.random() * 100).toFixed(2)); // Posición X entre 0 y 100
          y = parseFloat((Math.random() * 100).toFixed(2)); // Posición Y entre 0 y 100
          attempts++;
        } while (
          existingPositions.some(pos => Math.abs(pos.x - x) < 5 && Math.abs(pos.y - y) < 5) && attempts < maxAttempts
        );

        if (attempts >= maxAttempts) break; // No se pudo encontrar una posición única

        existingPositions.push({ x, y });

        // Genera una velocidad aleatoria (trayectoria) entre -0.5 y 0.5 en ambos ejes
        const dx = parseFloat((Math.random() * 1 - 0.5).toFixed(2));
        const dy = parseFloat((Math.random() * 1 - 0.5).toFixed(2));

        // Genera un indicativo aleatorio simple
        const callsign = `AV-${Math.floor(Math.random() * 900) + 100}`;

        aircrafts.push({ id: `ac-${i}`, x, y, dx, dy, callsign });
      }
      return aircrafts;
    };

    dispatch({ type: 'SET_AIRCRAFTS', payload: generateInitialAircrafts() });
  }, []);

  // Actualiza las posiciones cada 2 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'UPDATE_AIRCRAFT_POSITIONS' });
    }, 2000);

    // Limpia el intervalo cuando el componente se desmonta
    return () => clearInterval(interval);
  }, []);

  return (
    <AircraftContext.Provider value={{ state, dispatch }}>
      {children}
    </AircraftContext.Provider>
  );
};