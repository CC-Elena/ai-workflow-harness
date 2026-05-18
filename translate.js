// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');

function translateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    const replacements = [
        ["is missing required section", "缺少必需的章节"],
        ["Changed file is not covered by run-record diff table", "已更改的文件未包含在 run-record 的 Diff 覆盖表中"],
        ["Out-of-scope file lacks confirmation reason", "范围外的文件缺乏确认原因"],
        ["Missing required file", "缺少必需的文件"],
        ["Full Spec run requires spec file", "Full Spec 运行需要 spec 文件"],
        ["Mini Spec run requires mini-spec file", "Mini Spec 运行需要 mini-spec 文件"],
        ["Medium/Large/Risky run requires tasks file", "Medium/Large/Risky 运行需要 tasks 文件"],
        ["Medium/Large/Risky run requires evaluation summary", "Medium/Large/Risky 运行需要评估总结 (evaluation summary)"],
        ["Medium/Large/Risky run requires verification record", "Medium/Large/Risky 运行需要验证记录 (verification record)"],
        ["Medium lightweight/mini-spec run requires inline verification or verification record", "Medium 轻量级/mini-spec 运行需要内联验证或验证记录文件"],
        ["is missing a task table or section", "缺少任务表或章节"],
        ["tasks.md still contains Pending rows while run-record status is Success", "run-record 状态为 Success，但 tasks.md 中仍包含 Pending 的任务行"],
        ["is missing required score section", "缺少必需的评分章节"],
        ["has no blocker check rows", "没有阻断项检查行"],
        ["Failed/Partial/Failure run requires an RCA file reference in run-record.md.", "Failed/Partial/Failure 运行需要在 run-record.md 中引用 RCA 文件。"],
        ["RCA reference does not exist", "RCA 引用不存在"],
        ["but has no command or existing evidence file", "但没有命令或现有证据文件"],
        ["references missing evidence", "引用了缺失的证据文件"],
        ["is Skipped without a skip reason or risk", "状态为 Skipped，但没有提供跳过原因或风险"],
        ["run-record.md has an empty execution summary", "run-record.md 的执行摘要为空"],
        ["Evidence table references missing file", "证据表引用了缺失的文件"],
        ["Successful run should reference at least one existing evidence or linked artifact", "成功的运行应该至少引用一个现有的证据或关联的制品"],
        ["Changed-file mode requires at least one specs/{feature}/run-record.md change so PR files can be mapped to a Run Record", "Changed-file 模式要求至少更改一个 specs/{feature}/run-record.md，以便 PR 文件能映射到 Run Record"],
        ["Changed file has no candidate Run Record", "已更改的文件没有候选的 Run Record"],
        ["Harness changed-file check passed for", "Harness 更改文件检查已通过："],
        ["Harness check passed for", "Harness 检查已通过："],
        ["Harness check failed", "Harness 检查失败"],
        ["Usage:", "用法："],
        ["Verification row", "验证项"],
        ["no changed files", "无更改文件"],
        ["test('changed mode fails when PR files have no Run Record candidate'", "test('当 PR 文件没有 Run Record 候选时，changed 模式失败'"],
        ["test('changed mode passes when a Run Record covers real PR files'", "test('当 Run Record 覆盖实际 PR 文件时，changed 模式通过'"],
        ["test('changed mode checks every changed feature Run Record'", "test('changed 模式检查每个已更改特性的 Run Record'"],
        ["test('single feature mode remains backward compatible'", "test('单一特性模式保持向后兼容'"],
        ["test('single feature mode accepts lightweight records without full spec artifacts'", "test('单一特性模式接受没有完整 spec 制品的轻量级记录'"],
        ["test('single feature mode accepts mini-spec records without full spec artifacts'", "test('单一特性模式接受没有完整 spec 制品的 mini-spec 记录'"],
        ["test('codex prompt classifier reports risky spec recommendation'", "test('codex 提示分类器报告 risky spec 推荐'"],
        ["test('codex pre-tool hook blocks dependency changes'", "test('codex pre-tool 钩子阻止依赖项更改'"],
        ["test('codex stop hook blocks changed work without verification summary'", "test('codex stop 钩子阻止没有验证总结的更改工作'"]
    ];

    for (const [eng, chi] of replacements) {
        content = content.split(eng).join(chi);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
}

translateFile('scripts/check-harness-run.mjs');
translateFile('scripts/check-harness-run.test.mjs');
console.log('done');
