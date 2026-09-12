# GitHub 调研笔记

调研目标：寻找与“中小型犬居家基础训练教程网站”相关的开源项目，学习其信息架构、课程组织和实现方式。以下仅为模式参考，网站文案与代码均为原创。

## 主要参考项目

1. `astrapi69/alc-dog-training`
   - 链接：https://github.com/astrapi69/alc-dog-training
   - 重点：把课程拆成知识卡、理论步骤、练习、测验和复习；包含幼犬、基础、进阶、日常与行为主题。
   - 借鉴：每课明确目标、预计时长、步骤和成功标准，内容与界面分离。

2. `kokitakahashi-baulife/dog-curriculum`
   - 链接：https://github.com/kokitakahashi-baulife/dog-curriculum
   - 重点：用结构化 TypeScript 数据描述命令、基础能力、等级、年龄阶段、任务和训练路线。
   - 借鉴：短时高频、标记信号、解除口令、80% 成功率、时间/距离/干扰逐项增加。

3. `pavlohushuliak/trainer`
   - 链接：https://github.com/pavlohushuliak/trainer
   - 重点：React + Vite + Tailwind 的在线动物训练平台，包含 Hero、Benefits、FAQ、定价、用户宠物档案和后台管理。
   - 借鉴：首页快速说明价值、课程入口、训练方法、常见问题和明确 CTA。

4. `hee-duck/puppy-training-interface`
   - 链接：https://github.com/hee-duck/puppy-training-interface
   - 重点：纯 HTML/CSS/JS 的犬只训练所界面，包含桌面与移动端页面。
   - 借鉴：轻量静态实现、响应式导航、服务卡片和详情页面。

5. `florathemaltese/puppyland`
   - 链接：https://github.com/florathemaltese/puppyland
   - 重点：幼犬训练学校主题的前端 UI/UX 项目。
   - 借鉴：温暖、可信赖的视觉语气，清楚的训练学校价值表达。

6. `Streamline6/Responsive-PetCare-Website`
   - 链接：https://github.com/Streamline6/Responsive-PetCare-Website
   - 重点：Next.js + Tailwind 的响应式宠物护理网站。
   - 借鉴：模块化区块、服务展示、跨设备布局和留白节奏。

## 最终采用的结构

- 首页：价值主张、核心技能、训练原则、四周路线、FAQ。
- Start Here：第一次训练的装备、奖励、标记词、五分钟课程公式、首周安排。
- Training Plan：四周、每日 5–10 分钟的互动计划。
- Guides：注意力与名字、坐与卧、召回、随行、等待与安定、如厕、Leave It。
- About：正向训练原则、内容标准、专业边界和参考来源。
- Privacy：说明本地进度存储、无账户和无默认分析脚本。

## 内容原则

- 使用正向强化，不采用恐吓、疼痛或支配式训练。
- 训练步骤必须能在一个短时段内完成，并给出成功标准和降级方法。
- 同时只增加一个难度变量：时间、距离或干扰。
- 发现疼痛、疾病、严重恐惧、攻击或咬人风险时，建议寻求兽医或认证行为专家。
