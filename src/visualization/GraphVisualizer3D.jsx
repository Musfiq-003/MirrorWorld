import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Text, Trail, PivotControls, ContactShadows, GizmoHelper, GizmoViewport, Edges, MeshReflectorMaterial, Float, Billboard, Html, Backdrop } from '@react-three/drei';
import { useSimulation } from '../simulation/SimulationContext.jsx';
import { NODE_TYPES, EDGE_STATE } from '../simulation/engine.js';
import * as THREE from 'three';
import { ChevronDown, ChevronUp, Layers, Box, Disc, Activity, AlertTriangle, ShieldAlert, HeartPulse, Warehouse as WarehouseIcon, Home as HomeIcon, MapPin, Factory as FactoryIcon, Hospital as HospitalIcon, Ambulance as AmbulanceIcon, Car as CarIcon, Waves as WavesIcon, ArrowRightCircle as ArrowRightIcon, ArrowDownCircle as ArrowDownIcon, Building as BuildingIcon } from 'lucide-react';


// --- Toy-Town Friendly Palette ---
const NODE_COLORS = {
    [NODE_TYPES.HOSPITAL]: '#FFFFFF', // Bright White with Red Cross
    [NODE_TYPES.WAREHOUSE]: '#FFD700', // Yellow
    [NODE_TYPES.SOURCE]: '#FF8C00',    // Orange Houses
    [NODE_TYPES.SINK]: '#00C853',      // Green Safe Zones
    [NODE_TYPES.BRIDGE]: '#78909C',    // Steel Blue-Gray
    [NODE_TYPES.AMBULANCE]: '#FF3D00',
    [NODE_TYPES.INDUSTRIAL]: '#A4907C', // Industial Tan
    [NODE_TYPES.VEHICLE]: '#FFEB3B',
    [NODE_TYPES.HOUSE]: '#81C784',     // Green Houses
    [NODE_TYPES.BUILDING]: '#ECEFF1',    // Professional Light Gray
    [NODE_TYPES.WATER]: '#4FC3F7',       // Cyan Water
    [NODE_TYPES.CANAL]: '#D7CCC8',       // Beige/Sand for Harbor
    [NODE_TYPES.BEACH]: '#FFE082',       // Golden Sand
    [NODE_TYPES.PARK]: '#43A047',        // Forest Green
    'default': '#ffffff'
};

// --- Toy-Town Asset Components ---

function Tree({ position, scale = 1 }) {
    return (
        <group position={position} scale={[scale, scale, scale]}>
            {/* Trunk */}
            <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[0.05, 0.08, 0.5, 8]} />
                <meshStandardMaterial color="#5D4037" roughness={1} />
            </mesh>
            {/* Leaves - Low Poly Cone */}
            <mesh position={[0, 0.8, 0]}>
                <coneGeometry args={[0.4, 0.8, 8]} />
                <meshStandardMaterial color="#43A047" roughness={1} />
            </mesh>
            <mesh position={[0, 1.1, 0]}>
                <coneGeometry args={[0.3, 0.6, 8]} />
                <meshStandardMaterial color="#4CAF50" roughness={1} />
            </mesh>
        </group>
    );
}

function ResidentialHouse({ color }) {
    return (
        <group>
            {/* Dark Foundation/Base */}
            <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[1.3, 0.1, 1.3]} />
                <meshStandardMaterial color="#9E9E9E" />
            </mesh>

            {/* Main Ground Floor Body */}
            <mesh position={[0, 0.45, -0.1]} castShadow>
                <boxGeometry args={[1.2, 0.8, 1.2]} />
                <meshStandardMaterial color={color || "#F5F5F5"} roughness={0.8} />
            </mesh>

            {/* Integrated Garage Section */}
            <group position={[0.4, 0.35, 0.55]}>
                <mesh castShadow>
                    <boxGeometry args={[0.7, 0.6, 0.4]} />
                    <meshStandardMaterial color="#F5F5F5" />
                </mesh>
                {/* Garage Door */}
                <mesh position={[0, -0.05, 0.21]}>
                    <planeGeometry args={[0.5, 0.4]} />
                    <meshStandardMaterial color="#4E342E" metalness={0.2} />
                </mesh>
            </group>

            {/* Second Floor Section */}
            <mesh position={[-0.2, 1.15, -0.1]} castShadow>
                <boxGeometry args={[0.9, 0.6, 1.1]} />
                <meshStandardMaterial color="#F5F5F5" roughness={0.8} />
            </mesh>

            {/* Entrance Porch with Pillars */}
            <group position={[-0.35, 0, 0.65]}>
                {/* Porch Base/Stairs */}
                <mesh position={[0, 0.1, 0]}>
                    <boxGeometry args={[0.5, 0.2, 0.4]} />
                    <meshStandardMaterial color="#E0E0E0" />
                </mesh>
                {/* Porch Roof */}
                <group position={[0, 0.7, 0]}>
                    <mesh>
                        <boxGeometry args={[0.55, 0.05, 0.45]} />
                        <meshStandardMaterial color="#F5F5F5" />
                    </mesh>
                    <mesh position={[0, 0.15, 0]} rotation={[0, Math.PI / 4, 0]}>
                        <coneGeometry args={[0.45, 0.3, 4]} />
                        <meshStandardMaterial color="#4E342E" />
                    </mesh>
                </group>
                {/* Pillars */}
                {[[-0.2, 0.4, 0.15], [0.2, 0.4, 0.15]].map((pos, i) => (
                    <mesh key={i} position={pos}>
                        <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
                        <meshStandardMaterial color="#FFFFFF" />
                    </mesh>
                ))}
            </group>

            {/* Roof Layers */}
            {/* Main House Sloped Roof */}
            <mesh position={[-0.2, 1.6, -0.1]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[1.0, 0.6, 4]} />
                <meshStandardMaterial color="#4E342E" roughness={0.8} />
            </mesh>
            {/* Garage/Lower Roof Section */}
            <mesh position={[0.4, 0.75, 0.55]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[0.65, 0.4, 4]} />
                <meshStandardMaterial color="#4E342E" />
            </mesh>

            {/* Windows */}
            {[
                // Ground floor
                [-0.3, 0.5, -0.71], [0.3, 0.5, -0.71], // Back
                [-0.61, 0.5, 0], [0.5, 1.1, 0.46],    // Sides/Up
            ].map((pos, i) => (
                <mesh key={i} position={pos} rotation={[0, pos[2] === 0 ? Math.PI / 2 : 0, 0]}>
                    <planeGeometry args={[0.25, 0.3]} />
                    <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
                </mesh>
            ))}

            {/* Front Large Window */}
            <mesh position={[-0.35, 1.15, 0.46]}>
                <planeGeometry args={[0.4, 0.3]} />
                <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
            </mesh>
        </group>
    );
}

