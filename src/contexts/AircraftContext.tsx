import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Clase para representar un avión como un nodo
class Aircraft {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  callsign: string;
  collisionState: 'safe' | 'warning' | 'danger' | 'collision';
  passengers: number;
  pilotName: string;
  origin: string;
  destination: string;

  constructor(
    id: string,
    x: number,
    y: number,
    dx: number,
    dy: number,
    callsign: string,
    passengers: number,
    pilotName: string,
    origin: string,
    destination: string,
    collisionState: 'safe' | 'warning' | 'danger' | 'collision' = 'safe'
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.callsign = callsign;
    this.passengers = passengers;
    this.pilotName = pilotName;
    this.origin = origin;
    this.destination = destination;
    this.collisionState = collisionState;
  }

  distanceTo(other: Aircraft): number {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
  }

  updatePosition(): Aircraft {
    if (this.collisionState === 'collision') {
      return this;
    }

    let newX = this.x + this.dx;
    let newY = this.y + this.dy;
    let newDx = this.dx;
    let newDy = this.dy;

    if (newX < 0 || newX > 100) {
      newX = this.x;
      newDx = -this.dx;
    }
    if (newY < 0 || newY > 100) {
      newY = this.y;
      newDy = -this.dy;
    }

    return new Aircraft(
      this.id,
      newX,
      newY,
      newDx,
      newDy,
      this.callsign,
      this.passengers,
      this.pilotName,
      this.origin,
      this.destination,
      this.collisionState
    );
  }

  withCollisionState(state: 'safe' | 'warning' | 'danger' | 'collision'): Aircraft {
    return new Aircraft(
      this.id,
      this.x,
      this.y,
      this.dx,
      this.dy,
      this.callsign,
      this.passengers,
      this.pilotName,
      this.origin,
      this.destination,
      state
    );
  }

  toJSON() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      dx: this.dx,
      dy: this.dy,
      callsign: this.callsign,
      collisionState: this.collisionState,
      passengers: this.passengers,
      pilotName: this.pilotName,
      origin: this.origin,
      destination: this.destination
    };
  }
}

// Nodo para la cola de prioridad
class AlertNode {
  aircraft: Aircraft;
  priority: number; // 3 = collision, 2 = danger, 1 = warning
  timestamp: number;
  next: AlertNode | null;

  constructor(aircraft: Aircraft, priority: number, timestamp: number) {
    this.aircraft = aircraft;
    this.priority = priority;
    this.timestamp = timestamp;
    this.next = null;
  }
}

// Cola de prioridad para alertas de colisión (implementada como lista enlazada)
class PriorityAlertQueue {
  private head: AlertNode | null = null;
  private size: number = 0;

  // Encolar con prioridad (mayor prioridad = más grave)
  enqueue(aircraft: Aircraft, priority: number): void {
    const newNode = new AlertNode(aircraft, priority, Date.now());
    this.size++;

    // Si la cola está vacía o el nuevo nodo tiene mayor prioridad que el head
    if (!this.head || priority > this.head.priority || 
        (priority === this.head.priority && newNode.timestamp < this.head.timestamp)) {
      newNode.next = this.head;
      this.head = newNode;
      return;
    }

    // Buscar la posición correcta según prioridad y timestamp
    let current = this.head;
    while (current.next !== null && 
           (current.next.priority > priority || 
            (current.next.priority === priority && current.next.timestamp <= newNode.timestamp))) {
      current = current.next;
    }

    newNode.next = current.next;
    current.next = newNode;
  }

  // Desencolar (retorna el de mayor prioridad)
  dequeue(): Aircraft | null {
    if (!this.head) return null;
    
    const aircraft = this.head.aircraft;
    this.head = this.head.next;
    this.size--;
    return aircraft;
  }

  // Ver el siguiente sin desencolarlo
  peek(): Aircraft | null {
    return this.head ? this.head.aircraft : null;
  }

  // Verificar si está vacía
  isEmpty(): boolean {
    return this.head === null;
  }

  // Obtener el tamaño
  getSize(): number {
    return this.size;
  }

