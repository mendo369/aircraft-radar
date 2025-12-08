// src/models/CollisionHistoryItem.ts

import { Aircraft } from './Aircraft';

export class CollisionHistoryItem {
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