function OfficeBuilding({ height = 2, color }) {
    return (
        <group>
            {/* Main Premium Body */}
            <mesh position={[0, height / 2, 0]} castShadow>
                <boxGeometry args={[1.5, height, 1]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.3} metalness={0.1} />
            </mesh>

            {/* Dark Concrete Base */}
            <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[1.55, 0.1, 1.05]} />
                <meshStandardMaterial color="#263238" />
            </mesh>

            {/* Premium Dark Roof Deck */}
            <mesh position={[0, height + 0.05, 0]}>
                <boxGeometry args={[1.55, 0.1, 1.05]} />
                <meshStandardMaterial color="#263238" />
            </mesh>

            {/* Window Grid Rendering */}
            {(() => {
                const floors = Math.floor(height * 2.5);
                const windowsPerRow = 5;
                const results = [];
                for (let f = 0; f < floors; f++) {
                    const y = 0.4 + f * 0.4;
                    if (y > height - 0.2) continue;

                    // Front Face Windows (High Density)
                    for (let x = 0; x < windowsPerRow; x++) {
                        const px = -0.55 + x * 0.28;
                        results.push(
                            <group key={`win-${f}-${x}`} position={[px, y, 0.505]}>
                                {/* Glass */}
                                <mesh>
                                    <planeGeometry args={[0.18, 0.22]} />
                                    <meshStandardMaterial color="#111" roughness={0.1} metalness={0.9} />
                                </mesh>
                                {/* Frame/Border */}
                                <mesh position={[0, 0, -0.01]}>
                                    <planeGeometry args={[0.22, 0.26]} />
                                    <meshBasicMaterial color="#333" />
                                </mesh>
                            </group>
                        );
                        // Back Face Windows
                        results.push(
                            <group key={`win-b-${f}-${x}`} position={[px, y, -0.505]} rotation={[0, Math.PI, 0]}>
                                <mesh>
                                    <planeGeometry args={[0.18, 0.22]} />
                                    <meshStandardMaterial color="#111" roughness={0.1} metalness={0.9} />
                                </mesh>
                            </group>
                        );
                    }
                }
                return results;
            })()}

            {/* Professional Canopy Entrance */}
            <group position={[-0.4, 0.2, 0.55]}>
                {/* Steps */}
                <mesh position={[0, -0.15, 0.1]}>
                    <boxGeometry args={[0.6, 0.1, 0.3]} />
                    <meshStandardMaterial color="#263238" />
                </mesh>
                <mesh position={[0, -0.1, 0]}>
                    <boxGeometry args={[0.7, 0.1, 0.4]} />
                    <meshStandardMaterial color="#37474F" />
                </mesh>
                {/* Support Pillars */}
                {[-0.25, 0.25].map((x, i) => (
                    <mesh key={i} position={[x, 0.2, 0.1]}>
                        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
                        <meshStandardMaterial color="#FFFFFF" />
                    </mesh>
                ))}
                {/* Canopy Roof */}
                <mesh position={[0, 0.45, 0.05]}>
                    <boxGeometry args={[0.7, 0.05, 0.4]} />
                    <meshStandardMaterial color="#263238" />
                </mesh>
            </group>
        </group>
    );
}

// Full Park Model (Cluster of trees)
function ParkModel() {
    const trees = useMemo(() => [
        { pos: [0, 0, 0], s: 1 },
        { pos: [0.8, 0, 0.8], s: 0.8 },
        { pos: [-0.8, 0, 1], s: 0.9 },
        { pos: [1.1, 0, -0.7], s: 0.75 },
        { pos: [-0.6, 0, -0.9], s: 0.85 }
    ], []);

    return (
        <group scale={1.2}>
            {/* Soft Green Base */}
            <mesh position={[0, -0.05, 0]}>
                <cylinderGeometry args={[1.5, 1.8, 0.1, 8]} />
                <meshStandardMaterial color="#66BB6A" roughness={1} />
            </mesh>
            {/* Tree Cluster */}
            {trees.map((t, i) => (
                <ParkTree key={i} position={t.pos} scale={t.s * 0.6} />
            ))}
        </group>
    );
}

function NodeGeometry({ type, color, hovered, selected }) {
    const material = <meshStandardMaterial color={color} roughness={0.7} />;

    // Toy-Town Variations
    switch (type) {
        case NODE_TYPES.SOURCE:
        case NODE_TYPES.HOUSE:
            return (
                <group>
                    <ResidentialHouse color={color} />
                    {/* Neighborhood trees */}
                    <Tree position={[0.6, 0, -0.6]} scale={0.6} />
                    <Tree position={[-0.7, 0, 0.5]} scale={0.5} />
                </group>
            );
        case NODE_TYPES.HOSPITAL:
            return <Hospital />;
        case NODE_TYPES.AMBULANCE:
            return <Ambulance />;
        case NODE_TYPES.VEHICLE:
            return <ToyCar color={color} />;
        case NODE_TYPES.WAREHOUSE:
            return <WarehouseModel color={color} />;
        case NODE_TYPES.INDUSTRIAL:
            return <IndustrialZone color={color} />;
        case NODE_TYPES.BUILDING:
            return <OfficeBuilding height={2} color={color} />;
        case NODE_TYPES.WATER:
            return <WaterTile />;
        case NODE_TYPES.CANAL:
            return <CanalModel />;
        case NODE_TYPES.BEACH:
            return <BeachTile />;
        case NODE_TYPES.PARK:
            return <ParkModel />;
        case NODE_TYPES.BRIDGE:
            return <BridgeModel />;
        default:
            return (
                <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            );
    }
}

// Suspension Bridge Component
function SuspensionBridgeV2({ roadCurve }) {
    const midPoint = roadCurve.getPoint(0.5);
    const startPoint = roadCurve.getPoint(0);
    const endPoint = roadCurve.getPoint(1);
    const angle = Math.atan2(endPoint.x - startPoint.x, endPoint.z - startPoint.z);

    return (
        <group>
            {/* Road Surface */}
            <mesh scale={[1, 0.05, 1]} position={[0, 0.1, 0]}>
                <tubeGeometry args={[roadCurve, 32, 0.6, 8, false]} />
                <meshStandardMaterial color="#263238" roughness={0.8} />
            </mesh>

            {/* Suspension Towers */}
            {[0.25, 0.75].map((t, i) => {
                const pos = roadCurve.getPoint(t);
                const towerX = pos.x;
                const towerZ = pos.z;
                return (
                    <group key={i} position={[towerX, 0, towerZ]} rotation={[0, angle, 0]}>
                        {/* Main Columns */}
                        {[0.8, -0.8].map((side, j) => (
                            <mesh key={j} position={[side, 2.5, 0]}>
                                <boxGeometry args={[0.3, 5, 0.3]} />
                                <meshStandardMaterial color="#ECEFF1" />
                            </mesh>
                        ))}
                        {/* Cross Beam */}
                        <mesh position={[0, 4.5, 0]}>
                            <boxGeometry args={[1.8, 0.2, 0.3]} />
                            <meshStandardMaterial color="#ECEFF1" />
                        </mesh>
                    </group>
                );
            })}

            {/* Main Cables (Visual simplified) */}
            <mesh position={[0, 4.5, 0]} rotation={[0, angle, 0]}>
                <boxGeometry args={[0.05, 0.05, roadCurve.getLength()]} />
                <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={0.5} />
            </mesh>
        </group>
    );
}

function BridgeModel() {
    const archSegments = 24;
    const archHeight = 1.4;
    const archLength = 4.0;

    // Glowing white material for the "Blueprint" look
    const blueprintMaterial = (
        <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={1.5}
            toneMapped={false}
        />
    );

    return (
        <group>
            {/* --- Subtle Abutments --- */}
            {[-2.0, 2.0].map((z, i) => (
                <mesh key={i} position={[0, -0.4, z]}>
                    <boxGeometry args={[1.8, 1.2, 0.4]} />
                    <meshStandardMaterial color="#263238" roughness={0.9} />
                </mesh>
            ))}

            {/* --- Main Roadway Deck --- */}
            <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.4, 0.1, 4.8]} />
                <meshStandardMaterial color="#1a1c1e" roughness={0.7} />
            </mesh>

            {/* Deck Glow Edges */}
            {[-0.7, 0.7].map((x, i) => (
                <mesh key={i} position={[x, 0.16, 0]}>
                    <boxGeometry args={[0.04, 0.02, 4.8]} />
                    {blueprintMaterial}
                </mesh>
            ))}

            {/* --- Glowing Arched Trusses --- */}
            {[-0.7, 0.7].map((x, sideIdx) => (
                <group key={sideIdx}>
                    {/* The Parabolic Arch */}
                    {Array.from({ length: archSegments }).map((_, i) => {
                        const z1 = -archLength / 2 + (i * archLength) / archSegments;
                        const z2 = -archLength / 2 + ((i + 1) * archLength) / archSegments;
                        const y1 = archHeight * (1 - Math.pow((2 * z1) / archLength, 2));
                        const y2 = archHeight * (1 - Math.pow((2 * z2) / archLength, 2));

                        const midZ = (z1 + z2) / 2;
                        const midY = (y1 + y2) / 2 + 0.12;

                        const dz = z2 - z1;
                        const dy = y2 - y1;
                        const dist = Math.sqrt(dz * dz + dy * dy);
                        const angle = Math.atan2(dy, dz);

                        return (
                            <mesh key={i} position={[x, midY, midZ]} rotation={[angle, 0, 0]}>
                                <boxGeometry args={[0.06, 0.06, dist + 0.01]} />
                                {blueprintMaterial}
                            </mesh>
                        );
                    })}

                    {/* Vertical Blueprint Hangers */}
                    {Array.from({ length: 11 }).map((_, i) => {
                        const z = -archLength / 2 + 0.3 + i * 0.34;
                        if (Math.abs(z) > archLength / 2 - 0.1) return null;

                        const archY = archHeight * (1 - Math.pow((2 * z) / archLength, 2)) + 0.12;
                        const hangerHeight = archY - 0.12;

                        return (
                            <mesh key={i} position={[x, 0.12 + hangerHeight / 2, z]}>
                                <cylinderGeometry args={[0.01, 0.01, hangerHeight, 4]} />
                                {blueprintMaterial}
                            </mesh>
                        );
                    })}
                </group>
            ))}

            {/* --- Cross Bracing (Glowing) --- */}
            {[-1.0, -0.5, 0, 0.5, 1.0].map((z, i) => {
                const y = archHeight * (1 - Math.pow((2 * z) / archLength, 2)) + 0.12;
                return (
                    <mesh key={i} position={[0, y, z]} rotation={[0, 0, Math.PI / 2]}>
                        <boxGeometry args={[0.04, 1.4, 0.04]} />
                        {blueprintMaterial}
                    </mesh>
                );
            })}
        </group>
    );
}