  // Convertir a array para visualización
  toArray(): Aircraft[] {
    const result: Aircraft[] = [];
    let current = this.head;
    while (current !== null) {
      result.push(current.aircraft);
      current = current.next;
    }
    return result;
  }

  // Limpiar la cola
  clear(): void {
    this.head = null;
    this.size = 0;
  }

  // Verificar si un avión ya está en la cola
  contains(aircraftId: string): boolean {
    let current = this.head;
    while (current !== null) {
      if (current.aircraft.id === aircraftId) {
        return true;
      }
      current = current.next;
    }
    return false;
  }
}

// Clase para el historial de colisiones
class CollisionHistoryItem {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  callsign: string;
  passengers: number;
  pilotName: string;
  origin: string;
  destination: string;
  finalCollisionState: 'warning' | 'danger' | 'collision';
  timestamp: number;

  constructor(aircraft: Aircraft, finalState: 'warning' | 'danger' | 'collision') {
    this.id = aircraft.id;
    this.x = aircraft.x;
    this.y = aircraft.y;
    this.dx = aircraft.dx;
    this.dy = aircraft.dy;
    this.callsign = aircraft.callsign;
    this.passengers = aircraft.passengers;
    this.pilotName = aircraft.pilotName;
    this.origin = aircraft.origin;
    this.destination = aircraft.destination;
    this.finalCollisionState = finalState;
    this.timestamp = Date.now();
  }

  toJSON() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      dx: this.dx,
      dy: this.dy,
      callsign: this.callsign,
      passengers: this.passengers,
      pilotName: this.pilotName,
      origin: this.origin,
      destination: this.destination,
      finalCollisionState: this.finalCollisionState,
      timestamp: this.timestamp
    };
  }
}

// Tupla para pares de colisión
type CollisionPair = [Aircraft, Aircraft, number];

// Clase para detectar colisiones usando Divide y Vencerás
class CollisionDetector {
  private warningThreshold: number = 10;
  private dangerThreshold: number = 1;

  detectCollisions(
    aircrafts: Aircraft[], 
    alertQueue: PriorityAlertQueue
  ): Map<string, 'safe' | 'warning' | 'danger' | 'collision'> {
    const collisionStates = new Map<string, 'safe' | 'warning' | 'danger' | 'collision'>();
    
    aircrafts.forEach(ac => {
      collisionStates.set(ac.id, ac.collisionState === 'collision' ? 'collision' : 'safe');
    });

    // 🔑 PASO 1: Ordena UNA SOLA VEZ por Y al inicio O(n log n)
    const sortedByY = [...aircrafts].sort((a, b) => a.y - b.y);

    // PASO 2: Usa divide y conquista pasando la lista ordenada
    const pairs = this.divideAndConquer(aircrafts, sortedByY, 0, aircrafts.length - 1);

    // Procesar pares y encolar alertas
    pairs.forEach(([ac1, ac2, distance]) => {
      if (ac1.collisionState !== 'collision' && ac2.collisionState !== 'collision') {
        let newState: 'warning' | 'danger' | 'collision' | null = null;
        let priority = 0;

        if (distance < this.dangerThreshold) {
          newState = 'collision';
          priority = 3;
          collisionStates.set(ac1.id, 'collision');
          collisionStates.set(ac2.id, 'collision');
        } else if (distance < this.warningThreshold / 2) {
          newState = 'danger';
          priority = 2;
          const state1 = collisionStates.get(ac1.id);
          const state2 = collisionStates.get(ac2.id);
          if (state1 !== 'collision') collisionStates.set(ac1.id, 'danger');
          if (state2 !== 'collision') collisionStates.set(ac2.id, 'danger');
        } else if (distance < this.warningThreshold) {
          newState = 'warning';
          priority = 1;
          const state1 = collisionStates.get(ac1.id);
          const state2 = collisionStates.get(ac2.id);
          if (state1 !== 'collision' && state1 !== 'danger') collisionStates.set(ac1.id, 'warning');
          if (state2 !== 'collision' && state2 !== 'danger') collisionStates.set(ac2.id, 'warning');
        }

        // Encolar en la cola de prioridad si hay alerta y no está ya encolado
        if (newState && priority > 0) {
          if (!alertQueue.contains(ac1.id)) {
            alertQueue.enqueue(ac1.withCollisionState(newState), priority);
          }
          if (!alertQueue.contains(ac2.id)) {
            alertQueue.enqueue(ac2.withCollisionState(newState), priority);
          }
        }
      }
    });

    return collisionStates;
  }

