import { useState } from 'react';
import { getBezierPath, EdgeProps } from 'reactflow';
import { X, Check, Trash2 } from 'lucide-react';

export function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}: EdgeProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditingCard, setIsEditingCard] = useState(false);
    const [sourceCard, setSourceCard] = useState(data?.label.split(':')[0] || '1');
    const [targetCard, setTargetCard] = useState(data?.label.split(':')[1] || 'n');

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const onDelete = () => {
        data?.onDelete(id);
    };

    const handleCardinalityClick = () => {
        setIsEditingCard(true);
    };

    const handleCardinalityChange = (side: 'source' | 'target', value: string) => {
        if (['0', '1', 'n'].includes(value)) {
            if (side === 'source') {
                setSourceCard(value);
            } else {
                setTargetCard(value);
            }
        }
    };

    const handleCardinalitySave = async () => {
        if (sourceCard === 'n' && targetCard === 'n') {
            const shouldCreateJunctionTable = window.confirm(
                'Cette relation nécessite une table de liaison. Voulez-vous la créer ?'
            );

            if (shouldCreateJunctionTable) {
                if (data?.onCreateJunctionTable) {
                    await data.onCreateJunctionTable(id, data.sourceEntity, data.targetEntity);
                }
            } else {
                handleCardinalityCancel();
                return;
            }
        }

        setIsEditingCard(false);
        if (data?.onCardinalityChange) {
            data.onCardinalityChange(id, `${sourceCard}:${targetCard}`);
        }
    };

    const handleCardinalityCancel = () => {
        setIsEditingCard(false);
        setSourceCard(data?.label.split(':')[0] || '1');
        setTargetCard(data?.label.split(':')[1] || 'n');
    };

    return (
        <>
            <path
                d={edgePath}
                className="react-flow__edge-path"
                style={style}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />

            <foreignObject
                width={isEditingCard ? 150 : (isHovered ? 80 : 50)}
                height={40}
                x={labelX - (isEditingCard ? 75 : (isHovered ? 40 : 25))}
                y={labelY - 20}
                className="flex items-center justify-center"
            >
                {isEditingCard ? (
                    <div className="flex items-center space-x-1 bg-white/80 px-2 py-1 rounded">
                        <select
                            value={sourceCard}
                            onChange={(e) => handleCardinalityChange('source', e.target.value)}
                            className="text-sm"
                        >
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="n">n</option>
                        </select>
                        <span>:</span>
                        <select
                            value={targetCard}
                            onChange={(e) => handleCardinalityChange('target', e.target.value)}
                            className="text-sm"
                        >
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="n">n</option>
                        </select>
                        <Check size={16} className="text-black cursor-pointer" onClick={handleCardinalitySave} />
                        <X size={16} className="text-black cursor-pointer" onClick={handleCardinalityCancel} />
                        <Trash2 size={16} className="text-black cursor-pointer" onClick={onDelete} />
                    </div>
                ) : (
                    <div
                        onClick={handleCardinalityClick}
                        className="cursor-pointer text-sm bg-white/80 px-2 py-1 rounded flex items-center gap-1"
                    >
                        <span>{sourceCard}:{targetCard}</span>
                        {isHovered && <Trash2 size={16} className="text-black cursor-pointer" onClick={onDelete} />}
                    </div>
                )}
            </foreignObject>
        </>
    );
} 