import AuditWorkspace from '../../components/views/audit-workspace';
import { loadAuditRuns, loadReconciliation } from '../../lib/services/audit-service';

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
  const runs = await loadAuditRuns();
  const reconciliation = await loadReconciliation(runs);
  return <AuditWorkspace runs={runs} reconciliation={reconciliation} />;
}
