export interface Battle {
  fight(): string;
}

export interface Weapon {
  name: string;
}

export interface Warrior {
  name: string;
  weapon: Weapon;
}
