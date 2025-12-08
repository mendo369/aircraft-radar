// src/models/Aircraft.ts

export class Aircraft {
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