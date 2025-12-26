import { useMemo } from 'react';
import * as d3 from 'd3';
import type { GitCommit, GitHash, Branch, GraphLayout, GraphNode, GraphEdge } from '@/types/git';

const NODE_SPACING_X = 120;
const NODE_SPACING_Y = 60;
const PADDING = 80;

export function useGraphLayout(
  commits: Record<GitHash, GitCommit>,
  branches: Record<string, Branch>,
  headRef: string,
  headType: 'branch' | 'detached'
): GraphLayout {
  return useMemo(() => {
    const commitList = Object.values(commits);
    
    if (commitList.length === 0) {
      return { nodes: [], edges: [], width: 0, height: 0 };
    }

    // Sort commits by timestamp
    const sortedCommits = [...commitList].sort((a, b) => a.timestamp - b.timestamp);

    // Assign lanes to branches
    const branchLanes: Record<string, number> = {};
    const branchList = Object.values(branches);
    branchList.forEach((branch, index) => {
      branchLanes[branch.name] = index;
    });

    // Build commit to branch mapping
    const commitToBranches: Record<GitHash, string[]> = {};
    branchList.forEach((branch) => {
      let currentHash = branch.headCommitHash;
      while (currentHash && commits[currentHash]) {
        if (!commitToBranches[currentHash]) {
          commitToBranches[currentHash] = [];
        }
        if (!commitToBranches[currentHash].includes(branch.name)) {
          commitToBranches[currentHash].push(branch.name);
        }
        const commit = commits[currentHash];
        currentHash = commit.parents[0];
      }
    });

    // Calculate node positions
    const commitPositions: Record<GitHash, { x: number; y: number; lane: number }> = {};
    const laneOccupancy: Record<number, number> = {};

    sortedCommits.forEach((commit, index) => {
      // Determine lane based on branches pointing to this commit
      const commitBranches = commitToBranches[commit.hash] || [];
      let lane = 0;
      
      if (commitBranches.length > 0) {
        // Use the primary branch's lane
        const primaryBranch = commitBranches.includes('main') ? 'main' : commitBranches[0];
        lane = branchLanes[primaryBranch] || 0;
      } else if (commit.parents.length > 0) {
        // Inherit lane from parent
        const parentPos = commitPositions[commit.parents[0]];
        lane = parentPos?.lane || 0;
      }

      // Handle merge commits - offset if needed
      if (commit.parents.length > 1) {
        lane = 0; // Merge commits go back to main lane
      }

      const x = PADDING + index * NODE_SPACING_X;
      const y = PADDING + lane * NODE_SPACING_Y;

      commitPositions[commit.hash] = { x, y, lane };
    });

    // Determine current HEAD commit
    const headCommitHash = headType === 'branch'
      ? branches[headRef]?.headCommitHash
      : headRef;

    // Create nodes
    const nodes: GraphNode[] = sortedCommits.map((commit) => {
      const pos = commitPositions[commit.hash];
      const commitBranches = commitToBranches[commit.hash] || [];
      const primaryBranch = commitBranches.includes('main') ? 'main' : commitBranches[0];
      const branch = branches[primaryBranch];

      return {
        id: commit.hash,
        commit,
        x: pos.x,
        y: pos.y,
        lane: pos.lane,
        color: branch?.color || 'hsl(199, 89%, 48%)',
        branches: commitBranches,
        isHead: commit.hash === headCommitHash,
      };
    });

    // Create edges using D3 curve
    const edges: GraphEdge[] = [];
    const lineGenerator = d3.line<{ x: number; y: number }>()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(d3.curveMonotoneX);

    sortedCommits.forEach((commit) => {
      commit.parents.forEach((parentHash, parentIndex) => {
        const sourcePos = commitPositions[commit.hash];
        const targetPos = commitPositions[parentHash];

        if (sourcePos && targetPos) {
          const isMerge = parentIndex > 0;
          const color = isMerge 
            ? branches[Object.keys(branches).find(b => 
                branches[b].headCommitHash === parentHash || 
                commits[parentHash]?.parents.includes(branches[b].headCommitHash)
              ) || 'main']?.color || 'hsl(215, 20%, 45%)'
            : nodes.find(n => n.id === commit.hash)?.color || 'hsl(215, 20%, 45%)';

          edges.push({
            id: `${commit.hash}-${parentHash}`,
            source: commit.hash,
            target: parentHash,
            sourceX: sourcePos.x,
            sourceY: sourcePos.y,
            targetX: targetPos.x,
            targetY: targetPos.y,
            color,
            isMerge,
          });
        }
      });
    });

    const maxX = Math.max(...nodes.map((n) => n.x)) + PADDING;
    const maxY = Math.max(...nodes.map((n) => n.y)) + PADDING;

    return {
      nodes,
      edges,
      width: Math.max(maxX, 400),
      height: Math.max(maxY, 200),
    };
  }, [commits, branches, headRef, headType]);
}

export function generateEdgePath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  isMerge: boolean
): string {
  if (sourceY === targetY) {
    // Straight horizontal line
    return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  }

  // Curved path for different lanes
  const midX = (sourceX + targetX) / 2;
  const controlOffset = Math.abs(sourceY - targetY) * 0.5;

  if (isMerge) {
    // Merge path curves from source to target
    return `M ${sourceX} ${sourceY} 
            C ${sourceX - 30} ${sourceY} 
              ${targetX + 30} ${targetY} 
              ${targetX} ${targetY}`;
  }

  // Branch path
  return `M ${sourceX} ${sourceY} 
          C ${midX} ${sourceY} 
            ${midX} ${targetY} 
            ${targetX} ${targetY}`;
}
