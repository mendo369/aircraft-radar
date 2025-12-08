// src/hooks/useAircraft.ts

import { useContext } from 'react';
import { AircraftContext } from '../contexts/AircraftContext';

export const useAircraft = () => {
  const context = useContext(AircraftContext);
  if (!context) {
    throw new Error('useAircraft must be used within an AircraftProvider');
  }
  return context;
};