function WaterTile() {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            // Subtle water movement/shimmer
            meshRef.current.position.y = -0.05 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
        }
    });

    return (
        <group>
            {/* Deep Water Base */}
            <mesh position={[0, -0.4, 0]}>
                <boxGeometry args={[4, 0.8, 4]} />
                <meshStandardMaterial color="#0288D1" roughness={1} />
            </mesh>

            {/* Reflective Surface */}
            <mesh
                ref={meshRef}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.02, 0]}
            >
                <planeGeometry args={[3.95, 3.95]} />
                <MeshReflectorMaterial
                    blur={[300, 100]}
                    resolution={1024}
                    mixBlur={1}
                    mixStrength={60}
                    roughness={1}
                    depthScale={1.2}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#81D4FA"
                    metalness={0.5}
                    mirror={0.9}
                />
            </mesh>

            {/* Surface Blueprint Lines (Subtle) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <planeGeometry args={[3.98, 3.98]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.1} wireframe />
            </mesh>
        </group>
    );
}

// Beach Umbrella Component
function BeachUmbrella({ position, rotation }) {
    return (
        <group position={position} rotation={rotation} scale={0.4}>
            {/* Pole */}
            <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
                <meshStandardMaterial color="#FFF" />
            </mesh>
            {/* Umbrella Top */}
            <mesh position={[0, 2.8, 0]}>
                <cylinderGeometry args={[0.01, 3, 0.8, 12]} />
                <meshStandardMaterial color="#FF5252" />
            </mesh>
            <mesh position={[0, 2.75, 0]}>
                <cylinderGeometry args={[0.01, 3.1, 0.3, 12]} />
                <meshStandardMaterial color="#FFFFFF" transparent opacity={0.6} />
            </mesh>
        </group>
    );
}

// Park Tree Component
function ParkTree({ position, scale = 1 }) {
    return (
        <group position={position} scale={scale}>
            {/* Trunk */}
            <mesh position={[0, 0.8, 0]}>
                <cylinderGeometry args={[0.2, 0.3, 1.6, 8]} />
                <meshStandardMaterial color="#5D4037" />
            </mesh>
            {/* Leaves */}
            <mesh position={[0, 2, 0]}>
                <sphereGeometry args={[1.2, 12, 12]} />
                <meshStandardMaterial color="#43A047" />
            </mesh>
            <mesh position={[0, 3, 0]} scale={0.8}>
                <sphereGeometry args={[1, 12, 12]} />
                <meshStandardMaterial color="#66BB6A" />
            </mesh>
        </group>
    );
}

