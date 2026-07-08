import { useMemo } from 'react'
import type { Branch, GitCommit, GitHash, GraphEdge, GraphLayout, GraphNode } from '@/types/git'

const NODE_SPACING_X = 200
const NODE_SPACING_Y = 60
const PADDING = 80

export function useGraphLayout(
	commits: Record<GitHash, GitCommit>,
	branches: Record<string, Branch>,
	headRef: string,
	headType: 'branch' | 'detached'
): GraphLayout {
	return useMemo(() => {
		const commitList = Object.values(commits)

		if (commitList.length === 0) {
			return { edges: [], height: 0, nodes: [], width: 0 }
		}

		// Sort commits by timestamp
		const sortedCommits = [...commitList].sort((a, b) => a.timestamp - b.timestamp)

		// Assign lanes to branches
		const branchLanes: Record<string, number> = {}
		const branchList = Object.values(branches)
		branchList.forEach((branch, index) => {
			branchLanes[branch.name] = index
		})

		// Build commit to branch mapping
		const commitToBranches: Record<GitHash, string[]> = {}
		branchList.forEach((branch) => {
			let currentHash = branch.headCommitHash
			while (currentHash && commits[currentHash]) {
				if (!commitToBranches[currentHash]) {
					commitToBranches[currentHash] = []
				}
				if (!commitToBranches[currentHash].includes(branch.name)) {
					commitToBranches[currentHash].push(branch.name)
				}
				const commit = commits[currentHash]
				currentHash = commit.parents[0]
			}
		})

		// Calculate node positions
		const commitPositions: Record<GitHash, { x: number; y: number; lane: number }> = {}

		sortedCommits.forEach((commit, index) => {
			// Determine lane based on branches pointing to this commit
			const commitBranches = commitToBranches[commit.hash] || []
			let lane = 0

			if (commitBranches.length > 0) {
				// Use the primary branch's lane
				const primaryBranch = commitBranches.includes('main') ? 'main' : commitBranches[0]
				lane = branchLanes[primaryBranch] || 0
			} else if (commit.parents.length > 0) {
				// Inherit lane from parent
				const parentPos = commitPositions[commit.parents[0]]
				lane = parentPos?.lane || 0
			}

			// Handle merge commits - offset if needed
			if (commit.parents.length > 1) {
				lane = 0 // Merge commits go back to main lane
			}

			const x = PADDING + index * NODE_SPACING_X
			const y = PADDING + lane * NODE_SPACING_Y

			commitPositions[commit.hash] = { lane, x, y }
		})

		// Determine current HEAD commit
		const headCommitHash = headType === 'branch' ? branches[headRef]?.headCommitHash : headRef

		// Create nodes
		const nodes: GraphNode[] = sortedCommits.map((commit) => {
			const pos = commitPositions[commit.hash]
			const commitBranches = commitToBranches[commit.hash] || []
			const primaryBranch = commitBranches.includes('main') ? 'main' : commitBranches[0]
			const branch = branches[primaryBranch]

			return {
				branches: commitBranches,
				color: branch?.color || 'hsl(199, 89%, 48%)',
				commit,
				id: commit.hash,
				isHead: commit.hash === headCommitHash,
				lane: pos.lane,
				x: pos.x,
				y: pos.y,
			}
		})

		// Create edges
		const edges: GraphEdge[] = []

		sortedCommits.forEach((commit) => {
			commit.parents.forEach((parentHash, parentIndex) => {
				const sourcePos = commitPositions[commit.hash]
				const targetPos = commitPositions[parentHash]

				if (sourcePos && targetPos) {
					const isMerge = parentIndex > 0
					const color = isMerge
						? branches[
								Object.keys(branches).find(
									(b) =>
										branches[b].headCommitHash === parentHash ||
										commits[parentHash]?.parents.includes(branches[b].headCommitHash)
								) || 'main'
							]?.color || 'hsl(215, 20%, 45%)'
						: nodes.find((n) => n.id === commit.hash)?.color || 'hsl(215, 20%, 45%)'

					edges.push({
						color,
						id: `${commit.hash}-${parentHash}`,
						isMerge,
						source: commit.hash,
						sourceX: sourcePos.x,
						sourceY: sourcePos.y,
						target: parentHash,
						targetX: targetPos.x,
						targetY: targetPos.y,
					})
				}
			})
		})

		const maxX = Math.max(...nodes.map((n) => n.x)) + PADDING
		const maxY = Math.max(...nodes.map((n) => n.y)) + PADDING

		return {
			edges,
			height: Math.max(maxY, 200),
			nodes,
			width: Math.max(maxX, 400),
		}
	}, [commits, branches, headRef, headType])
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
		return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`
	}

	// Curved path for different lanes
	const midX = (sourceX + targetX) / 2

	if (isMerge) {
		// Merge path curves from source to target
		return `M ${sourceX} ${sourceY} 
            C ${sourceX - 30} ${sourceY} 
              ${targetX + 30} ${targetY} 
              ${targetX} ${targetY}`
	}

	// Branch path
	return `M ${sourceX} ${sourceY} 
          C ${midX} ${sourceY} 
            ${midX} ${targetY} 
            ${targetX} ${targetY}`
}
