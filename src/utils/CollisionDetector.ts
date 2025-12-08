// src/utils/CollisionDetector.ts

import { Aircraft } from '../models/Aircraft';
import type { CollisionPair } from '../models/types';
import { PriorityAlertQueue } from './PriorityAlertQueue';

export class CollisionDetector {
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

    const leftIndices = new Set<string>();
    const rightIndices = new Set<string>();

    for (let i = left; i <= mid; i++) {
      leftIndices.add(aircrafts[i].id);
    }
    for (let i = mid + 1; i <= right; i++) {
      rightIndices.add(aircrafts[i].id);
    }

    for (let i = 0; i < sortedByY.length; i++) {
      const acLeft = sortedByY[i];
      
      if (!leftIndices.has(acLeft.id)) continue;

      for (let j = i + 1; j < sortedByY.length; j++) {
        const acRight = sortedByY[j];
        
        if (!rightIndices.has(acRight.id)) continue;

        const distanceY = Math.abs(acLeft.y - acRight.y);
        
        if (distanceY > this.warningThreshold) {
          break;
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