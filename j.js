 var Monster= class Monster {
  constructor(pos, speed, chase) {
    this.pos = pos;
    this.speed = speed;
    this.chase = chase;
  }

  get type() { return "monster"; }

  static create(pos, ch) {
    if (ch == 'm') {
      // monster that moves back and forth
      return new Monster(pos.plus(new Vec(0, -1)), new Vec(3, 0), false);
    } else { // 'M'
      // monster that chases player
      return new Monster(pos.plus(new Vec(0, -1)), new Vec(3, 0), true);
    }
  }

  update(time, state) {
    let newPos;
    if (this.chase) {
      if (state.player.pos.x < this.pos.x) {
        this.speed = new Vec(-3, 0);
      } else {
        this.speed = new Vec(3, 0);
      }
    }
    newPos = this.pos.plus(this.speed.times(time));
    if (!state.level.touches(newPos, this.size, "wall")) {
      return new Monster(newPos, this.speed, this.chase);
    } else {
      return new Monster(this.pos, this.speed.times(-1), this.chase);
    }
  }

  collide(state) {
    let player = state.player;
    let monster = this;
    if (monster.pos.y - player.pos.y > 1) {
      let filtered = state.actors.filter(a => a != this);
      return new State(state.level, filtered, state.status);
    } else {
      return new State(state.level, state.actors, 'lost');
    }
  }
}

Monster.prototype.size = new Vec(1.2, 2);

levelChars["m"] = Monster;
levelChars["M"] = Monster;

runLevel(new Level(`
..................................
.################################.
.#..............................#.
.#..............................#.
.#..............................#.
.#...........................o..#.
.#..@...........................#.
.##########..............########.
..........#..o..o..o..o..#........
..........#..m........M..#........
..........################........
..................................
`), DOMDisplay);