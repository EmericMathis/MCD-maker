import { create } from 'zustand';
import { Entity, Relationship } from '../types';

interface HistoryEntry {
  action: string;
  state: {
    entities: Entity[];
    relationships: Relationship[];
  };
}

interface ModelingState {
  entities: Entity[];
  relationships: Relationship[];
  history: HistoryEntry[];
  currentHistoryIndex: number;
  addEntity: (entity: Entity) => void;
  updateEntity: (id: string, entity: Partial<Entity>) => void;
  removeEntity: (id: string) => void;
  addRelationship: (relationship: Relationship) => void;
  removeRelationship: (id: string) => void;
  generateSQL: () => string;
  undo: () => void;
  redo: () => void;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  createJunctionTable: (relationshipId: string, sourceEntity: Entity, targetEntity: Entity) => void;
}

const GRID_SPACING = 250;
const ENTITIES_PER_ROW = 3;

export const useModelingStore = create<ModelingState>((set, get) => ({
  entities: [],
  relationships: [],
  history: [],
  currentHistoryIndex: -1,

  addToHistory: (action: string) => {
    const { entities, relationships, currentHistoryIndex, history } = get();
    const newEntry: HistoryEntry = {
      action,
      state: { entities, relationships },
    };

    set({
      history: [
        ...history.slice(0, currentHistoryIndex + 1),
        newEntry,
      ],
      currentHistoryIndex: currentHistoryIndex + 1,
    });
  },

  addEntity: (entity) => {
    const { entities } = get();
    const index = entities.length;
    const row = Math.floor(index / ENTITIES_PER_ROW);
    const col = index % ENTITIES_PER_ROW;

    // Calculer la position au centre de la vue
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;

    const position = {
      x: centerX + (col - 1) * GRID_SPACING,
      y: centerY + (row - 1) * GRID_SPACING,
    };

    const positionedEntity = {
      ...entity,
      position,
    };

    set((state) => {
      const newState = {
        entities: [...state.entities, positionedEntity],
      };
      get().addToHistory(`Added entity: ${entity.name}`);
      return newState;
    });
  },

  updateEntity: (id, updatedEntity) =>
    set((state) => {
      const newState = {
        entities: state.entities.map((entity) =>
          entity.id === id ? { ...entity, ...updatedEntity } : entity
        ),
      };
      get().addToHistory(`Updated entity: ${id}`);
      return newState;
    }),

  removeEntity: (id) =>
    set((state) => {
      const newState = {
        entities: state.entities.filter((entity) => entity.id !== id),
        relationships: state.relationships.filter(
          (rel) => rel.source !== id && rel.target !== id
        ),
      };
      get().addToHistory(`Removed entity: ${id}`);
      return newState;
    }),

  addRelationship: (relationship) =>
    set((state) => {
      // Vérifier si la relation existe déjà
      const exists = state.relationships.some(
        (rel) =>
          rel.source === relationship.source &&
          rel.target === relationship.target
      );

      if (!exists) {
        const newState = {
          relationships: [...state.relationships, relationship],
        };
        get().addToHistory('Added relationship');
        return newState;
      }
      return state; // Ne rien faire si la relation existe déjà
    }),

  removeRelationship: (id) =>
    set((state) => {
      const newState = {
        relationships: state.relationships.filter((rel) => rel.id !== id),
      };
      get().addToHistory(`Removed relationship: ${id}`);
      return newState;
    }),

  undo: () => {
    const { currentHistoryIndex, history } = get();
    if (currentHistoryIndex > 0) {
      const previousState = history[currentHistoryIndex - 1].state;
      set({
        ...previousState,
        currentHistoryIndex: currentHistoryIndex - 1,
      });
    }
  },

  redo: () => {
    const { currentHistoryIndex, history } = get();
    if (currentHistoryIndex < history.length - 1) {
      const nextState = history[currentHistoryIndex + 1].state;
      set({
        ...nextState,
        currentHistoryIndex: currentHistoryIndex + 1,
      });
    }
  },

  generateSQL: () => {
    const { entities, relationships } = get();
    let sql = '';

    entities.forEach((entity) => {
      sql += `CREATE TABLE ${entity.name.toLowerCase()} (\n`;

      const attributes = entity.attributes.map((attr) => {
        let line = `  ${attr.name.toLowerCase()} ${attr.type}`;
        if (attr.isPrimary) line += ' PRIMARY KEY';
        if (!attr.isNullable) line += ' NOT NULL';
        return line;
      });

      relationships
        .filter((rel) => rel.target === entity.id)
        .forEach((rel) => {
          const sourceEntity = entities.find((e) => e.id === rel.source);
          if (sourceEntity) {
            const sourcePrimaryKey = sourceEntity.attributes.find(
              (attr) => attr.isPrimary
            );
            if (sourcePrimaryKey) {
              attributes.push(
                `  ${sourceEntity.name.toLowerCase()}_id ${sourcePrimaryKey.type
                } REFERENCES ${sourceEntity.name.toLowerCase()}(${sourcePrimaryKey.name.toLowerCase()})`
              );
            }
          }
        });

      sql += attributes.join(',\n');
      sql += '\n);\n\n';
    });

    return sql;
  },

  updateRelationship: (id: string, updates: Partial<Relationship>) =>
    set((state) => ({
      relationships: state.relationships.map((rel) =>
        rel.id === id ? { ...rel, ...updates } : rel
      ),
    })),

  createJunctionTable: (relationshipId: string, sourceEntity: Entity, targetEntity: Entity) =>
    set((state) => {
      const relationship = state.relationships.find(r => r.id === relationshipId);
      if (!relationship) return state;

      const junctionTableName = `${sourceEntity.name.toLowerCase()}_${targetEntity.name.toLowerCase()}`;

      // Créer la nouvelle entité (table de liaison)
      const newEntity: Entity = {
        id: `entity-${Date.now()}`,
        name: junctionTableName,
        attributes: [
          {
            id: `attr-${Date.now()}-1`,
            name: `${sourceEntity.name.toLowerCase()}_id`,
            type: 'INTEGER',
            isPrimary: true,
            isNullable: false,
          },
          {
            id: `attr-${Date.now()}-2`,
            name: `${targetEntity.name.toLowerCase()}_id`,
            type: 'INTEGER',
            isPrimary: true,
            isNullable: false,
          }
        ],
        position: {
          x: (sourceEntity.position.x + targetEntity.position.x) / 2,
          y: (sourceEntity.position.y + targetEntity.position.y) / 2 + 100
        }
      };

      // Mettre à jour les relations
      const newRelationships = [
        // Relation source vers table de liaison
        {
          id: `rel-${Date.now()}-1`,
          source: sourceEntity.id,
          target: newEntity.id,
          sourceCardinality: '1',
          targetCardinality: 'n'
        },
        // Relation table de liaison vers target
        {
          id: `rel-${Date.now()}-2`,
          source: newEntity.id,
          target: targetEntity.id,
          sourceCardinality: 'n',
          targetCardinality: '1'
        }
      ];

      return {
        entities: [...state.entities, newEntity],
        relationships: [
          ...state.relationships.filter(r => r.id !== relationshipId),
          ...newRelationships
        ]
      };
    }),
}));