export class DomainPack {
  constructor(document) {
    this.document = document;
  }

  validate() {
    const issues = [];
    if (this.document.schemaVersion !== '1.0.0') issues.push('unsupported domain pack version');
    if (!['ready', 'needs_confirmation'].includes(this.document.status)) issues.push('invalid domain pack status');
    if (!Array.isArray(this.document.invariants)) issues.push('domain invariants must be an array');
    if (!Array.isArray(this.document.authoritativeSources)) issues.push('authoritative sources must be an array');
    return { ok: issues.length === 0, issues };
  }

  inject(contextItems) {
    if (this.document.status !== 'ready') throw new Error('domain pack requires confirmation');
    return { invariants: this.document.invariants, authoritativeSources: this.document.authoritativeSources, contextItems };
  }
}
