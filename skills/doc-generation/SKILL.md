# 自动生成 JSDoc 技能 (Doc Generation Skill)

当 ESLint 或 Pre-commit 钩子拦截到代码缺失 JSDoc 注释时，调用此技能来全自动补齐。

## 目标

为指定的源文件中的所有的 `export default function`, `export const`, `export function` 生成高质量、符合业务上下文的 JSDoc 注释。

## 前置依赖

无特殊依赖，执行环境需要具备文件读取和编辑能力（如 `replace_file_content` 或直接文件写入）。

## 执行步骤

1. **读取文件内容**：
   接收人类或脚本传递的目标文件路径，使用工具读取文件的完整内容。
2. **分析上下文**：
   - 阅读该文件的业务逻辑。
   - 识别组件名/函数名。
   - 分析函数的入参 (Props/Arguments) 和返回值 (Returns)。
3. **生成注释内容**：
   根据分析结果，生成符合 JSDoc 规范的注释，格式如下：
   ```typescript
   /**
    * [这里写一句话简明扼要的功能描述]
    * 
    * @param {类型} paramName - [参数描述]
    * @returns {类型} - [返回值描述]
    */
   ```
4. **编辑写入**：
   使用文件编辑工具，将生成的 `/** ... */` 块精确地插入到对应的 `export` 关键字上方。
5. **验证检查**：
   运行 `npm run lint` 验证 ESLint 的 `jsdoc/require-jsdoc` 规则是否已通过。

## 注意事项
- 描述必须准确且精炼，不要出现“这是一个函数”这种废话。
- 对于 React 组件，重点描述它的 UI 呈现作用和接受的 Props。
- 对于 Hooks，重点描述其副作用和返回值。
- 对于 Services/APIs，重点描述其调用的后端接口行为和数据处理逻辑。
