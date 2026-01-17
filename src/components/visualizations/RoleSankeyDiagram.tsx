import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal, SankeyNode, SankeyLink } from 'd3-sankey';
import { SankeyData } from '../../utils/roleNetwork';
import { formatRoleName } from '../../utils/roleNetwork';

interface RoleSankeyDiagramProps {
  data: SankeyData;
  width?: number;
  height?: number;
}

interface ExtendedSankeyNode extends SankeyNode<{ name: string; color?: string }, { value: number }> {
  name: string;
  color?: string;
}

interface ExtendedSankeyLink extends SankeyLink<ExtendedSankeyNode, { value: number }> {
  // Inherits source, target, value from SankeyLink
}

export const RoleSankeyDiagram: React.FC<RoleSankeyDiagramProps> = ({
  data,
  width = 900,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const { nodes, links } = useMemo(() => {
    // Create deep copy to avoid mutating original data
    const nodesCopy = data.nodes.map(n => ({ ...n }));
    const linksCopy = data.links.map(l => ({ ...l }));

    return { nodes: nodesCopy, links: linksCopy };
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 150, bottom: 20, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create Sankey layout
    const sankeyLayout = sankey<{ name: string; color?: string }, { value: number }>()
      .nodeWidth(20)
      .nodePadding(20)
      .extent([[0, 0], [innerWidth, innerHeight]]);

    // Generate the layout
    const { nodes: sankeyNodes, links: sankeyLinks } = sankeyLayout({
      nodes: nodes as ExtendedSankeyNode[],
      links: links as ExtendedSankeyLink[]
    });

    // Draw links
    g.append('g')
      .selectAll('.link')
      .data(sankeyLinks)
      .join('path')
      .attr('class', 'link')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => {
        // Use source node color with opacity
        const sourceNode = d.source as ExtendedSankeyNode;
        return sourceNode.color || '#999';
      })
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', d => Math.max(1, d.width || 0))
      .attr('fill', 'none')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke-opacity', 0.6);

        // Show tooltip
        const sourceNode = d.source as ExtendedSankeyNode;
        const targetNode = d.target as ExtendedSankeyNode;

        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${formatRoleName(sourceNode.name)}</strong> → <strong>${formatRoleName(targetNode.name)}</strong><br/>
            <span style="font-size: 0.9em;">${d.value} conversations</span>
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke-opacity', 0.3);

        tooltip.style('opacity', 0);
      });

    // Draw nodes
    const node = g.append('g')
      .selectAll('.node')
      .data(sankeyNodes)
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    node.append('rect')
      .attr('height', d => (d.y1 || 0) - (d.y0 || 0))
      .attr('width', sankeyLayout.nodeWidth())
      .attr('fill', d => d.color || '#888')
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke-width', 2);

        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${formatRoleName(d.name)}</strong><br/>
            <span style="font-size: 0.9em;">${d.value} total connections</span>
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke-width', 1);

        tooltip.style('opacity', 0);
      });

    // Add node labels
    node.append('text')
      .attr('x', d => (d.x0 || 0) < innerWidth / 2 ? -6 : sankeyLayout.nodeWidth() + 6)
      .attr('y', d => ((d.y1 || 0) - (d.y0 || 0)) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => (d.x0 || 0) < innerWidth / 2 ? 'end' : 'start')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', '#374151')
      .text(d => formatRoleName(d.name));

    // Add section labels
    g.append('text')
      .attr('x', 0)
      .attr('y', -5)
      .attr('text-anchor', 'start')
      .attr('font-size', '15px')
      .attr('font-weight', 'bold')
      .attr('fill', '#111827')
      .text('Human Roles');

    g.append('text')
      .attr('x', innerWidth)
      .attr('y', -5)
      .attr('text-anchor', 'end')
      .attr('font-size', '15px')
      .attr('font-weight', 'bold')
      .attr('fill', '#111827')
      .text('AI Roles');

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'sankey-tooltip')
      .style('position', 'absolute')
      .style('opacity', 0)
      .style('background-color', 'rgba(0, 0, 0, 0.8)')
      .style('color', '#fff')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('font-size', '13px')
      .style('pointer-events', 'none')
      .style('z-index', 1000);

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [nodes, links, width, height]);

  return (
    <div className="relative">
      <svg ref={svgRef} className="w-full h-auto" />
    </div>
  );
};
