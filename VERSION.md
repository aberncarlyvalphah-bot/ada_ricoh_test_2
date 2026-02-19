# 版本管理策略

## 版本命名规则

### Semantic Versioning (语义化版本)

采用 `vMAJOR.MINOR.PATCH` 格式：

- **MAJOR (主版本号)**: 重大架构变更或不兼容的 API 变更
- **MINOR (次版本号)**: 新功能添加，向后兼容
- **PATCH (修订号)**: Bug 修复，向后兼容

### 当前版本状态

**当前版本**: `v0.0.3` (开发中)

## 版本历史

### v0.0.3 (2026-02-19)
**状态**: ✅ 已发布

**功能**:
- ✅ 数据预览功能（Task 7）
  - 分页功能（每页 10 行）
  - 排序功能（点击表头升序/降序）
  - 筛选功能（选择列 + 输入值）
  - 数据统计显示（总行数、总列数）
  - 导出 CSV 功能

**修复**:
- ✅ 修复 DataDetailsTable SelectItem 空值错误
- ✅ 修复 Sidebar Project add data 按钮无响应

**提交**: `ec14a25`

---

### v0.0.2 (2026-02-19)
**状态**: ✅ 已发布

**功能**:
- ✅ 文件上传功能（Task 6）
  - 文件上传组件（FileUploader.tsx）
  - 拖放上传
  - 点击上传
  - 上传进度显示
  - 文件验证（类型、大小）
  - 文件解析工具（fileParser.ts）

**提交**: `b03ab4a`

---

### v0.0.1 (2026-02-19)
**状态**: ✅ 已发布

**功能**:
- ✅ 项目基础设施（Task 1-4）
  - Next.js 14 项目搭建
  - shadcn/ui 组件库
  - 首页和 Sidebar
  - Workbench 页面（30%/70% 布局）
  - ChatPanel 和 CanvasPanel
  - ECharts 集成（雷达图、柱状图、折线图）
  - ThinkingSteps 组件
  - DataDetailsTable 基础组件

- ✅ 项目结构优化（Task 5）
  - 工具函数库完善（lib/utils.ts）
  - 类型定义完整（types/index.ts）
  - 代码质量优化

**提交**: `7c7671f`

---

## 开发分支策略

### Feature Branches (功能分支)

对于新功能或重大修改：

```bash
# 创建功能分支
git checkout -b feature/task-8

# 开发...
git add .
git commit -m "Task 8: 添加图表类型扩展"

# 合并到 main
git checkout main
git merge feature/task-8
git branch -d feature/task-8
```

### Fix Branches (修复分支)

对于 bug 修复：

```bash
# 创建修复分支
git checkout -b fix/sidebar-add-data-button

# 修复...
git add .
git commit -m "Fix: Sidebar add data button click handler"

# 合并到 main
git checkout main
git merge fix/sidebar-add-data-button
git branch -d fix/sidebar-add-data-button
```

---

## 版本发布流程

### 1. 完成功能开发

确保所有测试通过：
- ✅ npm run lint 通过
- ✅ npm run build 成功
- ✅ 手动测试通过

### 2. 创建版本 Tag

```bash
# 创建带注释的 tag
git tag -a v0.0.4 -m "Version 0.0.4 - 描述变更"

# 指定特定的 commit
git tag -a v0.0.4 -m "描述" <commit-hash>
```

### 3. 推送代码和 Tags

```bash
# 推送代码到 main
git push origin main

# 推送所有 tags
git push origin --tags

# 推送单个 tag
git push origin v0.0.4
```

### 4. 生成 Release Notes

在 GitHub 上创建 Release：
1. 进入仓库页面
2. 点击 "Releases"
3. 点击 "Draft a new release"
4. 选择 tag
5. 填写 release notes
6. 发布

---

## 待开发版本

### v0.0.4 (计划中)

**计划功能**:
- [ ] Task 8: 添加图表类型扩展
  - [ ] 饼图（pie chart）
  - [ ] 散点图（scatter chart）
  - [ ] 热力图（heatmap）
  - [ ] 图表配置面板

---

### v0.1.0 (MVP 发布)

**目标**: 完成核心功能，达到可发布状态

**计划功能**:
- [ ] Task 9: 实现 AI 对话功能
- [ ] Task 10: 实现项目持久化
- [ ] Task 13: 添加错误处理和加载状态

---

### v1.0.0 (正式发布)

**目标**: 功能完整，生产就绪

**计划功能**:
- [ ] 所有 Tasks (1-18) 完成
- [ ] 响应式设计优化（Task 11）
- [ ] 主题切换功能（Task 12）
- [ ] 性能优化（Task 14）
- [ ] 无障碍支持（Task 15）
- [ ] 后端 API 集成（Task 16）
- [ ] 数据导出功能（Task 17）
- [ ] 端到端测试（Task 18）

---

## Tag 删除（如需要）

```bash
# 删除本地 tag
git tag -d v0.0.3

# 删除远程 tag
git push origin :refs/tags/v0.0.3

# 或使用 --delete
git push origin --delete v0.0.3
```

---

## 查看版本信息

```bash
# 查看所有 tags
git tag -l

# 查看特定 tag 信息
git show v0.0.3

# 查看 tag 和对应的 commit
git log --oneline --decorate
```

---

## GitHub Releases

每个版本都会在 GitHub 创建 Release，包含：
- 版本号
- 发布说明
- 功能清单
- Bug 修复列表
- 下载链接（如果需要）

仓库地址: https://github.com/aberncarlyvalphah-bot/ada_ricoh_test_2/releases
