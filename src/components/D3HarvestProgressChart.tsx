// T-082: D3.js Crop Growth Progress & Days-to-Maturity (DTM) Interactive Chart
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { type HarvestTracker } from '@verdescan/shared';
import { Sparkles, Calendar, TrendingUp, BarChart3, Info } from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';

export interface D3HarvestProgressChartProps {
  currentCrop: HarvestTracker;
  allCrops: HarvestTracker[];
  onSelectCrop?: (cropId: string) => void;
  isSunlightMode?: boolean;
}

type ChartViewMode = 'growth_curve' | 'crops_comparison';

interface GrowthPoint {
  day: number;
  progress: number;
  stageName: string;
  stageIndex: number;
  description: string;
}

export function D3HarvestProgressChart({
  currentCrop,
  allCrops,
  onSelectCrop,
  isSunlightMode = false,
}: D3HarvestProgressChartProps) {
  const [viewMode, setChartViewMode] = useState<ChartViewMode>('growth_curve');
  const [activeTooltip, setActiveTooltip] = useState<{
    x: number;
    y: number;
    title: string;
    detail: string;
    subdetail?: string;
  } | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Render D3 Visualization
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const containerWidth = containerRef.current.clientWidth || 340;
    const width = Math.max(300, containerWidth);
    const height = viewMode === 'growth_curve' ? 220 : Math.max(180, allCrops.length * 44 + 40);

    const margin =
      viewMode === 'growth_curve'
        ? { top: 20, right: 25, bottom: 35, left: 35 }
        : { top: 25, right: 40, bottom: 25, left: 85 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Definitions (Gradients & Filters)
    const defs = svg.append('defs');

    // Emerald Growth Area Gradient
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'growth-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#78C441').attr('stop-opacity', 0.5);
    areaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#1A3B29').attr('stop-opacity', 0.05);

    // Line Gradient
    const lineGradient = defs
      .append('linearGradient')
      .attr('id', 'growth-line-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    lineGradient.append('stop').attr('offset', '0%').attr('stop-color', '#86EFAC');
    lineGradient.append('stop').attr('offset', '50%').attr('stop-color', '#78C441');
    lineGradient.append('stop').attr('offset', '100%').attr('stop-color', '#15803D');

    // ----------------------------------------------------
    // MODE 1: S-CURVE BIOLOGICAL GROWTH TRAJECTORY
    // ----------------------------------------------------
    if (viewMode === 'growth_curve') {
      const dtm = Math.max(30, currentCrop.dtm || 75);
      const daysElapsed = Math.min(dtm, Math.max(0, currentCrop.daysElapsed || 0));

      // Generate 50 points along the biological Gompertz/Logistic S-curve
      const points: GrowthPoint[] = [];
      const numSteps = 40;
      for (let i = 0; i <= numSteps; i++) {
        const day = (i / numSteps) * dtm;
        // Standard logistic agronomic sigmoid: L / (1 + exp(-k*(day - mid)))
        const k = 0.08;
        const mid = dtm * 0.45;
        const rawSigmoid = 1 / (1 + Math.exp(-k * (day - mid)));
        const zeroOffset = 1 / (1 + Math.exp(-k * (0 - mid)));
        const maxOffset = 1 / (1 + Math.exp(-k * (dtm - mid)));
        const progress = Math.min(100, Math.max(0, ((rawSigmoid - zeroOffset) / (maxOffset - zeroOffset)) * 100));

        let stageName = 'Seedling';
        let stageIndex = 0;
        let description = 'Root establishment & cotyledon emergence';

        if (progress >= 90) {
          stageName = 'Harvest Ready';
          stageIndex = 4;
          description = 'Peak maturity, sugar accumulation & ripening cues';
        } else if (progress >= 65) {
          stageName = 'Fruiting / Bulbing';
          stageIndex = 3;
          description = 'Rapid fruit sizing, starch filling & color shift';
        } else if (progress >= 40) {
          stageName = 'Flowering';
          stageIndex = 2;
          description = 'Floral pollination, petal drop & initial fruit set';
        } else if (progress >= 15) {
          stageName = 'Vegetative';
          stageIndex = 1;
          description = 'Vigorous leaf canopy, branching & solar absorption';
        }

        points.push({ day, progress, stageName, stageIndex, description });
      }

      // Scales
      const xScale = d3.scaleLinear().domain([0, dtm]).range([0, innerWidth]);
      const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

      // Grid Lines
      g.append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.15)
        .call(
          d3
            .axisLeft(yScale)
            .ticks(4)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        );

      // Axes
      const xAxis = d3
        .axisBottom(xScale)
        .ticks(5)
        .tickFormat((d) => `Day ${d}`);
      const yAxis = d3
        .axisLeft(yScale)
        .ticks(4)
        .tickFormat((d) => `${d}%`);

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .attr('color', isSunlightMode ? '#1e293b' : '#64748b')
        .selectAll('text')
        .attr('font-size', '10px')
        .attr('font-weight', '600');

      g.append('g')
        .call(yAxis)
        .attr('color', isSunlightMode ? '#1e293b' : '#64748b')
        .selectAll('text')
        .attr('font-size', '10px')
        .attr('font-weight', '600');

      // Stage Background Shading Bands
      const stageBoundaries = [
        { start: 0, end: dtm * 0.2, color: '#f0fdf4', label: 'Seedling' },
        { start: dtm * 0.2, end: dtm * 0.45, color: '#ecfdf5', label: 'Vegetative' },
        { start: dtm * 0.45, end: dtm * 0.7, color: '#fefce8', label: 'Flowering' },
        { start: dtm * 0.7, end: dtm * 0.9, color: '#fff7ed', label: 'Fruiting' },
        { start: dtm * 0.9, end: dtm, color: '#fef2f2', label: 'Ripening' },
      ];

      stageBoundaries.forEach((b) => {
        const x1 = xScale(b.start);
        const x2 = xScale(b.end);
        g.append('rect')
          .attr('x', x1)
          .attr('y', 0)
          .attr('width', Math.max(0, x2 - x1))
          .attr('height', innerHeight)
          .attr('fill', b.color)
          .attr('opacity', 0.4);
      });

      // Area Path
      const area = d3
        .area<GrowthPoint>()
        .x((d) => xScale(d.day))
        .y0(innerHeight)
        .y1((d) => yScale(d.progress))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(points)
        .attr('fill', 'url(#growth-area-gradient)')
        .attr('d', area);

      // Line Path
      const line = d3
        .line<GrowthPoint>()
        .x((d) => xScale(d.day))
        .y((d) => yScale(d.progress))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(points)
        .attr('fill', 'none')
        .attr('stroke', 'url(#growth-line-gradient)')
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .attr('d', line);

      // Current Crop Milestone Marker
      const currentProgress = currentCrop.progressPercentage;
      const currentX = xScale(daysElapsed);
      const currentY = yScale(currentProgress);

      // Dashed vertical guideline to current day
      g.append('line')
        .attr('x1', currentX)
        .attr('y1', innerHeight)
        .attr('x2', currentX)
        .attr('y2', currentY)
        .attr('stroke', '#16a34a')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '3,3');

      // Outer Pulse Ring
      g.append('circle')
        .attr('cx', currentX)
        .attr('cy', currentY)
        .attr('r', 8)
        .attr('fill', '#86EFAC')
        .attr('opacity', 0.6);

      // Inner Core Marker
      g.append('circle')
        .attr('cx', currentX)
        .attr('cy', currentY)
        .attr('r', 4.5)
        .attr('fill', '#15803D')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);

      // Interactive Overlay for touch/hover scrub
      const bisect = d3.bisector<GrowthPoint, number>((d) => d.day).center;

      svg
        .append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'transparent')
        .attr('cursor', 'crosshair')
        .on('mousemove touchmove', function (event: MouseEvent | TouchEvent) {
          const coords = d3.pointer(event, g.node());
          const xVal = xScale.invert(coords[0]);
          if (xVal < 0 || xVal > dtm) return;

          const idx = bisect(points, xVal);
          const p = points[idx] || points[0];

          setActiveTooltip({
            x: coords[0] + margin.left,
            y: yScale(p.progress) + margin.top,
            title: `Day ${Math.round(p.day)} of ${dtm} • ${Math.round(p.progress)}%`,
            detail: `${p.stageName}: ${p.description}`,
            subdetail: p.day <= daysElapsed ? '✓ Completed Phase' : '⏳ Projected Milestone',
          });
        })
        .on('mouseleave touchend', () => {
          setActiveTooltip(null);
        });
    }

    // ----------------------------------------------------
    // MODE 2: MULTI-CROP HORIZONTAL DTM COMPARISON
    // ----------------------------------------------------
    else {
      const data = allCrops.map((c) => ({
        id: c.id,
        name: c.cropName,
        variety: c.variety,
        dtm: Math.max(20, c.dtm || 60),
        elapsed: Math.min(c.dtm, Math.max(0, c.daysElapsed || 0)),
        remaining: Math.max(0, c.daysRemaining || 0),
        progress: c.progressPercentage,
        isCurrent: c.id === currentCrop.id,
      }));

      const maxDTM = d3.max(data, (d) => d.dtm) || 100;

      const yScale = d3
        .scaleBand()
        .domain(data.map((d) => d.name))
        .range([0, innerHeight])
        .padding(0.3);

      const xScale = d3.scaleLinear().domain([0, maxDTM * 1.05]).range([0, innerWidth]);

      // Y Axis (Crop Names)
      g.append('g')
        .call(d3.axisLeft(yScale).tickSize(0))
        .attr('color', isSunlightMode ? '#0f172a' : '#334155')
        .selectAll('text')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .attr('dx', '-6px');

      // X Axis (Days)
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat((d) => `${d}d`))
        .attr('color', isSunlightMode ? '#1e293b' : '#64748b')
        .selectAll('text')
        .attr('font-size', '10px');

      // Render Stacked Bars (Elapsed vs Remaining)
      data.forEach((d) => {
        const yPos = yScale(d.name) || 0;
        const barHeight = yScale.bandwidth();

        // Total DTM background track
        g.append('rect')
          .attr('x', 0)
          .attr('y', yPos)
          .attr('width', xScale(d.dtm))
          .attr('height', barHeight)
          .attr('rx', barHeight / 2)
          .attr('fill', '#e2e8f0')
          .attr('cursor', 'pointer')
          .on('click', () => {
            triggerHaptic('tap');
            onSelectCrop?.(d.id);
          });

        // Elapsed Progress Fill
        g.append('rect')
          .attr('x', 0)
          .attr('y', yPos)
          .attr('width', xScale(d.elapsed))
          .attr('height', barHeight)
          .attr('rx', barHeight / 2)
          .attr('fill', d.isCurrent ? '#16a34a' : '#4ade80')
          .attr('cursor', 'pointer')
          .on('click', () => {
            triggerHaptic('tap');
            onSelectCrop?.(d.id);
          });

        // Current Crop Highlight Glow Outline
        if (d.isCurrent) {
          g.append('rect')
            .attr('x', -2)
            .attr('y', yPos - 2)
            .attr('width', xScale(d.dtm) + 4)
            .attr('height', barHeight + 4)
            .attr('rx', (barHeight + 4) / 2)
            .attr('fill', 'none')
            .attr('stroke', '#166534')
            .attr('stroke-width', 2);
        }

        // Percentage label inside or outside bar
        const labelText = `${d.progress}% (${d.remaining}d left)`;
        g.append('text')
          .attr('x', xScale(d.dtm) + 6)
          .attr('y', yPos + barHeight / 2 + 3.5)
          .attr('font-size', '9.5px')
          .attr('font-weight', '700')
          .attr('fill', d.isCurrent ? '#15803d' : '#64748b')
          .text(labelText);
      });
    }
  }, [currentCrop, allCrops, viewMode, onSelectCrop, isSunlightMode]);

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border p-3.5 space-y-3 transition-all ${
        isSunlightMode
          ? 'bg-white border-2 border-stone-800 shadow-sm'
          : 'bg-[#F9FAF8] border-[#E1E8DE] shadow-2xs'
      }`}
    >
      {/* Chart View Mode Controls */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-200/70 pb-2">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[#2E7D32]" />
          <span className="text-xs font-extrabold text-[#19201D] tracking-tight">
            {viewMode === 'growth_curve'
              ? `${currentCrop.cropName} Growth Trajectory`
              : 'All Crops DTM Matrix'}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-stone-200/70 p-0.5 rounded-xl">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              setChartViewMode('growth_curve');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              viewMode === 'growth_curve'
                ? 'bg-white text-[#1A3B29] shadow-2xs'
                : 'text-stone-600 hover:text-black'
            }`}
          >
            S-Curve
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              setChartViewMode('crops_comparison');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              viewMode === 'crops_comparison'
                ? 'bg-white text-[#1A3B29] shadow-2xs'
                : 'text-stone-600 hover:text-black'
            }`}
          >
            All Crops ({allCrops.length})
          </button>
        </div>
      </div>

      {/* D3 Render Target Canvas */}
      <div className="relative overflow-hidden flex justify-center">
        <svg ref={svgRef} className="w-full max-w-full overflow-visible select-none" />

        {/* Hover / Scrub Tooltip Callout */}
        {activeTooltip && (
          <div
            className="absolute pointer-events-none z-20 bg-[#1A3B29] text-white px-3 py-2 rounded-xl shadow-lg border border-[#78C441]/40 text-left -translate-x-1/2 -translate-y-full mb-2 max-w-[220px]"
            style={{
              left: `${Math.min(260, Math.max(60, activeTooltip.x))}px`,
              top: `${Math.max(10, activeTooltip.y - 12)}px`,
            }}
          >
            <p className="text-[11px] font-black text-[#86EFAC]">{activeTooltip.title}</p>
            <p className="text-[10px] text-white/90 leading-tight mt-0.5">{activeTooltip.detail}</p>
            {activeTooltip.subdetail && (
              <span className="text-[9px] text-[#A7F3D0] font-bold block mt-1">
                {activeTooltip.subdetail}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend & Milestone Key */}
      <div className="pt-0.5 flex flex-wrap items-center justify-between text-[10px] font-medium text-stone-600 border-t border-stone-200/50">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] inline-block" />
          <span>Day {currentCrop.daysElapsed} of {currentCrop.dtm}</span>
        </div>
        <div className="flex items-center gap-1 text-[#2E7D32] font-bold">
          <Sparkles className="w-3 h-3 text-[#F59E0B]" />
          <span>{currentCrop.daysRemaining} days remaining</span>
        </div>
      </div>
    </div>
  );
}
