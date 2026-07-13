import { writeReview } from '../../../../lib/services/audit-service';
import type { ReviewDecision } from '../../../../lib/data/audit-types';

const allowedDecisions: ReviewDecision[] = ['approved', 'changes', 'rejected'];

/**
 * 审查决定回写 API
 *
 * 接收 `{ feature, decision, reviewer, note }`，将审查结果写入对应
 * `specs/{feature}/run-record.md` 的「审查决定」小节，形成可追责闭环。
 *
 * @param {Request} request - 传入请求
 * @returns {Promise<Response>} 回写后的审查记录
 */
export async function POST(request: Request) {
  let body: { feature?: string; decision?: string; reviewer?: string; note?: string };
  try {
    body = await request.json();
  } catch (error) {
    console.warn('Failed to parse audit review request.', error);
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const feature = (body.feature ?? '').trim();
  const decision = body.decision as ReviewDecision;

  if (!feature || !allowedDecisions.includes(decision)) {
    return Response.json({ error: 'Missing feature or invalid decision' }, { status: 400 });
  }

  try {
    const record = await writeReview(feature, {
      decision,
      reviewer: (body.reviewer ?? '').slice(0, 80),
      note: (body.note ?? '').slice(0, 500)
    });
    return Response.json({ ok: true, review: record });
  } catch (error) {
    console.warn('Failed to write review decision.', error);
    return Response.json({ error: 'Failed to write review' }, { status: 400 });
  }
}
