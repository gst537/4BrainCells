import { NextResponse } from 'next/server';
import {
  searchNodes,
  getRelatedSubgraph,
  getDecisionsByIds,
  getTimelineEvents,
  getEvidence
} from '../../../lib/db';
import { requireRole } from '../../../lib/auth';

/**
 * GET /api/search?q=<query>&limit=<n>
 *
 * Resolves a free-text query into the connected slice of institutional memory
 * that answers it: the matched nodes, their immediate neighbours, every edge
 * among that set, plus the ledger records, evidence and timeline entries that
 * belong to those nodes. This is what makes the workspace query-driven rather
 * than loading the whole corpus on boot.
 */
const getHandler = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').trim();
    const limit = Math.min(Number(url.searchParams.get('limit')) || 60, 200);
    const depth = Math.min(Number(url.searchParams.get('depth')) || 1, 3);

    if (!q) {
      return NextResponse.json({
        query: '',
        nodes: [], edges: [], decisions: [], timeline: [], evidence: [],
        counts: { nodes: 0, edges: 0, decisions: 0, timeline: 0, evidence: 0 }
      });
    }

    const matched = await searchNodes(q, limit);
    if (matched.length === 0) {
      return NextResponse.json({
        query: q,
        nodes: [], edges: [], decisions: [], timeline: [], evidence: [],
        counts: { nodes: 0, edges: 0, decisions: 0, timeline: 0, evidence: 0 }
      });
    }

    const matchedIds = matched.map((n: { id: string }) => n.id);
    const { nodes, edges } = await getRelatedSubgraph(matchedIds, depth);

    const subgraphIds = nodes.map((n: { id: string }) => n.id);
    const decisions = await getDecisionsByIds(subgraphIds);
    const timeline = await getTimelineEvents(subgraphIds);

    // Evidence attached to any node in the resolved subgraph.
    const evidenceIds = new Set(
      nodes.map((n: { evidenceId?: string }) => n.evidenceId).filter(Boolean) as string[]
    );
    const decisionIds = new Set(subgraphIds);
    const allEvidence = await getEvidence();
    const evidence = allEvidence.filter(
      (e: { id: string; relatedDecisionId?: string }) =>
        evidenceIds.has(e.id) || (e.relatedDecisionId ? decisionIds.has(e.relatedDecisionId) : false)
    );

    return NextResponse.json({
      query: q,
      matchedIds,
      nodes,
      edges,
      decisions,
      timeline,
      evidence,
      counts: {
        nodes: nodes.length,
        edges: edges.length,
        decisions: decisions.length,
        timeline: timeline.length,
        evidence: evidence.length,
        directMatches: matched.length
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    console.error('Search API error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const GET = requireRole('viewer', getHandler);
