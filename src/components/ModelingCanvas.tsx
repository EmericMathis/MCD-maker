import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Connection, useNodesState,
  useEdgesState, Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useModelingStore } from '../store/modelingStore';
import { useThemeStore } from '../store/themeStore';
import { EntityNode } from './EntityNode';
import { CustomEdge } from './CustomEdge';
import { Modal } from './Modal';
import { Entity } from '../types';

const nodeTypes = {
  entity: EntityNode,
};

export function ModelingCanvas() {
  const entities = useModelingStore((state) => state.entities);
  const relationships = useModelingStore((state) => state.relationships);
  const addRelationship = useModelingStore((state) => state.addRelationship);
  const updateEntity = useModelingStore((state) => state.updateEntity);
  const isDark = useThemeStore((state) => state.isDark);
  const removeRelationship = useModelingStore((state) => state.removeRelationship);
  const createJunctionTable = useModelingStore((state) => state.createJunctionTable);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    entities.map((entity) => ({
      id: entity.id,
      type: 'entity',
      position: entity.position,
      data: entity,
      draggable: true,
    }))
  );

  const edgeTypes = {
    custom: CustomEdge,
  };

  const handleCardinalityChange = (edgeId: string, newValue: string) => {
    const [sourceCard, targetCard] = newValue.split(':');
    const updatedRelationships = relationships.map((rel) =>
      rel.id === edgeId
        ? { ...rel, sourceCardinality: sourceCard, targetCardinality: targetCard }
        : rel
    );
    // Mettre à jour le store avec les nouvelles cardinalités
    // Vous devrez ajouter une méthode updateRelationship dans votre store
    updateRelationship(edgeId, { sourceCardinality: sourceCard, targetCardinality: targetCard });
  };

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    relationships.map((rel) => {
      const sourceEntity = entities.find(e => e.id === rel.source);
      const targetEntity = entities.find(e => e.id === rel.target);

      return {
        id: rel.id,
        source: rel.source,
        target: rel.target,
        type: 'custom',
        data: {
          label: `${rel.sourceCardinality}:${rel.targetCardinality}`,
          onDelete: removeRelationship,
          onCardinalityChange: handleCardinalityChange,
          onCreateJunctionTable: createJunctionTable,
          sourceEntity,
          targetEntity,
        },
        style: { stroke: isDark ? '#6b7280' : '#374151' },
      };
    })
  );

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; edgeId: string | null }>({ x: 0, y: 0, edgeId: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingJunctionTable, setPendingJunctionTable] = useState<{ id: string, sourceEntity: Entity, targetEntity: Entity } | null>(null);

  useEffect(() => {
    setNodes(
      entities.map((entity) => ({
        id: entity.id,
        type: 'entity',
        position: entity.position,
        data: entity,
        draggable: true,
      }))
    );
  }, [entities, setNodes]);

  useEffect(() => {
    setEdges(
      relationships.map((rel) => {
        const sourceEntity = entities.find(e => e.id === rel.source);
        const targetEntity = entities.find(e => e.id === rel.target);

        return {
          id: rel.id,
          source: rel.source,
          target: rel.target,
          type: 'custom',
          data: {
            label: `${rel.sourceCardinality}:${rel.targetCardinality}`,
            onDelete: removeRelationship,
            onCardinalityChange: handleCardinalityChange,
            onCreateJunctionTable: createJunctionTable,
            sourceEntity,
            targetEntity,
          },
          style: { stroke: isDark ? '#6b7280' : '#374151' },
        };
      })
    );
  }, [relationships, entities, isDark, setEdges, removeRelationship]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        const newRelationship = {
          id: `rel-${connection.source}-${connection.target}`,
          source: connection.source,
          target: connection.target,
          sourceCardinality: '1',
          targetCardinality: 'n',
        };
        addRelationship(newRelationship);
      }
    },
    [addRelationship]
  );

  const onNodeDragStop = useCallback(
    (event: any, node: any) => {
      const entity = entities.find((e) => e.id === node.id);
      if (entity) {
        updateEntity(entity.id, {
          ...entity,
          position: node.position,
        });
      }
    },
    [entities, updateEntity]
  );

  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      edgesToDelete.forEach((edge) => {
        removeRelationship(edge.id);
      });
    },
    [removeRelationship]
  );

  const handleEdgeContextMenu = (event: React.MouseEvent, edgeId: string) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, edgeId });
  };

  const handleDeleteEdge = () => {
    if (contextMenu.edgeId) {
      removeRelationship(contextMenu.edgeId);
      setContextMenu({ x: 0, y: 0, edgeId: null });
    }
  };

  const handleCardinalitySave = (edgeId: string, sourceEntity: Entity, targetEntity: Entity) => {
    if (sourceCard === 'n' && targetCard === 'n') {
      setPendingJunctionTable({ id: edgeId, sourceEntity, targetEntity });
      setIsModalOpen(true);
    } else {
      if (data?.onCardinalityChange) {
        data.onCardinalityChange(edgeId, `${sourceCard}:${targetCard}`);
      }
    }
  };

  const confirmJunctionTableCreation = () => {
    if (pendingJunctionTable) {
      createJunctionTable(pendingJunctionTable.id, pendingJunctionTable.sourceEntity, pendingJunctionTable.targetEntity);
    }
    setIsModalOpen(false);
    setPendingJunctionTable(null);
  };

  const cancelJunctionTableCreation = () => {
    setIsModalOpen(false);
    setPendingJunctionTable(null);
  };

  return (
    <div className={`w-full h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onEdgesDelete={onEdgesDelete}
        onEdgeContextMenu={handleEdgeContextMenu}
        fitView
        panOnDrag={true}
        defaultEdgeOptions={{
          type: 'custom',
          style: { stroke: isDark ? '#6b7280' : '#374151' },
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background
          color={isDark ? '#374151' : '#e5e7eb'}
          className="transition-colors duration-200"
        />
        <Controls
          showLock={false}
          className={`transition-colors duration-200 ${isDark ? 'text-white' : ''}`}
        />
      </ReactFlow>

      <Modal
        isOpen={isModalOpen}
        onClose={cancelJunctionTableCreation}
        onConfirm={confirmJunctionTableCreation}
        title="Créer une table de liaison"
        message="Cette relation nécessite une table de liaison. Voulez-vous la créer ?"
      />
    </div>
  );
}