function BeachTile() {
    const foamRef = useRef();

    // Stable umbrella placement
    const umbrellas = useMemo(() => [
        { pos: [1.2, 0.1, 1.2], rot: [0, 0.5, 0] },
        { pos: [-1.2, 0.1, 0.8], rot: [0, -0.8, 0] }
    ], []);

    useFrame((state) => {
        if (foamRef.current) {
            // Animated wave wash effect
            const t = state.clock.elapsedTime * 1.5;
            foamRef.current.position.z = -0.5 + Math.sin(t) * 0.4;
            foamRef.current.material.opacity = 0.2 + Math.sin(t) * 0.1;
        }
    });

    return (
        <group scale={2}> {/* Beach tiles are larger */}
            {/* Sand Base */}
            <mesh position={[0, -0.05, 0]}>
                <boxGeometry args={[4, 0.1, 4]} />
                <meshStandardMaterial color="#FFE082" roughness={1} />
            </mesh>

            {/* Sea Water (Half Coverage) */}
            <mesh position={[0, -0.01, -1]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[4, 2]} />
                <MeshReflectorMaterial
                    blur={[300, 100]}
                    resolution={256}
                    mixBlur={1}
                    mixStrength={50}
                    roughness={1}
                    depthScale={1.2}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#0288D1"
                    metalness={0.5}
                    mirror={0.9}
                />
            </mesh>

            {/* Wavy Foam Line */}
            <mesh ref={foamRef} position={[0, 0.01, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[4.2, 0.15]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
            </mesh>

            {/* Coastal "Wet Sand" Effect */}
            <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[4, 0.5]} />
                <meshStandardMaterial color="#FFCA28" roughness={0.5} transparent opacity={0.4} />
            </mesh>

            {/* Umbrellas */}
            {umbrellas.map((u, i) => (
                <BeachUmbrella key={i} position={u.pos} rotation={u.rot} />
            ))}
        </group>
    );
}

function CanalModel() {
    return (
        <group>
            {/* Concrete Base */}
            <mesh position={[0, 0.1, 0]}>
                <boxGeometry args={[1.5, 0.2, 1.5]} />
                <meshStandardMaterial color="#B0BEC5" roughness={0.8} />
            </mesh>
            {/* Wooden Pylons */}
            {[[-0.6, 0.6], [0.6, 0.6], [-0.6, -0.6], [0.6, -0.6]].map((pos, i) => (
                <mesh key={i} position={[pos[0], 0.3, pos[1]]}>
                    <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
                    <meshStandardMaterial color="#5D4037" />
                </mesh>
            ))}
        </group>
    );
}

function WarehouseModel({ color }) {
    return (
        <group>
            {/* Main Warehouse Body - Uses dynamic color */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[1.5, 1.0, 2.8]} />
                <meshStandardMaterial color={color || "#B71C1C"} roughness={0.8} />
            </mesh>

            {/* Side Window Grid */}
            {[-1.0, -0.5, 0, 0.5, 1.0].map((z, i) => (
                [0.76, -0.76].map((x, j) => (
                    <mesh key={`win-${i}-${j}`} position={[x, 0.6, z]} rotation={[0, Math.PI / 2, 0]}>
                        <planeGeometry args={[0.3, 0.4]} />
                        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
                    </mesh>
                ))
            ))}

            {/* Lower Sloped Roof Layers */}
            {[
                { pos: [0.55, 1.05, 0], rot: [0, 0, -0.4], size: [1.2, 0.05, 3.0] },
                { pos: [-0.55, 1.05, 0], rot: [0, 0, 0.4], size: [1.2, 0.05, 3.0] }
            ].map((r, i) => (
                <mesh key={i} position={r.pos} rotation={r.rot}>
                    <boxGeometry args={r.size} />
                    <meshStandardMaterial color="#9E9E9E" metalness={0.5} roughness={0.5} />
                </mesh>
            ))}

            {/* Clerestory (Upper) Section */}
            <mesh position={[0, 1.3, 0]} castShadow>
                <boxGeometry args={[0.6, 0.6, 2.8]} />
                <meshStandardMaterial color="#B71C1C" roughness={0.8} />
            </mesh>
            {/* Upper Windows */}
            {[-1.0, -0.5, 0, 0.5, 1.0].map((z, i) => (
                [0.31, -0.31].map((x, j) => (
                    <mesh key={`up-win-${i}-${j}`} position={[x, 1.3, z]} rotation={[0, Math.PI / 2, 0]}>
                        <planeGeometry args={[0.2, 0.3]} />
                        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
                    </mesh>
                ))
            ))}

            {/* Top Roof Peak */}
            {[
                { pos: [0.2, 1.6, 0], rot: [0, 0, -0.5], size: [0.5, 0.05, 3.0] },
                { pos: [-0.2, 1.6, 0], rot: [0, 0, 0.5], size: [0.5, 0.05, 3.0] }
            ].map((r, i) => (
                <mesh key={i} position={r.pos} rotation={r.rot}>
                    <boxGeometry args={r.size} />
                    <meshStandardMaterial color="#9E9E9E" metalness={0.5} roughness={0.5} />
                </mesh>
            ))}

            {/* Front Open Entrance */}
            <mesh position={[0, 0.4, 1.41]}>
                <boxGeometry args={[1.0, 0.8, 0.02]} />
                <meshBasicMaterial color="#000" />
            </mesh>
            {/* Open Double Doors */}
            {[-0.6, 0.6].map((x, i) => (
                <mesh key={i} position={[x, 0.4, 1.6]} rotation={[0, i === 0 ? -Math.PI / 4 : Math.PI / 4, 0]}>
                    <boxGeometry args={[0.6, 0.8, 0.05]} />
                    <meshStandardMaterial color="#795548" roughness={0.9} />
                </mesh>
            ))}

            {/* Ground Base Detail */}
            <mesh position={[0, 0.02, 0]}>
                <boxGeometry args={[1.6, 0.05, 3.2]} />
                <meshStandardMaterial color="#424242" />
            </mesh>
        </group>
    );
}

function IndustrialZone({ color }) {
    return (
        <group>
            {/* Main Factory Floor - Uses dynamic color */}
            <mesh position={[0, 0.4, 0]} castShadow>
                <boxGeometry args={[1.5, 0.8, 2.0]} />
                <meshStandardMaterial color={color || "#B0A493"} roughness={0.8} />
            </mesh>

            {/* Sloped Roofs */}
            {[
                [-0.4, 0.8, 0],
                [0.4, 0.8, 0]
            ].map((pos, i) => (
                <mesh key={i} position={pos} rotation={[0, 0, i === 0 ? 0.2 : -0.2]}>
                    <boxGeometry args={[0.8, 0.1, 2.1]} />
                    <meshStandardMaterial color="#8D7B68" />
                </mesh>
            ))}

            {/* Tall Chimney */}
            <group position={[0.5, 0, -0.7]}>
                <mesh position={[0, 1.2, 0]} castShadow>
                    <cylinderGeometry args={[0.15, 0.2, 2.4, 12]} />
                    <meshStandardMaterial color="#A4907C" />
                </mesh>
                {/* Chimney Bands */}
                {[0.6, 1.2, 1.8].map((y, i) => (
                    <mesh key={i} position={[0, y, 0]}>
                        <torusGeometry args={[0.18, 0.02, 8, 16]} rotation={[Math.PI / 2, 0, 0]} />
                        <meshBasicMaterial color="#333" />
                    </mesh>
                ))}
            </group>

            {/* Cylindrical Silos */}
            {[
                [-0.8, 0.6, 0.6],
                [-0.8, 0.6, -0.4]
            ].map((pos, i) => (
                <group key={i} position={pos}>
                    <mesh castShadow>
                        <cylinderGeometry args={[0.35, 0.35, 1.2, 16]} />
                        <meshStandardMaterial color="#C8B6A6" />
                    </mesh>
                    <mesh position={[0, 0.61, 0]}>
                        <cylinderGeometry args={[0.35, 0, 0.15, 16]} />
                        <meshStandardMaterial color="#8D7B68" />
                    </mesh>
                </group>
            ))}

            {/* Loading Docks */}
            {[-0.5, 0, 0.5].map((z, i) => (
                <mesh key={i} position={[0.76, 0.3, z]}>
                    <boxGeometry args={[0.02, 0.4, 0.3]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
            ))}

            {/* Small Side Building */}
            <mesh position={[-0.9, 0.25, 1.2]} castShadow>
                <boxGeometry args={[0.6, 0.5, 0.6]} />
                <meshStandardMaterial color="#B0A493" />
            </mesh>
        </group>
    );
}

function Hospital() {
    return (
        <group>
            {/* Main Central Block */}
            <mesh position={[0, 0.75, 0]} castShadow>
                <boxGeometry args={[1.2, 1.5, 1.2]} />
                <meshStandardMaterial color="#ECEFF1" roughness={0.7} />
            </mesh>

            {/* Symmetrical Wings */}
            {[-1.0, 1.0].map((x, i) => (
                <group key={i}>
                    <mesh position={[x, 0.5, 0]} castShadow>
                        <boxGeometry args={[0.8, 1.0, 1.0]} />
                        <meshStandardMaterial color="#CFD8DC" roughness={0.7} />
                    </mesh>
                    {/* Windows on wings */}
                    {[0.3, 0.7].map(y => (
                        [0.2, -0.2].map(z => (
                            <mesh key={`${y}-${z}`} position={[x + (x > 0 ? 0.41 : -0.41), y, z]}>
                                <planeGeometry args={[0.3, 0.2]} />
                                <meshStandardMaterial color="#90CAF9" transparent opacity={0.6} />
                            </mesh>
                        ))
                    ))}
                </group>
            ))}

            {/* Rooftop Helipad Complex */}
            <group position={[0, 1.5, 0]}>
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.5, 32]} />
                    <meshStandardMaterial color="#455A64" />
                </mesh>
                <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.45, 0.5, 32]} />
                    <meshBasicMaterial color="#FFFFFF" />
                </mesh>
                {/* Red 'H' Symbol */}
                <group position={[0, 0.03, 0]}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[0.1, 0.4]} />
                        <meshBasicMaterial color="#F44336" />
                    </mesh>
                    <mesh position={[0.15, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[0.1, 0.4]} />
                        <meshBasicMaterial color="#F44336" />
                    </mesh>
                    <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
                        <planeGeometry args={[0.1, 0.2]} />
                        <meshBasicMaterial color="#F44336" />
                    </mesh>
                </group>
            </group>

            {/* Front Entrance Canopy */}
            <group position={[0, 0.35, 0.7]}>
                <mesh castShadow>
                    <boxGeometry args={[1.4, 0.2, 0.6]} />
                    <meshStandardMaterial color="#2196F3" />
                </mesh>
                {/* Canopy Pillars */}
                {[-0.6, 0.6].map((x, i) => (
                    <mesh key={i} position={[x, -0.175, 0.2]}>
                        <cylinderGeometry args={[0.05, 0.05, 0.35, 8]} />
                        <meshStandardMaterial color="#FFFFFF" />
                    </mesh>
                ))}
            </group>

            {/* Red Cross Symbols */}
            {[-0.5, 0.5].map((z, i) => (
                <group key={i} position={[0, 1.0, z * 1.22]}>
                    <mesh position={[0, 0, 0]} rotation={[0, i === 1 ? 0 : Math.PI, 0]}>
                        <circleGeometry args={[0.2, 16]} />
                        <meshBasicMaterial color="white" />
                    </mesh>
                    <mesh position={[0, 0, 0.01]} rotation={[0, i === 1 ? 0 : Math.PI, 0]}>
                        <planeGeometry args={[0.05, 0.2]} />
                        <meshBasicMaterial color="#F44336" />
                    </mesh>
                    <mesh position={[0, 0, 0.01]} rotation={[0, i === 1 ? 0 : Math.PI, Math.PI / 2]}>
                        <planeGeometry args={[0.05, 0.2]} />
                        <meshBasicMaterial color="#F44336" />
                    </mesh>
                </group>
            ))}

            {/* Decorative Landscaping */}
            <Tree position={[-1.2, 0, 0.8]} scale={0.5} />
            <Tree position={[1.2, 0, 0.8]} scale={0.5} />
        </group>
    );
}

