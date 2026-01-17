import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { RoleNode, RoleLink, formatRoleName } from '../../utils/roleNetwork';

interface RoleNetworkGraphProps {
  nodes: RoleNode[];
  links: RoleLink[];
  width?: number;
  height?: number;
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'human' | 'ai';
  count: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node;
  target: string | D3Node;
  value: number;
  percentage: number;
}

export const RoleNetworkGraph: React.FC<RoleNetworkGraphProps> = ({
  nodes,
  links,
  width = 900,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null);

  // Force controls
  const [chargeStrength, setChargeStrength] = useState(-300);
  const [linkDistance, setLinkDistance] = useState(150);
  const [linkStrength, setLinkStrength] = useState(0.5);
  const [separationStrength, setSeparationStrength] = useState(0.3);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Role colors
    const ROLE_COLORS: Record<string, string> = {
      'information-seeker': '#7b68ee',
      'provider': '#4ade80',
      'director': '#ec4899',
      'collaborator': '#06b6d4',
      'social-expressor': '#fbbf24',
      'relational-peer': '#4ade80',
      'expert-system': '#7b68ee',
      'learning-facilitator': '#06b6d4',
      'advisor': '#ec4899',
      'co-constructor': '#4ade80',
      'social-facilitator': '#fbbf24',
    };

    const d3Nodes: D3Node[] = nodes.map(n => ({
      id: n.id,
      label: n.label,
      type: n.type,
      count: n.count
    }));

    const d3Links: D3Link[] = links.map(l => ({
      source: l.source,
      target: l.target,
      value: l.value,
      percentage: l.percentage
    }));

    // Custom force to repel nodes of the same type
    const sameTypeRepulsionForce = () => {
      const strength = chargeStrength * 0.5; // Half the main charge strength

      return (alpha: number) => {
        for (let i = 0; i < d3Nodes.length; i++) {
          for (let j = i + 1; j < d3Nodes.length; j++) {
            const nodeA = d3Nodes[i];
            const nodeB = d3Nodes[j];

            // Only apply force if nodes are of the same type
            if (nodeA.type === nodeB.type) {
              const dx = (nodeB.x || 0) - (nodeA.x || 0);
              const dy = (nodeB.y || 0) - (nodeA.y || 0);
              const distance = Math.sqrt(dx * dx + dy * dy) || 1;

              // Repulsion force (inversely proportional to distance)
              const force = (strength * alpha) / (distance * distance);
              const fx = (dx / distance) * force;
              const fy = (dy / distance) * force;

              nodeA.vx = (nodeA.vx || 0) - fx;
              nodeA.vy = (nodeA.vy || 0) - fy;
              nodeB.vx = (nodeB.vx || 0) + fx;
              nodeB.vy = (nodeB.vy || 0) + fy;
            }
          }
        }
      };
    };

    // Create force simulation
    const simulation = d3.forceSimulation<D3Node>(d3Nodes)
      .force('link', d3.forceLink<D3Node, D3Link>(d3Links)
        .id(d => d.id)
        .distance(linkDistance)
        .strength(linkStrength)
      )
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50))
      .force('x', d3.forceX<D3Node>((d: D3Node) => d.type === 'human' ? width * 0.3 : width * 0.7).strength(separationStrength))
      .force('y', d3.forceY<D3Node>(height / 2).strength(0.1))
      .force('sameTypeRepulsion', sameTypeRepulsionForce());

    simulationRef.current = simulation;

    // Create arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Draw links
    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(d3Links)
      .join('line')
      .attr('stroke', d => {
        const sourceNode = d.source as D3Node;
        return ROLE_COLORS[sourceNode.label] || '#999';
      })
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    // Draw nodes
    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(d3Nodes)
      .join('g');

    node.call(
      d3.drag<SVGGElement, D3Node>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded) as any
    );

    node.append('circle')
      .attr('r', d => Math.sqrt(d.count) * 5 + 15)
      .attr('fill', d => ROLE_COLORS[d.label] || '#888')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    node.append('text')
      .text(d => formatRoleName(d.label))
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .attr('pointer-events', 'none');

    node.append('text')
      .text(d => d.count)
      .attr('x', d => Math.sqrt(d.count) * 5 + 15)
      .attr('y', d => -(Math.sqrt(d.count) * 5 + 15))
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fbbf24')
      .attr('pointer-events', 'none');

    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'network-tooltip')
      .style('position', 'absolute')
      .style('opacity', 0)
      .style('background-color', 'rgba(0, 0, 0, 0.8)')
      .style('color', '#fff')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('font-size', '13px')
      .style('pointer-events', 'none')
      .style('z-index', 1000);

    node.on('mouseover', function(event, d) {
      d3.select(this).select('circle')
        .attr('stroke-width', 4);

      tooltip
        .style('opacity', 1)
        .html(`
          <strong>${formatRoleName(d.label)}</strong><br/>
          <span style="font-size: 0.9em;">Type: ${d.type === 'human' ? 'Human' : 'AI'}</span><br/>
          <span style="font-size: 0.9em;">Occurrences: ${d.count}</span>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');

      link.attr('stroke-opacity', l =>
        (l.source as D3Node).id === d.id || (l.target as D3Node).id === d.id ? 0.9 : 0.1
      );
    })
    .on('mouseout', function() {
      d3.select(this).select('circle')
        .attr('stroke-width', 2);

      tooltip.style('opacity', 0);

      link.attr('stroke-opacity', 0.5);
    });

    link.on('mouseover', function(event, d) {
      d3.select(this)
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 3);

      const source = d.source as D3Node;
      const target = d.target as D3Node;

      tooltip
        .style('opacity', 1)
        .html(`
          <strong>${formatRoleName(source.label)}</strong> → <strong>${formatRoleName(target.label)}</strong><br/>
          <span style="font-size: 0.9em;">${d.value} conversations (${d.percentage.toFixed(1)}%)</span>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function(_event, d) {
      d3.select(this)
        .attr('stroke-opacity', 0.5)
        .attr('stroke-width', 2);

      tooltip.style('opacity', 0);
    });

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as D3Node).x || 0)
        .attr('y1', d => (d.source as D3Node).y || 0)
        .attr('x2', d => (d.target as D3Node).x || 0)
        .attr('y2', d => (d.target as D3Node).y || 0);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragStarted(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragEnded(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [nodes, links, width, height, chargeStrength, linkDistance, linkStrength, separationStrength]);

  const restartSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Controls */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '2px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1rem',
        minWidth: '220px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 10
      }}>
        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
          Force Controls
        </h4>

        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            Charge: {chargeStrength}
          </label>
          <input
            type="range"
            min="-1000"
            max="-50"
            value={chargeStrength}
            onChange={(e) => setChargeStrength(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            Link Distance: {linkDistance}
          </label>
          <input
            type="range"
            min="50"
            max="300"
            value={linkDistance}
            onChange={(e) => setLinkDistance(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            Link Strength: {linkStrength.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={linkStrength}
            onChange={(e) => setLinkStrength(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            Separation: {separationStrength.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={separationStrength}
            onChange={(e) => setSeparationStrength(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <button
          onClick={restartSimulation}
          style={{
            width: '100%',
            padding: '0.5rem',
            background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '0.5rem'
          }}
        >
          Restart Simulation
        </button>
      </div>

      <svg ref={svgRef} style={{ width: '100%', height: 'auto', borderRadius: '0.5rem' }} />

      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '1rem',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '0.5rem 0.75rem',
        borderRadius: '0.5rem',
        fontSize: '0.75rem'
      }}>
        💡 Drag nodes to reposition • Hover for details
      </div>
    </div>
  );
};
