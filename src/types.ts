export interface Question {
  id: string;
  category: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number; // 0, 1, 2, 3
  hint: string;
}

export type WeaponType = 'NORMAL' | 'SPREAD' | 'LASER';

export interface GameStats {
  score: number;
  enemiesDefeated: number;
  gatesCleared: number;
  totalGates: number;
  wrongAttempts: number;
  timeElapsed: number; // seconds
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  isCrouching: boolean;
  facingRight: boolean;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  weapon: WeaponType;
  shieldActive: boolean;
  shieldTimer: number; // seconds
  invulnerableTimer: number;
  aimAngle: 'FORWARD' | 'UP' | 'DIAGONAL_UP' | 'DOWN_CROUCH';
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  color: string;
  isEnemy: boolean;
  isLaser?: boolean;
  laserLength?: number;
  life: number;
}

export interface Enemy {
  id: number;
  type: 'SOLDIER' | 'TURRET' | 'BOSS';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  shootCooldown: number;
  facingRight: boolean;
  isGrounded: boolean;
  patrolRange?: [number, number];
}

export interface SupplyDrone {
  id: number;
  x: number;
  y: number;
  vx: number;
  hp: number;
  width: number;
  height: number;
  itemType: 'MUSHROOM' | 'SPREAD' | 'LASER';
  alive: boolean;
}

export interface DropItem {
  id: number;
  x: number;
  y: number;
  vy: number;
  type: 'MUSHROOM' | 'SPREAD' | 'LASER';
  width: number;
  height: number;
  isGrounded: boolean;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'GROUND' | 'FLOATING' | 'WATER';
}

export interface GateBarrier {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  cleared: boolean;
  questionIndex: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
}