function Ambulance({ position, rotation }) {
    return (
        <group position={position} rotation={rotation} scale={0.45}>
            {/* Chassis */}
            <mesh position={[0, 0.35, 0.1]} castShadow>
                <boxGeometry args={[1.2, 0.6, 2.6]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
            </mesh>

            {/* Rear Van Body */}
            <mesh position={[0, 1.0, -0.3]} castShadow>
                <boxGeometry args={[1.2, 0.8, 1.8]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
            </mesh>

            {/* Front Cabin */}
            <mesh position={[0, 0.8, 0.85]} castShadow>
                <boxGeometry args={[1.2, 0.4, 0.7]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
            </mesh>

            {/* Windshield */}
            <mesh position={[0, 0.92, 1.2]} rotation={[-Math.PI / 4, 0, 0]}>
                <planeGeometry args={[1.0, 0.8]} />
                <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Siren System */}
            <group position={[0, 1.45, -0.2]}>
                <mesh position={[0.2, 0, 0]}>
                    <boxGeometry args={[0.3, 0.1, 0.6]} />
                    <meshStandardMaterial color="#2196F3" emissive="#2196F3" emissiveIntensity={2} />
                </mesh>
                <mesh position={[-0.2, 0, 0]}>
                    <boxGeometry args={[0.3, 0.1, 0.6]} />
                    <meshStandardMaterial color="#F44336" emissive="#F44336" emissiveIntensity={2} />
                </mesh>
            </group>

            {/* Side Red Stripe */}
            {[-0.61, 0.61].map((x, i) => (
                <mesh key={i} position={[x, 0.5, 0.1]}>
                    <boxGeometry args={[0.02, 0.15, 2.6]} />
                    <meshStandardMaterial color="#F44336" />
                </mesh>
            ))}

            {/* Medical Crosses (Simplified) */}
            {[-0.61, 0.61].map((x, i) => (
                <group key={i} position={[x, 1.05, -0.5]}>
                    {/* Horizontal */}
                    <mesh rotation={[0, Math.PI / 2, 0]}>
                        <boxGeometry args={[0.4, 0.1, 0.05]} />
                        <meshBasicMaterial color="#2196F3" />
                    </mesh>
                    {/* Vertical */}
                    <mesh rotation={[0, Math.PI / 2, 0]}>
                        <boxGeometry args={[0.1, 0.4, 0.05]} />
                        <meshBasicMaterial color="#2196F3" />
                    </mesh>
                </group>
            ))}

            {/* Wheels */}
            {[
                [0.55, 0.2, 0.9],   // Front Right
                [0.55, 0.2, -0.8],  // Back Right
                [-0.55, 0.2, 0.9],  // Front Left
                [-0.55, 0.2, -0.8]  // Back Left
            ].map((pos, i) => (
                <group key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
                    <mesh>
                        <cylinderGeometry args={[0.25, 0.25, 0.25, 16]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    <mesh position={[0, 0.13, 0]}>
                        <cylinderGeometry args={[0.15, 0.15, 0.05, 12]} />
                        <meshStandardMaterial color="#AAA" metalness={0.8} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// --- Toy-Town UI Elements ---

function ToyCar({ color = '#FF7043', position, rotation }) {
    return (
        <group position={position} rotation={rotation} scale={0.45}>
            {/* Main Chassis / Body - Front is +Z */}
            <mesh position={[0, 0.35, 0]} castShadow>
                <boxGeometry args={[1.1, 0.6, 2.4]} />
                <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>

            {/* Cabin Area */}
            <mesh position={[0, 0.8, -0.1]} castShadow>
                <boxGeometry args={[0.95, 0.5, 1.3]} />
                <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>

            {/* Front Windshield (Dark Glass) */}
            <mesh position={[0, 0.8, 0.56]} rotation={[-Math.PI / 6, 0, 0]}>
                <planeGeometry args={[0.9, 0.6]} />
                <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Rear Windshield (Dark Glass) */}
            <mesh position={[0, 0.8, -0.76]} rotation={[Math.PI / 6.5, 0, 0]}>
                <planeGeometry args={[0.9, 0.55]} />
                <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Side Windows */}
            {[0.48, -0.48].map((x, i) => (
                <group key={i} position={[x, 0.8, -0.1]}>
                    <mesh rotation={[0, i === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
                        <planeGeometry args={[1.2, 0.4]} />
                        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
                    </mesh>
                </group>
            ))}

            {/* Headlights (White Glow) */}
            {[0.4, -0.4].map((x, i) => (
                <mesh key={i} position={[x, 0.45, 1.21]}>
                    <boxGeometry args={[0.25, 0.15, 0.05]} />
                    <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={2} />
                </mesh>
            ))}

            {/* Taillights (Red Glow) */}
            {[0.4, -0.4].map((x, i) => (
                <mesh key={i} position={[x, 0.45, -1.21]}>
                    <boxGeometry args={[0.25, 0.15, 0.05]} />
                    <meshStandardMaterial color="#F44336" emissive="#F44336" emissiveIntensity={1.5} />
                </mesh>
            ))}

            {/* Wheels with Hubcaps */}
            {[
                [0.55, 0.2, 0.75],   // Front Right
                [0.55, 0.2, -0.75],  // Back Right
                [-0.55, 0.2, 0.75],  // Front Left
                [-0.55, 0.2, -0.75]  // Back Left
            ].map((pos, i) => (
                <group key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
                    {/* Tire */}
                    <mesh>
                        <cylinderGeometry args={[0.25, 0.25, 0.25, 16]} />
                        <meshStandardMaterial color="#111" roughness={1} />
                    </mesh>
                    {/* Hubcap / Rim */}
                    <mesh position={[0, 0.13, 0]}>
                        <cylinderGeometry args={[0.15, 0.15, 0.05, 12]} />
                        <meshStandardMaterial color="#AAA" metalness={0.8} roughness={0.2} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

function MarkerPin({ type, label, color, status, loadPercent }) {
    const isCritical = status === 'critical' || status === 'collapsed';

    return (
        <Billboard follow={true} position={[0, 3.5, 0]}>
            <Html transform center scale={0.15}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    {/* Bubble Label */}
                    <div style={{
                        background: isCritical ? '#FF3D00' : 'rgba(255, 255, 255, 0.95)',
                        color: isCritical ? 'white' : '#37474F',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 700,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        border: `2px solid ${isCritical ? '#FF3D00' : color}`,
                        whiteSpace: 'nowrap'
                    }}>
                        {label.toUpperCase()}
                    </div>
                    {/* Load Indicator */}
                    {loadPercent > 0 && (
                        <div style={{
                            width: '40px',
                            height: '6px',
                            background: '#ECEFF1',
                            borderRadius: '3px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${loadPercent}%`,
                                height: '100%',
                                background: loadPercent > 80 ? '#FF3D00' : '#4CAF50'
                            }} />
                        </div>
                    )}
                </div>
            </Html>
        </Billboard>
    );
}

function ScannerRing({ color }) {
    const meshRef = useRef();
    useFrame((state) => {
        if (meshRef.current) {
            const t = state.clock.elapsedTime * 2;
            meshRef.current.position.y = 0.5 + Math.sin(t) * 1.5;
            meshRef.current.scale.setScalar(1 + Math.cos(t * 0.5) * 0.2);
            meshRef.current.material.opacity = 0.5 + Math.cos(t) * 0.3;
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.2, 1.3, 48]} />
            <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
    );
}



// --- Advanced Simulation Visual Effects ---

function WhirlpoolEffect({ position, scale = 1, color = '#ff3131' }) {
    const groupRef = useRef();
    const particlesRef = useRef();

    // Create random particle data
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.5 + Math.random() * 3;
            const y = Math.random() * 8;
            temp.push({ angle, radius, y, speed: 0.1 + Math.random() * 0.1 });
        }
        return temp;
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.05;
        }

        const time = state.clock.elapsedTime;
        particles.forEach((p, i) => {
            const mesh = particlesRef.current;
            if (mesh) {
                const matrix = new THREE.Matrix4();
                const angle = p.angle + time * p.speed * 8;
                const radius = p.radius * (1 - (p.y / 12));
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;

                matrix.setPosition(x, p.y, z);
                mesh.setMatrixAt(i, matrix);
            }
        });
        if (particlesRef.current) particlesRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group position={position} scale={scale} ref={groupRef}>
            <instancedMesh ref={particlesRef} args={[null, null, 50]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshBasicMaterial color={color} transparent opacity={0.6} />
            </instancedMesh>

            <mesh position={[0, 4, 0]}>
                <cylinderGeometry args={[0.05, 1.5, 8, 32, 1, true]} />
                <meshPhongMaterial
                    color={color}
                    transparent
                    opacity={0.15}
                    side={THREE.DoubleSide}
                    emissive={color}
                    emissiveIntensity={0.3}
                />
            </mesh>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[0.2, 4, 64]} />
                <meshBasicMaterial color={color} transparent opacity={0.1} />
            </mesh>
        </group>
    );
}

// 3D Node Component
function Node3D({ node, isSelected, onSelect, onMove }) {
    const groupRef = useRef();
    const [hovered, setHovered] = useState(false);

    // --- Dynamic Real-Time Color Calculation ---
    const color = useMemo(() => {
        if (node.status === 'disabled' || node.status === 'collapsed') {
            return '#444444';
        }
        if (node.status === 'flooded') {
            return '#00aaff';
        }

        const baseColorStr = NODE_COLORS[node.type] || NODE_COLORS['default'];
        const loadRatio = node.load / node.capacity;

        const baseColor = new THREE.Color(baseColorStr);
        const warningColor = new THREE.Color('#FF8800');
        const criticalColor = new THREE.Color('#FF0055');

        if (loadRatio > 0.8) {
            const factor = (loadRatio - 0.8) / 0.2;
            return baseColor.lerp(criticalColor, factor).getStyle();
        } else if (loadRatio > 0.4) {
            const factor = (loadRatio - 0.4) / 0.4;
            return baseColor.lerp(warningColor, factor).getStyle();
        }

        return baseColorStr;
    }, [node.load, node.capacity, node.type, node.status]);

    const heightScale = useMemo(() => {
        // If Gemini provided explicit height, use it directly (normalized)
        if (node.height && node.height > 0) {
            return node.height * 0.5; // Scale down a bit so 10 becomes 5 units high
        }
        // Default dynamic growth based on load
        return 1 + (node.load / node.capacity) * 2;
    }, [node.load, node.capacity, node.height]);

    useFrame((state) => {
        if (groupRef.current) {

            let sx = 1, sy = 1, sz = 1;

            // Apply height scaling mainly to building types
            if ([NODE_TYPES.HOSPITAL, NODE_TYPES.WAREHOUSE, NODE_TYPES.ZONE, NODE_TYPES.HUB, NODE_TYPES.SHELTER].includes(node.type)) {
                sy = Math.max(1, heightScale);
            }

            if (hovered) {
                const s = 1.2 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
                sx *= s; sy *= s; sz *= s;
            }

            if (node.status === 'warning' || node.status === 'critical') {
                const pulse = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.05;
                sx *= pulse; sy *= pulse; sz *= pulse;
            }

            // Smoothly interpolate scale
            groupRef.current.scale.lerp(new THREE.Vector3(sx, sy, sz), 0.1);
        }
    });

    const position = useMemo(() => {
        const x = (node.x - 500) / 100;
        const zIndex = (node.y - 500) / 100;
        return [x, 0, zIndex]; // Nodes always on the ground in Toy-Town
    }, [node.x, node.y]);

    if (position.some(p => isNaN(p))) return null;

    const content = (
        <group position={position}>
            {/* Visual Node */}
            <group
                ref={groupRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(node.id);
                }}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <NodeGeometry type={node.type} color={color} hovered={hovered} selected={isSelected} />
            </group>

            {/* Toy-Town Infographic Marker */}
            <MarkerPin
                type={node.type}
                label={node.label}
                color={color}
                status={node.status}
                loadPercent={Math.round((node.load / node.capacity) * 100)}
            />

            {isSelected && <ScannerRing color={color} />}
        </group>
    );

    if (isSelected) {
        return (
            <PivotControls
                depthTest={false}
                anchor={[0, 0, 0]}
                scale={1}
                activeAxes={[true, false, true]}
                onDrag={(l) => {
                    const position = new THREE.Vector3();
                    const rotation = new THREE.Quaternion();
                    const scale = new THREE.Vector3();
                    l.decompose(position, rotation, scale);

                    const newX = (position.x * 100) + 500;
                    const newY = (position.z * 100) + 500;
                    onMove(node.id, newX, newY);
                }}
            >
                {content}
            </PivotControls>
        );
    }

    return content;
}

// River Boat Component (Low-Poly Cruiser)
function RiverBoat({ position, rotation }) {
    return (
        <group position={position} rotation={rotation} scale={0.3}>
            {/* Hull */}
            <mesh castShadow>
                <boxGeometry args={[1.5, 0.6, 4]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
            </mesh>
            {/* Deck / Cabin */}
            <mesh position={[0, 0.5, 0.2]} castShadow>
                <boxGeometry args={[1.2, 0.5, 2]} />
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            {/* Windows */}
            <mesh position={[0, 0.6, 1.21]}>
                <boxGeometry args={[1, 0.3, 0.05]} />
                <meshStandardMaterial color="#222" metalness={0.9} />
            </mesh>
            {/* Stripe on Hull */}
            <mesh position={[0, 0.1, 0]}>
                <boxGeometry args={[1.55, 0.1, 4.05]} />
                <meshStandardMaterial color="#0288D1" />
            </mesh>
        </group>
    );
}

// River Edge Component (Cinematic Organic Water)
function RiverEdge({ edge, roadCurve }) {
    const shimmerRef = useRef();

    // Stable boat placement based on edge ID
    const boats = useMemo(() => {
        const boatCount = (parseInt(edge.id.slice(-1)) % 2) + 1; // 1-2 boats
        return Array.from({ length: boatCount }).map((_, i) => {
            const t = 0.2 + (i * 0.5); // Simplified boat placement
            const pos = roadCurve.getPoint(t);
            const nextPos = roadCurve.getPoint(Math.min(0.99, t + 0.01));
            const angle = Math.atan2(nextPos.x - pos.x, nextPos.z - pos.z);
            // Offset from center
            const sideOffset = (i % 2 === 0 ? 0.35 : -0.35);
            const ox = Math.cos(angle) * sideOffset;
            const oz = -Math.sin(angle) * sideOffset;
            return {
                position: [pos.x + ox, 0.08, pos.z + oz],
                rotation: [0, angle, 0]
            };
        });
    }, [edge.id, roadCurve]);

    useFrame((state) => {
        if (shimmerRef.current) {
            shimmerRef.current.material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        }
    });

    return (
        <group>
            {/* Outer Park Fringe (Green Grass) */}
            <mesh position={[0, -0.02, 0]}>
                <tubeGeometry args={[roadCurve, 16, 4.5, 4, false]} />
                <meshStandardMaterial color="#388E3C" roughness={1} />
            </mesh>

            {/* Trees in the Park */}
            {[0.1, 0.35, 0.6, 0.85].map((t, idx) => {
                const pos = roadCurve.getPoint(t);
                const nextPos = roadCurve.getPoint(Math.min(0.99, t + 0.01));
                const angle = Math.atan2(nextPos.x - pos.x, nextPos.z - pos.z);
                const side = idx % 2 === 0 ? 4.2 : -4.2;
                const tx = pos.x + Math.cos(angle) * side;
                const tz = pos.z - Math.sin(angle) * side;
                return <ParkTree key={idx} position={[tx, 0, tz]} scale={0.4 + Math.random() * 0.2} />;
            })}

            {/* Inner Shoreline (Sand/Beige) */}
            <mesh position={[0, -0.01, 0]}>
                <tubeGeometry args={[roadCurve, 16, 3.8, 4, false]} />
                <meshStandardMaterial color="#E1D4BB" roughness={1} />
            </mesh>

            {/* Deep Water Base (The "Volume") */}
            <mesh position={[0, -0.2, 0]}>
                <tubeGeometry args={[roadCurve, 16, 3.5, 4, false]} />
                <meshStandardMaterial color="#01579B" roughness={1} />
            </mesh>

            {/* Main River Water Surface (Reflective) */}
            <mesh scale={[1, 0.03, 1]}>
                <tubeGeometry args={[roadCurve, 16, 3.5, 6, false]} />
                <MeshReflectorMaterial
                    blur={[300, 100]}
                    resolution={256}
                    mixBlur={1}
                    mixStrength={70}
                    roughness={1}
                    depthScale={1.2}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#0288D1"
                    metalness={0.5}
                    mirror={0.9}
                />
            </mesh>

            {/* Moving Current Stripes (Strategic Flow) */}
            {[-1.2, 0, 1.2].map((offset, idx) => (
                <mesh key={idx} scale={[1, 0.032, 1]} position={[0, 0.005 + (idx * 0.001), 0]}>
                    <tubeGeometry args={[roadCurve, 12, 0.4, 4, false]} />
                    <meshStandardMaterial
                        color="#01579B"
                        transparent
                        opacity={0.4}
                        roughness={0.2}
                    />
                </mesh>
            ))}

            {/* Animated Surface Shimmer */}
            <mesh
                ref={shimmerRef}
                scale={[1, 0.035, 1]}
                position={[0, 0.01, 0]}
            >
                <tubeGeometry args={[roadCurve, 16, 3.52, 6, false]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.15}
                    wireframe
                />
            </mesh>

            {/* Boats (Larger Scale) */}
            {boats.map((b, i) => (
                <RiverBoat key={i} position={b.position} rotation={b.rotation} />
            ))}
        </group>
    );
}

// 3D Edge Component (Switch between Road and River)
function Edge3D({ edge, nodes, ghostTargetPos, onClick }) {
    const source = nodes.get(edge.source);
    const target = edge.target === 'GHOST' ? null : nodes.get(edge.target);

    const points = useMemo(() => {
        if (!source || (!target && !ghostTargetPos)) return [];
        const start = new THREE.Vector3((source.x - 500) / 100, 0.02, (source.y - 500) / 100);

        let end;
        if (edge.target === 'GHOST' && ghostTargetPos) {
            end = new THREE.Vector3(ghostTargetPos[0], 0.02, ghostTargetPos[2]);
        } else if (target) {
            end = new THREE.Vector3((target.x - 500) / 100, 0.02, (target.y - 500) / 100);
        } else return [];

        // Rivers should be extra curved/winding
        const isRiver = edge.type === 'RIVER';
        const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
        const dist = start.distanceTo(end);
        mid.y = 0.02;

        const angle = Math.atan2(end.z - start.z, end.x - start.x);
        // Rivers get significantly more curvature for organic feel
        const curvature = edge.curvature ?? (isRiver ? 0.6 : 0.2);
        const offset = new THREE.Vector3(Math.cos(angle + Math.PI / 2), 0, Math.sin(angle + Math.PI / 2)).multiplyScalar(dist * curvature);
        mid.add(offset);

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        return curve.getPoints(isRiver ? 50 : 30);
    }, [source, target, ghostTargetPos, edge.target, edge.type, edge.curvature]);

    if (points.length < 2) return null;

    const midIndex = Math.floor(points.length / 2);
    const roadCurve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

    if (edge.type === 'RIVER') {
        return <RiverEdge edge={edge} roadCurve={roadCurve} />;
    }

    if (edge.type === 'BRIDGE') {
        return <SuspensionBridgeV2 roadCurve={roadCurve} />;
    }

    return (
        <group>
            {/* Asphalt Main Road - Flattened Tube for "Ribbon" look */}
            <mesh
                scale={[1, 0.04, 1]}
                onClick={(e) => {
                    e.stopPropagation();
                    if (onClick) onClick(edge.id);
                }}
            >
                <tubeGeometry args={[roadCurve, 64, 0.45, 8, false]} />
                <meshStandardMaterial
                    color="#37474F"
                    roughness={0.9}
                />
            </mesh>

            {/* Lane Markings (Dashed Line effect) */}
            <group position={[0, 0.02, 0]}>
                {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((t) => {
                    const p = roadCurve.getPoint(t);
                    const pNext = roadCurve.getPoint(Math.min(0.99, t + 0.05));
                    if (!p || !pNext) return null;

                    return (
                        <mesh key={t} position={[p.x, 0.025, p.z]} rotation={[-Math.PI / 2, 0, -Math.atan2(pNext.z - p.z, pNext.x - p.x)]}>
                            <planeGeometry args={[0.3, 0.05]} />
                            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.6} side={THREE.DoubleSide} />
                        </mesh>
                    );
                })}
            </group>

            {(edge.state === EDGE_STATE.CONGESTED || edge.state === EDGE_STATE.BLOCKED) && (
                <CongestionCallout
                    position={[points[midIndex].x, 1, points[midIndex].z]}
                    edge={edge}
                />
            )}
        </group>
    );
}

// Congestion/Blocked Indicator
function CongestionCallout({ position, edge }) {
    return (
        <group position={position}>
            <Billboard follow={true}>
                <Html transform center scale={1.5} distanceFactor={10}>
                    <div style={{
                        background: edge.state === 'BLOCKED' ? '#FF3D00' : '#FF9100',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.5)'
                    }}>
                        {edge.state === 'BLOCKED' ? <ShieldAlert size={14} /> : <AlertTriangle size={14} />}
                        <span>{edge.state === 'BLOCKED' ? 'BLOCKED' : 'CONGESTED'}</span>
                    </div>
                </Html>
            </Billboard>
        </group>
    );
}

// Flow Particle (Toy-Town Cars)
function FlowParticle({ edge, nodes, index }) {
    const carRef = useRef();
    const [progress, setProgress] = useState(index * 0.25);

    useFrame((_, delta) => {
        if (!edge || !nodes.has(edge.source) || !nodes.has(edge.target)) return;
        if (edge.state === EDGE_STATE.BLOCKED || edge.flow === 0) return;

        setProgress(prev => {
            const speed = (0.005 + (edge.flow / (edge.maxFlow || 1)) * 0.01) * 60 * delta;
            const next = prev + speed * 0.1;
            return next > 1 ? 0 : next;
        });

        const source = nodes.get(edge.source);
        const target = nodes.get(edge.target);

        const start = new THREE.Vector3((source.x - 500) / 100, 0.03, (source.y - 500) / 100);
        const end = new THREE.Vector3((target.x - 500) / 100, 0.03, (target.y - 500) / 100);
        const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
        const dist = start.distanceTo(end);
        mid.y = 0.03;
        const angle = Math.atan2(end.z - start.z, end.x - start.x);
        const curvature = edge.curvature ?? 0.2;
        const offset = new THREE.Vector3(Math.cos(angle + Math.PI / 2), 0, Math.sin(angle + Math.PI / 2)).multiplyScalar(dist * curvature);
        mid.add(offset);
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);

        const pos = curve.getPoint(progress);
        const tangent = curve.getTangent(progress);

        if (carRef.current) {
            carRef.current.position.copy(pos);
            carRef.current.lookAt(pos.clone().add(tangent));
        }
    });

    if (!nodes.has(edge.source) || !nodes.has(edge.target) || edge.state === EDGE_STATE.BLOCKED) return null;

    return <ToyCar ref={carRef} color={index % 2 === 0 ? '#26C6DA' : '#FF7043'} />;
}

// Scene Helper
function Scene({
    showTopology,
    activeTool,
    selectedNodeId,
    onNodeSelect,
    selectedEdgeId,
    onEdgeSelect,
    themeMode
}) {
    const isNight = themeMode === 'night';
    const engine = useSimulation();
    const [_, setVersion] = useState(0);
    const [connStartNodeId, setConnStartNodeId] = useState(null);
    const [mousePoint, setMousePoint] = useState(null);
    const [ripples, setRipples] = useState([]);
    const spotLightRef = useRef();

    const nodesArr = Array.from(engine.nodes.values());
    const edgesArr = Array.from(engine.edges.values());

    // Logic to detect disaster zones for visuals
    const disasterNodes = nodesArr.filter(n =>
        n.status === 'critical' ||
        n.status === 'collapsed' ||
        n.label?.toLowerCase().includes('risk: high') ||
        n.label?.toLowerCase().includes('botnet')
    );

    useEffect(() => {
        let lastNodeCount = engine.nodes.size;
        let lastEdgeCount = engine.edges.size;

        const unsubscribe = engine.subscribe(() => {
            if (engine.nodes.size !== lastNodeCount || engine.edges.size !== lastEdgeCount) {
                lastNodeCount = engine.nodes.size;
                lastEdgeCount = engine.edges.size;
                setVersion(v => v + 1);
            }
        });
        return unsubscribe;
    }, [engine]);

    const handleNodeMove = (id, x, y) => {
        const node = engine.getNodeById(id);
        if (node) {
            node.x = Math.max(0, Math.min(1000, x));
            node.y = Math.max(0, Math.min(1000, y));
            engine.notify();
        }
    };

    const handlePlaneClick = (e) => {
        if (Object.values(NODE_TYPES).includes(activeTool)) {
            const point = e.point;
            const wx = (point.x * 100) + 500;
            const wy = (point.z * 100) + 500;

            engine.addNode({
                type: activeTool,
                x: wx,
                y: wy,
                label: `${activeTool}_${Math.floor(Math.random() * 100)}`
            });

            // Trigger ripple
            const rippleId = Date.now();
            setRipples(prev => [...prev, { id: rippleId, pos: [point.x, 0.05, point.z] }]);
            setTimeout(() => {
                setRipples(prev => prev.filter(r => r.id !== rippleId));
            }, 2000);
        } else {
            onNodeSelect(null);
            onEdgeSelect(null);
            setConnStartNodeId(null);
        }
    };

    const handleNodeClick = (id) => {
        if (activeTool === 'DELETE') {
            engine.removeNode(id);
            onNodeSelect(null);
            return;
        }

        if (activeTool === 'CONNECT' || activeTool === 'RIVER') {
            if (!connStartNodeId) {
                setConnStartNodeId(id);
            } else if (connStartNodeId !== id) {
                engine.addEdge(connStartNodeId, id, {
                    maxFlow: 50,
                    type: activeTool // Pass tool type as edge type
                });
                setConnStartNodeId(null);
            }
            return;
        }

        onNodeSelect(id);
    };

    const handleEdgeClick = (id) => {
        if (activeTool === 'DELETE') {
            engine.removeEdge(id);
            if (selectedEdgeId === id) onEdgeSelect(null);
            return;
        }

        if (activeTool === 'CURSOR') {
            onEdgeSelect(id);
            onNodeSelect(null); // Clear node selection
        }
    };

    const handlePointerMove = (e) => {
        if (activeTool === 'CONNECT' && connStartNodeId) {
            setMousePoint(e.point);
        }
    };

    const nodesArr_internal = Array.from(engine.nodes.values());
    const edgesArr_internal = Array.from(engine.edges.values());

    return (
        <>
            {/* Directional Light for soft toy-like shadows */}
            <directionalLight
                position={[15, 25, 10]}
                intensity={isNight ? 0.4 : 1.2}
                castShadow
                shadow-mapSize={[1024, 1024]}
                color={isNight ? '#a5c9ff' : '#ffffff'}
            />
            <ambientLight intensity={isNight ? 0.2 : 0.8} />

            <Environment preset={isNight ? "city" : "park"} />

            {/* Toy-Town Landscape: Lush Green or Dark Night Base */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color={isNight ? '#1B5E20' : '#81C784'} roughness={1} />
            </mesh>

            {/* Decorative scattered trees */}
            <group>
                {Array.from({ length: 40 }).map((_, i) => (
                    <Tree
                        key={i}
                        position={[
                            (Math.random() - 0.5) * 60,
                            0,
                            (Math.random() - 0.5) * 60
                        ]}
                        scale={0.5 + Math.random() * 0.5}
                    />
                ))}
            </group>

            <Grid
                args={[100, 100]}
                cellSize={1}
                cellThickness={0.5}
                cellColor={isNight ? '#334155' : '#FFFFFF'}
                sectionSize={5}
                sectionThickness={1}
                sectionColor={isNight ? '#475569' : '#FFFFFF'}
                fadeDistance={50}
                infiniteGrid
            />

            {/* Atmospheric Fog - Light & Airy or Dark Night */}
            <fog attach="fog" args={[isNight ? '#0f172a' : '#E3F2FD', 30, 90]} />

            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.01, 0]}
                onClick={handlePlaneClick}
                onPointerMove={handlePointerMove}
            >
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {nodesArr.map(node => (
                <Node3D
                    key={node.id}
                    node={node}
                    isSelected={selectedNodeId === node.id}
                    onSelect={() => handleNodeClick(node.id)}
                    onMove={handleNodeMove}
                />
            ))}

            {showTopology && edgesArr.map(edge => (
                <Edge3D key={edge.id} edge={edge} nodes={engine.nodes} onClick={handleEdgeClick} />
            ))}

            {/* Disaster Visual Overlays */}
            {disasterNodes.map(node => (
                <WhirlpoolEffect
                    key={`whirlpool-${node.id}`}
                    position={[(node.x - 500) / 100, 0, (node.y - 500) / 100]}
                    scale={0.8}
                    color={node.label?.toLowerCase().includes('botnet') ? '#ff00ff' : '#ff3131'}
                />
            ))}

            {/* Ghost Edge for Connection Tool */}
            {activeTool === 'CONNECT' && connStartNodeId && mousePoint && (
                <Edge3D
                    nodes={engine.nodes}
                    edge={{
                        source: connStartNodeId,
                        target: 'GHOST',
                        state: EDGE_STATE.NORMAL,
                        isGhost: true
                    }}
                    // Override target node for ghost edge
                    ghostTargetPos={[(mousePoint.x), (mousePoint.y), (mousePoint.z)]}
                />
            )}

            {edgesArr.map(edge => (
                Array.from({ length: 4 }).map((_, i) => (
                    <FlowParticle key={`${edge.id}-p-${i}`} edge={edge} nodes={engine.nodes} index={i} />
                ))
            ))}
        </>
    );
}

export default function GraphVisualizer3D({
    showTopology = true,
    activeTool,
    selectedNodeId,
    onNodeSelect,
    selectedEdgeId,
    onEdgeSelect,
    themeMode
}) {
    const [isLegendCollapsed, setIsLegendCollapsed] = useState(false);
    const isNight = themeMode === 'night';

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Canvas
                key={themeMode}
                shadows
                gl={{ antialias: true }}
                style={{ background: isNight ? '#0f172a' : '#E3F2FD', transition: 'background 0.5s ease' }} // Dynamic Background
            >
                <PerspectiveCamera makeDefault position={[18, 18, 18]} fov={35} />
                <OrbitControls
                    makeDefault
                    maxPolarAngle={Math.PI / 2.2}
                    minDistance={10}
                    maxDistance={60}
                    enableDamping
                />

                <Scene
                    showTopology={showTopology}
                    activeTool={activeTool}
                    selectedNodeId={selectedNodeId}
                    onNodeSelect={onNodeSelect}
                    selectedEdgeId={selectedEdgeId}
                    onEdgeSelect={onEdgeSelect}
                    themeMode={themeMode}
                />
                <GizmoHelper
                    alignment="bottom-right"
                    margin={[80, 80]}
                >
                    <GizmoViewport axisColors={['#ff3653', '#0adb50', '#2c8fdf']} labelColor="black" />
                </GizmoHelper>
            </Canvas>

            {/* Legend Overlay - Toy-Town Style */}
            <div style={{
                position: 'absolute',
                top: '6rem',
                right: '1.5rem',
                padding: isLegendCollapsed ? '0.75rem 1rem' : '1.5rem',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                color: '#37474F',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                pointerEvents: 'auto',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                width: isLegendCollapsed ? 'auto' : '200px',
                overflow: 'hidden',
                zIndex: 20
            }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: isLegendCollapsed ? 0 : '1rem',
                        cursor: 'pointer'
                    }}
                    onClick={() => setIsLegendCollapsed(!isLegendCollapsed)}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Layers size={14} color="#00f3ff" />
                        <span style={{ fontWeight: 600, letterSpacing: '0.05em', color: '#00f3ff' }}>
                            TOPOLOGY
                        </span>
                    </div>
                    {isLegendCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </div>

                {!isLegendCollapsed && (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {Object.entries(NODE_TYPES).map(([key, value]) => {
                            const Icon = {
                                [NODE_TYPES.HOSPITAL]: HospitalIcon,
                                [NODE_TYPES.WAREHOUSE]: WarehouseIcon,
                                [NODE_TYPES.INDUSTRIAL]: FactoryIcon,
                                [NODE_TYPES.BRIDGE]: WavesIcon,
                                [NODE_TYPES.SOURCE]: ArrowRightIcon,
                                [NODE_TYPES.SINK]: ArrowDownIcon,
                                [NODE_TYPES.AMBULANCE]: AmbulanceIcon,
                                [NODE_TYPES.VEHICLE]: CarIcon,
                                [NODE_TYPES.HOUSE]: HomeIcon,
                                [NODE_TYPES.BUILDING]: BuildingIcon
                            }[value] || Layers;

                            return (
                                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Icon size={12} color={NODE_COLORS[value] || '#aaa'} />
                                    <span style={{ color: '#aaa', fontWeight: 500 }}>
                                        {value === NODE_TYPES.SOURCE ? 'SOURCE (IN)' :
                                            value === NODE_TYPES.SINK ? 'SINK (OUT)' : key}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