  private divideAndConquer(
    aircrafts: Aircraft[], 
    sortedByY: Aircraft[], 
    left: number, 
    right: number
  ): CollisionPair[] {
    if (right - left < 1) {
      return [];
    }

    if (right - left === 1) {
      const ac1 = aircrafts[left];
      const ac2 = aircrafts[right];
      const distance = ac1.distanceTo(ac2);
      if (distance < this.warningThreshold) {
        return [[ac1, ac2, distance]];
      }
      return [];
    }

    const mid = Math.floor((left + right) / 2);

    const leftPairs = this.divideAndConquer(aircrafts, sortedByY, left, mid);
    const rightPairs = this.divideAndConquer(aircrafts, sortedByY, mid + 1, right);
    
    // 🔑 findCrossPairsOptimized NO ORDENA, usa sortedByY existente
    const crossPairs = this.findCrossPairsOptimized(aircrafts, sortedByY, left, mid, right);

    return [...leftPairs, ...rightPairs, ...crossPairs];
  }

  private findCrossPairsOptimized(
    aircrafts: Aircraft[], 
    sortedByY: Aircraft[], 
    left: number, 
    mid: number, 
    right: number
  ): CollisionPair[] {
    const pairs: CollisionPair[] = [];

    // Crea sets de IDs para identificar qué aeronaves están en cada mitad
    const leftIndices = new Set<string>();
    const rightIndices = new Set<string>();

    for (let i = left; i <= mid; i++) {
      leftIndices.add(aircrafts[i].id);
    }
    for (let i = mid + 1; i <= right; i++) {
      rightIndices.add(aircrafts[i].id);
    }

    // 🔑 Itera sobre sortedByY (ya está ordenada por Y)
    // Esto es O(n) en el peor caso pero O(1) en promedio por el BREAK
    for (let i = 0; i < sortedByY.length; i++) {
      const acLeft = sortedByY[i];
      
      // Solo si está en la mitad izquierda
      if (!leftIndices.has(acLeft.id)) continue;

      // Busca en la mitad derecha
      for (let j = i + 1; j < sortedByY.length; j++) {
        const acRight = sortedByY[j];
        
        // Solo si está en la mitad derecha
        if (!rightIndices.has(acRight.id)) continue;

        const distanceY = Math.abs(acLeft.y - acRight.y);
        
        // 🔑 CRUCIAL: Si Y está fuera del rango, NO hay más pares cercanos
        // Porque sortedByY está ordenada por Y, todo lo que viene es más lejano
        if (distanceY > this.warningThreshold) {
          break; // Sin más pares cercanos en esta búsqueda
        }

        const distance = acLeft.distanceTo(acRight);
        
        if (distance < this.warningThreshold) {
          pairs.push([acLeft, acRight, distance]);
        }
      }
    }

    return pairs;
  }

}

// Acciones
type Action =
  | { type: 'SET_AIRCRAFTS'; payload: Aircraft[] }
  | { type: 'UPDATE_AIRCRAFT_POSITIONS' };

// Estado
interface AircraftState {
  aircrafts: Aircraft[];
  collisionHistory: CollisionHistoryItem[];
  alertQueue: PriorityAlertQueue; // Cola de prioridad para alertas
}

