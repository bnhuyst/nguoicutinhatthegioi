import React, { useRef, useEffect } from 'react';
import { 
  PlayerState, Bullet, Enemy, SupplyDrone, 
  DropItem, Platform, GateBarrier, Particle, 
  WeaponType, Question 
} from '../types';
import { sound } from '../utils/sound';

interface Props {
  isPaused: boolean;
  activeQuestions: Question[];
  onEncounterGate: (gateIndex: number, question: Question) => void;
  onPlayerDeath: () => void;
  onVictory: () => void;
  onStatsUpdate: (score: number, enemiesKilled: number, gatesCleared: number) => void;
  onPlayerStatusChange: (hp: number, maxHp: number, mana: number, maxMana: number, weapon: WeaponType, shieldTime: number) => void;
  onTimeOfDayChange: (timeName: 'NGÀY' | 'HOÀNG HÔN' | 'ĐÊM', progress: number) => void;
  virtualInput: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    shoot: boolean;
    skill: boolean;
  };
}

export const ContraCanvas: React.FC<Props> = ({
  isPaused,
  activeQuestions,
  onEncounterGate,
  onPlayerDeath,
  onVictory,
  onStatsUpdate,
  onPlayerStatusChange,
  onTimeOfDayChange,
  virtualInput,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Use refs for full mutable 60fps game state without react re-renders
  const stateRef = useRef({
    score: 0,
    enemiesKilled: 0,
    gatesClearedCount: 0,
    cameraX: 0,
    dayNightTimer: 0, // 0 - 90 seconds
    levelWidth: 6200,

    player: {
      x: 100,
      y: 350,
      vx: 0,
      vy: 0,
      width: 32,
      height: 48,
      isGrounded: false,
      isCrouching: false,
      facingRight: true,
      hp: 100,
      maxHp: 100,
      mana: 100,
      maxMana: 100,
      weapon: 'NORMAL' as WeaponType,
      shieldActive: false,
      shieldTimer: 0,
      invulnerableTimer: 0,
      aimAngle: 'FORWARD' as 'FORWARD' | 'UP' | 'DIAGONAL_UP' | 'DOWN_CROUCH',
    } as PlayerState,

    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      shoot: false,
      skill: false,
    },

    shootCooldown: 0,
    droneSpawnTimer: 5, // spawns initial supply drone soon
    enemySpawnTimer: 3,

    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    drones: [] as SupplyDrone[],
    drops: [] as DropItem[],
    platforms: [] as Platform[],
    gates: [] as GateBarrier[],
    particles: [] as Particle[],
  });

  // Initialize level platforms, gates, and enemies once
  useEffect(() => {
    const s = stateRef.current;
    
    // Reset state
    s.score = 0;
    s.enemiesKilled = 0;
    s.gatesClearedCount = 0;
    s.cameraX = 0;
    s.dayNightTimer = 0;
    s.bullets = [];
    s.enemies = [];
    s.drones = [];
    s.drops = [];
    s.particles = [];

    s.player.x = 100;
    s.player.y = 350;
    s.player.vx = 0;
    s.player.vy = 0;
    s.player.hp = 100;
    s.player.mana = 100;
    s.player.weapon = 'NORMAL';
    s.player.shieldActive = false;
    s.player.shieldTimer = 0;
    s.player.invulnerableTimer = 0;

    // Build multi-tier platforms
    const plats: Platform[] = [
      // Ground sections with water/pit gaps
      { x: 0, y: 440, width: 1300, height: 80, type: 'GROUND' },
      { x: 1400, y: 440, width: 1400, height: 80, type: 'GROUND' },
      { x: 2900, y: 440, width: 1400, height: 80, type: 'GROUND' },
      { x: 4400, y: 440, width: 1800, height: 80, type: 'GROUND' },

      // Floating Catwalks & Platforms
      { x: 250, y: 340, width: 180, height: 16, type: 'FLOATING' },
      { x: 500, y: 260, width: 200, height: 16, type: 'FLOATING' },
      { x: 800, y: 340, width: 220, height: 16, type: 'FLOATING' },
      { x: 1080, y: 280, width: 160, height: 16, type: 'FLOATING' },

      // Mid area platforms
      { x: 1550, y: 330, width: 200, height: 16, type: 'FLOATING' },
      { x: 1850, y: 250, width: 240, height: 16, type: 'FLOATING' },
      { x: 2200, y: 330, width: 220, height: 16, type: 'FLOATING' },
      { x: 2500, y: 270, width: 200, height: 16, type: 'FLOATING' },

      // Later area platforms
      { x: 3100, y: 340, width: 220, height: 16, type: 'FLOATING' },
      { x: 3400, y: 260, width: 260, height: 16, type: 'FLOATING' },
      { x: 3750, y: 340, width: 240, height: 16, type: 'FLOATING' },
      { x: 4100, y: 280, width: 200, height: 16, type: 'FLOATING' },

      // Boss arena elevated defense decks
      { x: 4600, y: 330, width: 250, height: 16, type: 'FLOATING' },
      { x: 4950, y: 260, width: 300, height: 16, type: 'FLOATING' },
      { x: 5350, y: 330, width: 260, height: 16, type: 'FLOATING' },
    ];
    s.platforms = plats;

    // Generate Gates based on available questions (up to 4 gates)
    const numGates = Math.min(4, Math.max(1, activeQuestions.length));
    const gatePositions = [1200, 2650, 4150, 5600];
    const newGates: GateBarrier[] = [];

    // Shuffle question indices so each playthrough gets a randomized variety of questions
    const shuffledIndices = activeQuestions
      .map((_, idx) => idx)
      .sort(() => Math.random() - 0.5);

    for (let i = 0; i < numGates; i++) {
      newGates.push({
        id: i + 1,
        x: gatePositions[i] || (1200 + i * 1400),
        y: 200,
        width: 38,
        height: 240,
        cleared: false,
        questionIndex: shuffledIndices[i % shuffledIndices.length],
      });
    }
    s.gates = newGates;

    // Initial Turrets on elevated platforms
    s.enemies = [
      { id: 1, type: 'TURRET', x: 580, y: 226, vx: 0, vy: 0, width: 34, height: 34, hp: 50, maxHp: 50, shootCooldown: 1.5, facingRight: false, isGrounded: true },
      { id: 2, type: 'TURRET', x: 1950, y: 216, vx: 0, vy: 0, width: 34, height: 34, hp: 50, maxHp: 50, shootCooldown: 2.0, facingRight: false, isGrounded: true },
      { id: 3, type: 'TURRET', x: 3500, y: 226, vx: 0, vy: 0, width: 34, height: 34, hp: 60, maxHp: 60, shootCooldown: 1.8, facingRight: false, isGrounded: true },
      { id: 4, type: 'BOSS', x: 5100, y: 310, vx: 0, vy: 0, width: 80, height: 130, hp: 450, maxHp: 450, shootCooldown: 2.0, facingRight: false, isGrounded: true },
    ];

    // Initial supply drone
    s.drones.push({
      id: 1,
      x: 300,
      y: 110,
      vx: 1.8,
      hp: 1,
      width: 44,
      height: 24,
      itemType: 'SPREAD',
      alive: true,
    });
  }, [activeQuestions]);

  // Synchronize virtual controller input with game keys
  useEffect(() => {
    const k = stateRef.current.keys;
    k.left = virtualInput.left;
    k.right = virtualInput.right;
    k.up = virtualInput.up;
    k.down = virtualInput.down;
    k.shoot = virtualInput.shoot;
    k.skill = virtualInput.skill;
  }, [virtualInput]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept keys if an input/textarea has focus
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      const k = stateRef.current.keys;
      const code = e.code;

      if (code === 'KeyA' || code === 'ArrowLeft') {
        k.left = true;
      }
      if (code === 'KeyD' || code === 'ArrowRight') {
        k.right = true;
      }
      if (code === 'KeyW' || code === 'Space' || code === 'ArrowUp') {
        k.up = true;
      }
      if (code === 'KeyS' || code === 'ArrowDown') {
        k.down = true;
      }
      if (code === 'KeyJ') {
        k.shoot = true;
      }
      if (code === 'KeyK') {
        k.skill = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = stateRef.current.keys;
      const code = e.code;

      if (code === 'KeyA' || code === 'ArrowLeft') {
        k.left = false;
      }
      if (code === 'KeyD' || code === 'ArrowRight') {
        k.right = false;
      }
      if (code === 'KeyW' || code === 'Space' || code === 'ArrowUp') {
        k.up = false;
      }
      if (code === 'KeyS' || code === 'ArrowDown') {
        k.down = false;
      }
      if (code === 'KeyJ') {
        k.shoot = false;
      }
      if (code === 'KeyK') {
        k.skill = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 60fps Game Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05); // cap delta time to 50ms
      lastTime = time;

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      const s = stateRef.current;
      const p = s.player;

      // UPDATE GAME LOGIC (ONLY IF NOT PAUSED)
      if (!isPaused) {
        // 1. Day / Night Cycle (90 seconds cycle: 0-35 Day, 35-55 Sunset, 55-90 Night)
        s.dayNightTimer = (s.dayNightTimer + dt) % 90;
        let timeName: 'NGÀY' | 'HOÀNG HÔN' | 'ĐÊM' = 'NGÀY';
        if (s.dayNightTimer >= 35 && s.dayNightTimer < 55) {
          timeName = 'HOÀNG HÔN';
        } else if (s.dayNightTimer >= 55) {
          timeName = 'ĐÊM';
        }
        onTimeOfDayChange(timeName, s.dayNightTimer / 90);

        // 2. Mana regen over time (+4 mana per second)
        if (p.mana < p.maxMana) {
          p.mana = Math.min(p.maxMana, p.mana + dt * 4);
        }

        // 3. Shield cooldown/timer
        if (p.shieldActive) {
          p.shieldTimer -= dt;
          if (p.shieldTimer <= 0) {
            p.shieldActive = false;
          }
        }
        if (p.invulnerableTimer > 0) {
          p.invulnerableTimer -= dt;
        }

        // 4. Activate Mana Skill (Key K): 40 Mana for 5-second Shield
        if (s.keys.skill && p.mana >= 40 && !p.shieldActive) {
          p.mana -= 40;
          p.shieldActive = true;
          p.shieldTimer = 5.0;
          sound.playSkillShield();
          // Add burst particles around player
          for (let i = 0; i < 20; i++) {
            s.particles.push({
              x: p.x + p.width / 2,
              y: p.y + p.height / 2,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              color: '#06b6d4',
              size: Math.random() * 4 + 2,
              alpha: 1,
              decay: 0.03,
            });
          }
        }

        // 5. Player Crouching & Aim Direction
        p.isCrouching = s.keys.down && p.isGrounded;
        const currentHeight = p.isCrouching ? 26 : 48;
        p.height = currentHeight;

        if (s.keys.up && (s.keys.left || s.keys.right)) {
          p.aimAngle = 'DIAGONAL_UP';
        } else if (s.keys.up) {
          p.aimAngle = 'UP';
        } else if (p.isCrouching) {
          p.aimAngle = 'DOWN_CROUCH';
        } else {
          p.aimAngle = 'FORWARD';
        }

        // 6. Player Horizontal Movement
        const speed = p.isCrouching ? 2.0 : 4.6;
        if (s.keys.left && !s.keys.right) {
          p.vx = -speed;
          p.facingRight = false;
        } else if (s.keys.right && !s.keys.left) {
          p.vx = speed;
          p.facingRight = true;
        } else {
          p.vx = 0;
        }

        // 7. Player Jump
        if (s.keys.up && p.isGrounded) {
          p.vy = -11.5;
          p.isGrounded = false;
          sound.playJump();
        }

        // Gravity
        p.vy += 0.55;
        p.x += p.vx;
        p.y += p.vy;

        // Keep player in level bounds
        if (p.x < 0) p.x = 0;
        if (p.x > s.levelWidth - 100) p.x = s.levelWidth - 100;

        // Pit death check
        if (p.y > 600) {
          p.hp = 0;
          onPlayerDeath();
        }

        // Platform collision
        p.isGrounded = false;
        s.platforms.forEach(plat => {
          if (
            p.x + p.width > plat.x &&
            p.x < plat.x + plat.width &&
            p.y + p.height >= plat.y &&
            p.y + p.height <= plat.y + 20 &&
            p.vy >= 0
          ) {
            p.y = plat.y - p.height;
            p.vy = 0;
            p.isGrounded = true;
          }
        });

        // 8. Player Shooting
        s.shootCooldown -= dt;
        if (s.keys.shoot && s.shootCooldown <= 0) {
          let bulletVx = p.facingRight ? 12 : -12;
          let bulletVy = 0;
          let bulletX = p.facingRight ? p.x + p.width + 4 : p.x - 4;
          let bulletY = p.y + (p.isCrouching ? 14 : 20);

          if (p.aimAngle === 'UP') {
            bulletVx = 0;
            bulletVy = -13;
            bulletX = p.x + p.width / 2;
            bulletY = p.y - 4;
          } else if (p.aimAngle === 'DIAGONAL_UP') {
            bulletVx = p.facingRight ? 9 : -9;
            bulletVy = -9;
            bulletX = p.facingRight ? p.x + p.width : p.x;
            bulletY = p.y + 8;
          }

          if (p.weapon === 'NORMAL') {
            s.shootCooldown = 0.16;
            sound.playShootNormal();
            s.bullets.push({
              id: Math.random(),
              x: bulletX,
              y: bulletY,
              vx: bulletVx,
              vy: bulletVy,
              radius: 4,
              damage: 22,
              color: '#ef4444',
              isEnemy: false,
              life: 1.2,
            });
          } else if (p.weapon === 'SPREAD') {
            s.shootCooldown = 0.24;
            sound.playShootSpread();
            // 3 spreading bullets in fan arc
            const spreadAngles = [-0.22, 0, 0.22];
            const baseAngle = Math.atan2(bulletVy, bulletVx);
            spreadAngles.forEach(offset => {
              const ang = baseAngle + offset;
              const spd = 12;
              s.bullets.push({
                id: Math.random(),
                x: bulletX,
                y: bulletY,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                radius: 5,
                damage: 25,
                color: '#f59e0b',
                isEnemy: false,
                life: 1.0,
              });
            });
          } else if (p.weapon === 'LASER') {
            s.shootCooldown = 0.28;
            sound.playShootLaser();
            s.bullets.push({
              id: Math.random(),
              x: bulletX,
              y: bulletY,
              vx: bulletVx * 1.4,
              vy: bulletVy * 1.4,
              radius: 6,
              damage: 48,
              color: '#06b6d4',
              isEnemy: false,
              isLaser: true,
              laserLength: 32,
              life: 1.2,
            });
          }
        }

        // 9. Update Bullets
        s.bullets.forEach(b => {
          b.x += b.vx;
          b.y += b.vy;
          b.life -= dt;
        });
        s.bullets = s.bullets.filter(b => b.life > 0);

        // 10. Supply Drones (Hộp tiếp tế bay)
        s.droneSpawnTimer -= dt;
        if (s.droneSpawnTimer <= 0) {
          s.droneSpawnTimer = 14 + Math.random() * 8;
          const types: Array<'MUSHROOM' | 'SPREAD' | 'LASER'> = ['MUSHROOM', 'SPREAD', 'LASER'];
          const chosen = types[Math.floor(Math.random() * types.length)];
          s.drones.push({
            id: Math.random(),
            x: s.cameraX - 50,
            y: 90 + Math.random() * 80,
            vx: 2.2,
            hp: 1,
            width: 46,
            height: 26,
            itemType: chosen,
            alive: true,
          });
        }

        s.drones.forEach(d => {
          d.x += d.vx;
          // Check collision with player bullets
          s.bullets.forEach(b => {
            if (!b.isEnemy && d.alive) {
              if (
                b.x >= d.x &&
                b.x <= d.x + d.width &&
                b.y >= d.y &&
                b.y <= d.y + d.height
              ) {
                d.alive = false;
                b.life = 0;
                sound.playExplosion();
                // Spawn dropped item
                s.drops.push({
                  id: Math.random(),
                  x: d.x + d.width / 2 - 14,
                  y: d.y + d.height,
                  vy: 1,
                  type: d.itemType,
                  width: 28,
                  height: 28,
                  isGrounded: false,
                });
                // Explosion particles
                for (let i = 0; i < 15; i++) {
                  s.particles.push({
                    x: d.x + d.width / 2,
                    y: d.y + d.height / 2,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    color: '#facc15',
                    size: Math.random() * 4 + 2,
                    alpha: 1,
                    decay: 0.04,
                  });
                }
              }
            }
          });
        });
        s.drones = s.drones.filter(d => d.alive && d.x < s.cameraX + 1000);

        // 11. Drop Items falling & pickup
        s.drops.forEach(drop => {
          if (!drop.isGrounded) {
            drop.vy += 0.3;
            drop.y += drop.vy;
            s.platforms.forEach(plat => {
              if (
                drop.x + drop.width > plat.x &&
                drop.x < plat.x + plat.width &&
                drop.y + drop.height >= plat.y &&
                drop.y + drop.height <= plat.y + 15
              ) {
                drop.y = plat.y - drop.height;
                drop.vy = 0;
                drop.isGrounded = true;
              }
            });
          }

          // Pickup by player
          if (
            p.x + p.width > drop.x &&
            p.x < drop.x + drop.width &&
            p.y + p.height > drop.y &&
            p.y < drop.y + drop.height
          ) {
            sound.playItemPickup();
            if (drop.type === 'MUSHROOM') {
              p.hp = p.maxHp;
              p.mana = p.maxMana;
              s.score += 200;
            } else if (drop.type === 'SPREAD') {
              p.weapon = 'SPREAD';
              s.score += 150;
            } else if (drop.type === 'LASER') {
              p.weapon = 'LASER';
              s.score += 150;
            }
            drop.y = -9999; // destroy
            // Sparkle particles
            for (let i = 0; i < 16; i++) {
              s.particles.push({
                x: p.x + p.width / 2,
                y: p.y + p.height / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: drop.type === 'MUSHROOM' ? '#10b981' : drop.type === 'SPREAD' ? '#ef4444' : '#06b6d4',
                size: Math.random() * 4 + 2,
                alpha: 1,
                decay: 0.03,
              });
            }
          }
        });
        s.drops = s.drops.filter(d => d.y > 0 && d.y < 600);

        // 12. Enemy Spawning & AI
        s.enemySpawnTimer -= dt;
        if (s.enemySpawnTimer <= 0) {
          s.enemySpawnTimer = 3.5 + Math.random() * 2.5;
          // Spawn a patrol soldier running from right of camera
          const spawnX = s.cameraX + 850;
          if (spawnX < s.levelWidth - 300) {
            s.enemies.push({
              id: Math.random(),
              type: 'SOLDIER',
              x: spawnX,
              y: 350,
              vx: -2.0,
              vy: 0,
              width: 30,
              height: 44,
              hp: 25,
              maxHp: 25,
              shootCooldown: 1.8 + Math.random() * 1.2,
              facingRight: false,
              isGrounded: false,
            });
          }
        }

        // Update Enemies
        s.enemies.forEach(en => {
          if (en.type === 'SOLDIER') {
            en.vy += 0.55;
            en.x += en.vx;
            en.y += en.vy;

            // Platform collision
            en.isGrounded = false;
            s.platforms.forEach(plat => {
              if (
                en.x + en.width > plat.x &&
                en.x < plat.x + plat.width &&
                en.y + en.height >= plat.y &&
                en.y + en.height <= plat.y + 15
              ) {
                en.y = plat.y - en.height;
                en.vy = 0;
                en.isGrounded = true;
              }
            });

            // Turn around if near edge or wall
            if (en.x < s.cameraX - 100) en.hp = 0; // despawn

            // Shoot at player
            en.shootCooldown -= dt;
            const dist = Math.abs(en.x - p.x);
            if (dist < 550 && en.shootCooldown <= 0) {
              en.shootCooldown = 2.4 + Math.random() * 1.5;
              const aimLeft = p.x < en.x;
              en.facingRight = !aimLeft;
              s.bullets.push({
                id: Math.random(),
                x: aimLeft ? en.x - 4 : en.x + en.width + 4,
                y: en.y + 18,
                vx: aimLeft ? -6.5 : 6.5,
                vy: (p.y - en.y) * 0.015,
                radius: 5,
                damage: 15,
                color: '#ea580c',
                isEnemy: true,
                life: 2.0,
              });
            }
          } else if (en.type === 'TURRET') {
            en.shootCooldown -= dt;
            const dist = Math.abs(en.x - p.x);
            if (dist < 600 && en.shootCooldown <= 0) {
              en.shootCooldown = 2.6;
              const angle = Math.atan2(p.y - en.y, p.x - en.x);
              s.bullets.push({
                id: Math.random(),
                x: en.x + en.width / 2,
                y: en.y + en.height / 2,
                vx: Math.cos(angle) * 6,
                vy: Math.sin(angle) * 6,
                radius: 5,
                damage: 20,
                color: '#dc2626',
                isEnemy: true,
                life: 2.2,
              });
            }
          } else if (en.type === 'BOSS') {
            // Boss AI
            en.shootCooldown -= dt;
            const dist = Math.abs(en.x - p.x);
            if (dist < 700 && en.shootCooldown <= 0) {
              en.shootCooldown = 2.2;
              // Triple missile spread
              [-0.2, 0, 0.2].forEach(offset => {
                const angle = Math.atan2(p.y - en.y, p.x - en.x) + offset;
                s.bullets.push({
                  id: Math.random(),
                  x: en.x,
                  y: en.y + 40,
                  vx: Math.cos(angle) * 6.5,
                  vy: Math.sin(angle) * 6.5,
                  radius: 7,
                  damage: 25,
                  color: '#ef4444',
                  isEnemy: true,
                  life: 2.5,
                });
              });
            }
          }

          // Bullet hits on enemy
          s.bullets.forEach(b => {
            if (!b.isEnemy && en.hp > 0) {
              if (
                b.x >= en.x &&
                b.x <= en.x + en.width &&
                b.y >= en.y &&
                b.y <= en.y + en.height
              ) {
                en.hp -= b.damage;
                if (!b.isLaser) b.life = 0; // lasers pierce!
                sound.playHit();

                // Spark particle
                s.particles.push({
                  x: b.x,
                  y: b.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  color: '#f97316',
                  size: 3,
                  alpha: 1,
                  decay: 0.05,
                });

                if (en.hp <= 0) {
                  sound.playExplosion();
                  s.enemiesKilled++;
                  s.score += en.type === 'BOSS' ? 1000 : en.type === 'TURRET' ? 150 : 100;
                  // Explosion fragments
                  for (let i = 0; i < (en.type === 'BOSS' ? 35 : 12); i++) {
                    s.particles.push({
                      x: en.x + en.width / 2,
                      y: en.y + en.height / 2,
                      vx: (Math.random() - 0.5) * 7,
                      vy: (Math.random() - 0.5) * 7,
                      color: '#f97316',
                      size: Math.random() * 5 + 3,
                      alpha: 1,
                      decay: 0.03,
                    });
                  }
                  // If boss killed and all gates cleared -> VICTORY!
                  if (en.type === 'BOSS' && s.gatesClearedCount >= s.gates.length) {
                    onVictory();
                  }
                }
              }
            }
          });
        });
        s.enemies = s.enemies.filter(en => en.hp > 0);

        // 13. Enemy Bullets Hit Player
        s.bullets.forEach(b => {
          if (b.isEnemy && b.life > 0) {
            // Check shield reflection / absorption
            if (p.shieldActive) {
              const shieldRadius = 40;
              const px = p.x + p.width / 2;
              const py = p.y + p.height / 2;
              const dx = b.x - px;
              const dy = b.y - py;
              if (Math.hypot(dx, dy) < shieldRadius) {
                b.life = 0;
                sound.playSkillShield();
                // Shield particle flash
                for (let i = 0; i < 6; i++) {
                  s.particles.push({
                    x: b.x,
                    y: b.y,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    color: '#06b6d4',
                    size: 3,
                    alpha: 1,
                    decay: 0.06,
                  });
                }
                return;
              }
            }

            // Normal damage to player
            if (
              b.x >= p.x &&
              b.x <= p.x + p.width &&
              b.y >= p.y &&
              b.y <= p.y + p.height
            ) {
              b.life = 0;
              if (p.invulnerableTimer <= 0) {
                p.hp -= b.damage;
                p.invulnerableTimer = 0.5; // brief iframe
                sound.playHit();
                if (p.hp <= 0) {
                  p.hp = 0;
                  onPlayerDeath();
                }
              }
            }
          }
        });

        // 14. Gate Barrier Collision (TRẮC NGHIỆM PHONG ẤN)
        s.gates.forEach((gate, gIdx) => {
          if (!gate.cleared) {
            // Check if player runs into the gate barrier
            if (
              p.x + p.width >= gate.x &&
              p.x <= gate.x + gate.width &&
              p.y + p.height >= gate.y &&
              p.y <= gate.y + gate.height
            ) {
              // Immediately freeze player right at the gate
              p.x = gate.x - p.width - 2;
              p.vx = 0;
              sound.playBarrierEncounter();
              const q = activeQuestions[gate.questionIndex] || activeQuestions[0];
              onEncounterGate(gIdx, q);
            }
          }
        });

        // Check if player reached the very end after all gates cleared
        if (p.x > 5800 && s.gatesClearedCount >= s.gates.length) {
          onVictory();
        }

        // 15. Smooth Camera Tracking
        const targetCamX = p.x - 220;
        s.cameraX += (targetCamX - s.cameraX) * 0.1;
        if (s.cameraX < 0) s.cameraX = 0;
        if (s.cameraX > s.levelWidth - 800) s.cameraX = s.levelWidth - 800;

        // 16. Update Particles
        s.particles.forEach(pt => {
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.alpha -= pt.decay;
        });
        s.particles = s.particles.filter(pt => pt.alpha > 0);

        // Notify parent of status
        onPlayerStatusChange(
          Math.max(0, Math.floor(p.hp)),
          p.maxHp,
          Math.max(0, Math.floor(p.mana)),
          p.maxMana,
          p.weapon,
          Math.max(0, p.shieldTimer)
        );
        onStatsUpdate(s.score, s.enemiesKilled, s.gatesClearedCount);
      }

      // ==========================================
      // RENDERING (CANVAS 60FPS PIXEL ART)
      // ==========================================
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      // 1. SKY GRADIENT (Day -> Sunset -> Night)
      let skyTop = '#38bdf8';
      let skyBottom = '#0284c7';
      if (s.dayNightTimer >= 35 && s.dayNightTimer < 55) {
        // Sunset
        skyTop = '#c2410c';
        skyBottom = '#7c2d12';
      } else if (s.dayNightTimer >= 55) {
        // Night
        skyTop = '#020617';
        skyBottom = '#0f172a';
      }

      const skyGrad = ctx.createLinearGradient(0, 0, 0, ch);
      skyGrad.addColorStop(0, skyTop);
      skyGrad.addColorStop(1, skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, cw, ch);

      // Night Stars & Moon
      if (s.dayNightTimer >= 50) {
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 40; i++) {
          const sx = (i * 47) % cw;
          const sy = (i * 29) % 200;
          ctx.fillRect(sx, sy, 2, 2);
        }
        // Crescent Moon
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(cw - 120, 70, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = skyTop;
        ctx.beginPath();
        ctx.arc(cw - 130, 65, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Parallax Mountain Ridges (Layer 1)
      ctx.save();
      const p1Offset = (s.cameraX * 0.2) % 300;
      ctx.fillStyle = s.dayNightTimer >= 55 ? '#1e293b' : s.dayNightTimer >= 35 ? '#9a3412' : '#047857';
      ctx.beginPath();
      ctx.moveTo(-p1Offset, ch - 80);
      for (let x = -300; x < cw + 300; x += 150) {
        ctx.lineTo(x - p1Offset, ch - 220 + ((x % 300 === 0) ? -40 : 20));
      }
      ctx.lineTo(cw + 300, ch);
      ctx.lineTo(0, ch);
      ctx.fill();
      ctx.restore();

      // 3. Parallax Industrial Jungle Catwalks & Fortress (Layer 2)
      ctx.save();
      ctx.translate(-s.cameraX, 0);

      // Draw Platforms
      s.platforms.forEach(plat => {
        if (plat.type === 'GROUND') {
          // Top grass / metal strip
          ctx.fillStyle = '#15803d'; // moss green
          ctx.fillRect(plat.x, plat.y, plat.width, 8);
          // Rocky dirt body
          ctx.fillStyle = '#78350f'; // earth brown
          ctx.fillRect(plat.x, plat.y + 8, plat.width, plat.height - 8);
          // Pixel brick grid lines
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 1;
          for (let gx = plat.x; gx < plat.x + plat.width; gx += 32) {
            ctx.strokeRect(gx, plat.y + 8, 32, 16);
            ctx.strokeRect(gx + 16, plat.y + 24, 32, 16);
          }
        } else {
          // Floating steel catwalk
          ctx.fillStyle = '#334155';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(plat.x, plat.y, plat.width, 3);
          // Bolts
          ctx.fillStyle = '#f8fafc';
          for (let bx = plat.x + 8; bx < plat.x + plat.width; bx += 24) {
            ctx.fillRect(bx, plat.y + 6, 3, 3);
          }
        }
      });

      // 4. Draw Gates (Cyber Gate Barriers)
      s.gates.forEach((gate, idx) => {
        if (!gate.cleared) {
          // Holographic vertical barrier beam
          const grad = ctx.createLinearGradient(gate.x, 0, gate.x + gate.width, 0);
          grad.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
          grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.9)');
          grad.addColorStop(1, 'rgba(6, 182, 212, 0.2)');
          ctx.fillStyle = grad;
          ctx.fillRect(gate.x, gate.y, gate.width, gate.height);

          // Neon emitter posts at top & bottom
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(gate.x - 6, gate.y - 12, gate.width + 12, 16);
          ctx.fillRect(gate.x - 6, gate.y + gate.height - 4, gate.width + 12, 16);
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(gate.x - 2, gate.y - 8, gate.width + 4, 8);
          ctx.fillRect(gate.x - 2, gate.y + gate.height, gate.width + 4, 8);

          // Glowing barrier text/symbol
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`PHONG ẤN #${idx + 1}`, gate.x + gate.width / 2, gate.y + gate.height / 2);
          ctx.fillText(`TRẮC NGHIỆM`, gate.x + gate.width / 2, gate.y + gate.height / 2 + 18);
        }
      });

      // 5. Draw Supply Drones
      s.drones.forEach(d => {
        if (d.alive) {
          // Drone body
          ctx.fillStyle = '#475569';
          ctx.fillRect(d.x, d.y, d.width, d.height);
          // Blinking red beacon
          ctx.fillStyle = Math.floor(Date.now() / 200) % 2 === 0 ? '#ef4444' : '#fee2e2';
          ctx.beginPath();
          ctx.arc(d.x + d.width / 2, d.y + 4, 4, 0, Math.PI * 2);
          ctx.fill();
          // Drone wings
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(d.x - 4, d.y + 8, 8, 4);
          ctx.fillRect(d.x + d.width - 4, d.y + 8, 8, 4);
          // Capsule logo
          ctx.fillStyle = d.itemType === 'MUSHROOM' ? '#10b981' : d.itemType === 'SPREAD' ? '#ef4444' : '#06b6d4';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(d.itemType === 'MUSHROOM' ? '🍄' : d.itemType === 'SPREAD' ? 'S' : 'L', d.x + 14, d.y + 18);
        }
      });

      // 6. Draw Drop Items
      s.drops.forEach(drop => {
        if (drop.type === 'MUSHROOM') {
          // Mushroom icon
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(drop.x + 14, drop.y + 10, 12, Math.PI, 0);
          ctx.fill();
          // White dots
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(drop.x + 8, drop.y + 4, 3, 3);
          ctx.fillRect(drop.x + 17, drop.y + 4, 3, 3);
          // Stem
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(drop.x + 10, drop.y + 10, 8, 12);
        } else {
          // S or L Gun Capsule
          const isSpread = drop.type === 'SPREAD';
          ctx.fillStyle = isSpread ? '#ef4444' : '#06b6d4';
          ctx.beginPath();
          ctx.arc(drop.x + 14, drop.y + 14, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(isSpread ? 'S' : 'L', drop.x + 14, drop.y + 18);
        }
      });

      // 7. Draw Enemies
      s.enemies.forEach(en => {
        if (en.type === 'SOLDIER') {
          // Red enemy soldier
          ctx.fillStyle = '#b91c1c'; // Red uniform
          ctx.fillRect(en.x + 6, en.y + 12, 18, 18);
          // Head / Helmet
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(en.x + 8, en.y, 14, 12);
          // Legs
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(en.x + 6, en.y + 30, 7, 14);
          ctx.fillRect(en.x + 17, en.y + 30, 7, 14);
          // Gun
          ctx.fillStyle = '#0f172a';
          const gunDir = en.facingRight ? 1 : -1;
          ctx.fillRect(en.facingRight ? en.x + 18 : en.x - 8, en.y + 18, 14, 5);
        } else if (en.type === 'TURRET') {
          // Turret base
          ctx.fillStyle = '#334155';
          ctx.fillRect(en.x, en.y + 16, en.width, en.height - 16);
          // Cannon ball
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(en.x + en.width / 2, en.y + 16, 14, 0, Math.PI * 2);
          ctx.fill();
          // Cannon barrel aiming at player
          const ang = Math.atan2(p.y - en.y, p.x - en.x);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(en.x + en.width / 2, en.y + 16);
          ctx.lineTo(en.x + en.width / 2 + Math.cos(ang) * 22, en.y + 16 + Math.sin(ang) * 22);
          ctx.stroke();
        } else if (en.type === 'BOSS') {
          // Boss Mech
          ctx.fillStyle = '#450a0a';
          ctx.fillRect(en.x, en.y, en.width, en.height);
          // Armor plating
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(en.x + 8, en.y + 8, en.width - 16, 36);
          // Glowing eye visor
          ctx.fillStyle = '#facc15';
          ctx.fillRect(en.x + 12, en.y + 18, en.width - 24, 8);
          // Boss Health Bar
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(en.x - 10, en.y - 18, en.width + 20, 8);
          ctx.fillStyle = '#ef4444';
          const pct = Math.max(0, en.hp / en.maxHp);
          ctx.fillRect(en.x - 8, en.y - 16, (en.width + 16) * pct, 4);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('TRÙM CƠ GIÁP PHONG ẤN', en.x + en.width / 2, en.y - 22);
        }
      });

      // 8. Draw Bullets
      s.bullets.forEach(b => {
        if (b.isLaser) {
          // Glowing Laser beam
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x - b.vx * 2, b.y - b.vy * 2);
          ctx.stroke();
          // White hot core
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x - b.vx * 2, b.y - b.vy * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 9. Draw Contra Commando Player
      const isBlinking = p.invulnerableTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0;
      if (!isBlinking) {
        ctx.save();
        // Bandana blue
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(p.x + (p.facingRight ? 4 : 2), p.y, 22, 6);
        // Head / Skin
        ctx.fillStyle = '#fbcfe8';
        ctx.fillRect(p.x + (p.facingRight ? 6 : 4), p.y + 6, 18, 10);
        // Chest & bandolier ammo belt
        ctx.fillStyle = '#ea580c'; // muscle tan
        ctx.fillRect(p.x + (p.facingRight ? 4 : 2), p.y + 16, 22, p.isCrouching ? 6 : 14);
        // Camo pants
        ctx.fillStyle = '#166534';
        ctx.fillRect(p.x + (p.facingRight ? 4 : 2), p.y + (p.isCrouching ? 20 : 30), 22, p.isCrouching ? 8 : 18);

        // Gun rifle
        ctx.fillStyle = '#0f172a';
        if (p.aimAngle === 'UP') {
          ctx.fillRect(p.x + (p.facingRight ? 16 : 8), p.y - 12, 6, 16);
        } else if (p.aimAngle === 'DIAGONAL_UP') {
          ctx.fillRect(p.facingRight ? p.x + 18 : p.x - 8, p.y + 4, 16, 6);
        } else {
          ctx.fillRect(p.facingRight ? p.x + 18 : p.x - 12, p.y + (p.isCrouching ? 12 : 18), 20, 6);
        }

        // Active Mana Shield Hào Quang
        if (p.shieldActive) {
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#22d3ee';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(p.x + p.width / 2, p.y + p.height / 2, 38, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      }

      // 10. Draw Particles
      s.particles.forEach(pt => {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      ctx.restore(); // restore camera transform

      // 11. NIGHT TIME AMBIENT LIGHTING MASK
      // If it is night time (timer >= 55s), darken screen except around player!
      if (s.dayNightTimer >= 55) {
        const playerScreenX = p.x - s.cameraX + p.width / 2;
        const playerScreenY = p.y + p.height / 2;

        const nightDarkness = Math.min(0.75, (s.dayNightTimer - 55) * 0.1);
        ctx.save();
        // Create radial light spotlight
        const lightGrad = ctx.createRadialGradient(
          playerScreenX, playerScreenY, 30,
          playerScreenX, playerScreenY, 220
        );
        lightGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        lightGrad.addColorStop(0.7, `rgba(2, 6, 23, ${nightDarkness * 0.6})`);
        lightGrad.addColorStop(1, `rgba(2, 6, 23, ${nightDarkness})`);

        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, cw, ch);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPaused, activeQuestions, onEncounterGate, onPlayerDeath, onVictory, onStatsUpdate, onPlayerStatusChange, onTimeOfDayChange]);

  // Method called from parent when trivia answer is correct: blow up gate & resume!
  useEffect(() => {
    // When gate is cleared from parent:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__contraGateCleared = (gateIdx: number) => {
      const s = stateRef.current;
      if (s.gates[gateIdx]) {
        s.gates[gateIdx].cleared = true;
        s.gatesClearedCount++;
        s.score += 500;
        sound.playExplosion();

        // Spawn explosive gate debris
        const gx = s.gates[gateIdx].x;
        const gy = s.gates[gateIdx].y;
        for (let i = 0; i < 40; i++) {
          s.particles.push({
            x: gx + Math.random() * 38,
            y: gy + Math.random() * 240,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            color: Math.random() > 0.5 ? '#06b6d4' : '#facc15',
            size: Math.random() * 6 + 3,
            alpha: 1,
            decay: 0.025,
          });
        }
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className="w-full h-full object-contain pixelated border-y sm:border border-slate-800 shadow-2xl bg-slate-950"
      />
    </div>
  );
};
