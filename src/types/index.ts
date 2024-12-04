export interface Entity {
  id: string;
  name: string;
  attributes: Attribute[];
  position: { x: number; y: number };
}

export interface Attribute {
  id: string;
  name: string;
  type: string;
  isPrimary: boolean;
  isNullable: boolean;
}

export interface Relationship {
  id: string;
  source: string;
  target: string;
  sourceCardinality: string;
  targetCardinality: string;
}