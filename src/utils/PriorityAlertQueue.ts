// src/utils/PriorityAlertQueue.ts

import { Aircraft } from '../models/Aircraft';

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

export class PriorityAlertQueue {
  private head: AlertNode | null = null;
  private size: number = 0;

  enqueue(aircraft: Aircraft, priority: number): void {
    const newNode = new AlertNode(aircraft, priority, Date.now());
    this.size++;

    if (!this.head || priority > this.head.priority || 
        (priority === this.head.priority && newNode.timestamp < this.head.timestamp)) {
      newNode.next = this.head;
      this.head = newNode;
      return;
    }

    let current = this.head;
    while (current.next !== null && 
           (current.next.priority > priority || 
            (current.next.priority === priority && current.next.timestamp <= newNode.timestamp))) {
      current = current.next;
    }

    newNode.next = current.next;
    current.next = newNode;
  }

  dequeue(): Aircraft | null {
    if (!this.head) return null;
    
    const aircraft = this.head.aircraft;
    this.head = this.head.next;
    this.size--;
    return aircraft;
  }

  peek(): Aircraft | null {
    return this.head ? this.head.aircraft : null;
  }

  isEmpty(): boolean {
    return this.head === null;
  }

  getSize(): number {
    return this.size;
  }

  toArray(): Aircraft[] {
    const result: Aircraft[] = [];
    let current = this.head;
    while (current !== null) {
      result.push(current.aircraft);
      current = current.next;
    }
    return result;
  }

  clear(): void {
    this.head = null;
    this.size = 0;
  }

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