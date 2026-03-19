#!/bin/bash
echo "🚀 Installation des skills TOKOSSA..."

# PRIORITÉ 1 — Base
npx skills add vercel-labs/next-skills@next-best-practices -y
npx skills add vercel-labs/agent-skills@vercel-react-best-practices -y
npx skills add vercel-labs/agent-skills@web-design-guidelines -y
npx skills add anthropics/skills@frontend-design -y
npx skills add wshobson/agents@tailwind-design-system -y
npx skills add wshobson/agents@postgresql-table-design -y
npx skills add wshobson/agents@api-design-principles -y
npx skills add supercent-io/skills-template@security-best-practices -y

# PRIORITÉ 2 — Conversion
npx skills add coreyhaines31/marketingskills@page-cro -y
npx skills add coreyhaines31/marketingskills@marketing-psychology -y
npx skills add coreyhaines31/marketingskills@copywriting -y
npx skills add coreyhaines31/marketingskills@analytics-tracking -y
npx skills add coreyhaines31/marketingskills@paid-ads -y
npx skills add coreyhaines31/marketingskills@seo-audit -y
npx skills add nextlevelbuilder/ui-ux-pro-max-skill@ui-ux-pro-max -y
npx skills add sleekdotdesign/agent-skills@sleek-design-mobile-apps -y

# PRIORITÉ 3 — Qualité
npx skills add wshobson/agents@nextjs-app-router-patterns -y
npx skills add wshobson/agents@typescript-advanced-types -y
npx skills add wshobson/agents@architecture-patterns -y
npx skills add wshobson/agents@responsive-design -y
npx skills add supercent-io/skills-template@performance-optimization -y
npx skills add supercent-io/skills-template@database-schema-design -y
npx skills add anthropics/skills@webapp-testing -y

# PRIORITÉ 4 — Agents
npx skills add obra/superpowers@subagent-driven-development -y
npx skills add obra/superpowers@dispatching-parallel-agents -y
npx skills add obra/superpowers@verification-before-completion -y
npx skills add obra/superpowers@executing-plans -y
npx skills add obra/superpowers@systematic-debugging -y
npx skills add anthropics/skills@skill-creator -y
npx skills add supercent-io/skills-template@git-workflow -y

echo "✅ Tous les skills TOKOSSA installés !"