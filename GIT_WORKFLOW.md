# Git 工作流程文档

## 📌 重要原则
**每次代码迭代完成后，必须提交并推送到 GitHub 一个新版本。**

---

## 🔄 标准工作流程

### 1. 完成代码修改
- ✅ 功能实现完成
- ✅ 测试通过（npm run build、npm run lint）
- ✅ 更新 progress.txt

### 2. 提交代码
```bash
cd "/Users/zhaogoudan/Documents/理光-数据分析agent /data-ada-agent"

# 添加所有修改
git add -A

# 创建提交（使用 HEREDOC 格式）
git commit -m "$(cat <<'EOF'
[简短标题]

### 修改内容：
- [具体修改1]
- [具体修改2]

### 技术说明：
- [技术细节]

### 相关文件：
- [文件列表]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

### 3. 推送到 GitHub
```bash
# 使用 token 推送
git push https://aberncarlyvalphah-bot:YOUR_GITHUB_TOKEN@github.com/aberncarlyvalphah-bot/ada_ricoh_test_2.git main
```

---

## 📝 Commit Message 格式规范

### 标题格式
- **新功能**: `Add: [功能名称]`
- **Bug 修复**: `Fix: [问题描述]`
- **重构**: `Refactor: [重构内容]`
- **文档**: `Docs: [文档更新]`
- **测试**: `Test: [测试内容]`

### 正文格式（HEREDOC）
```bash
git commit -m "$(cat <<'EOF'
Add: 添加新功能名称

### 修改内容：
- 修改点1
- 修改点2

### 技术说明：
- 技术细节说明

### 相关文件：
- file1.ts
- file2.ts

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## 🎯 必须记住的事项

### ✅ 每次迭代必须做的事：
1. [ ] 运行 `npm run build` 确保编译通过
2. [ ] 运行 `npm run lint` 检查代码规范
3. [ ] 更新 `progress.txt` 记录工作内容
4. [ ] 更新 `task.json`（如果完成了一个任务）
5. [ ] `git add -A` 添加所有更改
6. [ ] `git commit` 创建提交
7. [ ] `git push` 推送到 GitHub

### ❌ 不要做的事：
- 不要跳过测试直接提交
- 不要使用模糊的 commit message（如 "fix bug", "update"）
- 不要忘记更新 progress.txt
- 不要在未提交的情况下切换任务

---

## 🔧 Git 常用命令

### 查看状态
```bash
git status                    # 查看文件状态
git diff                      # 查看未暂存的修改
git log --oneline -10         # 查看最近 10 条提交
```

### 撤销操作
```bash
git restore <file>            # 撤销文件修改
git reset HEAD <file>          # 从暂存区移除文件
git reset --soft HEAD~1       # 撤销最后一次提交（保留修改）
```

### 分支操作
```bash
git branch -a                 # 查看所有分支
git checkout -b <branch>      # 创建并切换分支
git merge <branch>            # 合并分支
```

---

## 🌐 GitHub 配置信息

**仓库地址:** https://github.com/aberncarlyvalphah-bot/ada_ricoh_test_2.git

**推送命令:**
```bash
git push https://aberncarlyvalphah-bot:YOUR_GITHUB_TOKEN@github.com/aberncarlyvalphah-bot/ada_ricoh_test_2.git main
```

**注意:**
- Token: `YOUR_GITHUB_TOKEN`（替换为您的实际 token）
- Username: `aberncarlyvalphah-bot`
- Token 请妥善保管，不要泄露，不要提交到代码库

---

## 📋 检查清单（每次推送前确认）

- [ ] `npm run build` 成功
- [ ] `npm run lint` 无错误（或仅有警告）
- [ ] `progress.txt` 已更新
- [ ] `task.json` 已更新（如果完成任务）
- [ ] Commit message 格式正确
- [ ] 已使用 HEREDOC 格式（如需要）
- [ ] 所有相关文件已添加到 git

---

## 📖 参考文档

- [Git 官方文档](https://git-scm.com/doc)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [项目 CLAUDE.md](./CLAUDE.md) - 项目的详细工作流程

---

## ⚠️ 重要提示

**重启终端后，Claude 会失去之前的记忆，但会阅读以下文件恢复上下文：**
1. `CLAUDE.md` - 项目说明和工作流程
2. `progress.txt` - 历史进度记录
3. `GIT_WORKFLOW.md` - 本文档
4. `task.json` - 当前任务列表

**所以，请确保：**
- ✅ 每次迭代都更新这些文档
- ✅ 文档内容清晰准确
- ✅ 不要修改或删除已有内容（只能追加）