// Reducer
const aircraftReducer = (state: AircraftState, action: Action): AircraftState => {
  switch (action.type) {
    case 'SET_AIRCRAFTS':
      return { 
        ...state, 
        aircrafts: action.payload, 
        collisionHistory: [],
        alertQueue: new PriorityAlertQueue()
      };

    case 'UPDATE_AIRCRAFT_POSITIONS': {
      const updatedPositions = state.aircrafts.map(ac => ac.updatePosition());

      // Crear nueva cola para esta iteración
      const newAlertQueue = new PriorityAlertQueue();
      
      // Detectar colisiones y llenar la cola
      const detector = new CollisionDetector();
      const collisionStates = detector.detectCollisions(updatedPositions, newAlertQueue);

      const newCollisionHistoryItems: CollisionHistoryItem[] = [];
      const updatedAircrafts = updatedPositions.map(ac => {
        const newState = collisionStates.get(ac.id) || 'safe';
        
        if (newState === 'collision' && ac.collisionState !== 'collision') {
          if (!state.collisionHistory.some(item => item.id === ac.id)) {
            newCollisionHistoryItems.push(new CollisionHistoryItem(ac, 'collision'));
          }
        }

        return ac.withCollisionState(newState);
      });

      return {
        ...state,
        aircrafts: updatedAircrafts,
        collisionHistory: [...state.collisionHistory, ...newCollisionHistoryItems],
        alertQueue: newAlertQueue
      };
    }

    default:
      return state;
  }
};

const AircraftContext = createContext<{
  state: AircraftState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export const useAircraft = () => {
  const context = useContext(AircraftContext);
  if (!context) {
    throw new Error('useAircraft must be used within an AircraftProvider');
  }
  return context;
};

export const AircraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(aircraftReducer, { 
    aircrafts: [], 
    collisionHistory: [],
    alertQueue: new PriorityAlertQueue()
  });

  useEffect(() => {
    const generateRandomData = () => {
      const callsigns = ['AV', 'CO', 'LA', 'AA', 'BA'];
      const origins = ['JFK', 'LAX', 'CDG', 'FRA', 'HND', 'DXB', 'LHR', 'SYD'];
      const destinations = ['JFK', 'LAX', 'CDG', 'FRA', 'HND', 'DXB', 'LHR', 'SYD'];
      const pilotNames = ['Juan G.', 'Maria L.', 'Carlos R.', 'Ana P.', 'Luis T.', 'Sofia M.', 'Pedro D.'];

      return {
        callsign: `${callsigns[Math.floor(Math.random() * callsigns.length)]}-${Math.floor(Math.random() * 900) + 100}`,
        origin: origins[Math.floor(Math.random() * origins.length)],
        destination: destinations[Math.floor(Math.random() * destinations.length)],
        pilotName: pilotNames[Math.floor(Math.random() * pilotNames.length)],
        passengers: Math.floor(Math.random() * 200) + 50
      };
    };

    const generateInitialAircrafts = (): Aircraft[] => {
      const numAircrafts = Math.floor(Math.random() * 11) + 10;
      const aircrafts: Aircraft[] = [];
      const existingPositions: { x: number; y: number }[] = [];

      for (let i = 0; i < numAircrafts; i++) {
        let x: number, y: number;
        let attempts = 0;
        const maxAttempts = 50;

        do {
          x = parseFloat((Math.random() * 100).toFixed(2));
          y = parseFloat((Math.random() * 100).toFixed(2));
          attempts++;
        } while (
          existingPositions.some(pos => Math.abs(pos.x - x) < 5 && Math.abs(pos.y - y) < 5) && attempts < maxAttempts
        );

        if (attempts >= maxAttempts) break;

        existingPositions.push({ x, y });

        const dx = parseFloat((Math.random() * 1 - 0.5).toFixed(2));
        const dy = parseFloat((Math.random() * 1 - 0.5).toFixed(2));

        const { callsign, origin, destination, pilotName, passengers } = generateRandomData();

        aircrafts.push(new Aircraft(`ac-${i}`, x, y, dx, dy, callsign, passengers, pilotName, origin, destination));
      }
      return aircrafts;
    };

    dispatch({ type: 'SET_AIRCRAFTS', payload: generateInitialAircrafts() });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'UPDATE_AIRCRAFT_POSITIONS' });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AircraftContext.Provider value={{ state, dispatch }}>
      {children}
    </AircraftContext.Provider>
  );
};