# DWYT — Don't Waste Your Tokens

Este projeto usa um stack de ferramentas para reduzir consumo de tokens.
Clientes integrados neste repositório:
- Claude Code

Todas as integrações deste projeto são opcionais.
Regra geral:
- Se Headroom estiver ativo via wrapper, use Headroom; se não estiver, não use
- Se o MCP do codebase-memory-mcp estiver conectado e respondendo, use ele; se não estiver, faça fallback para busca manual
- Se RTK existir e estiver funcionando, use RTK; se não, rode os comandos normalmente
- Se MemStack estiver disponível no cliente atual, use ele; se não, siga sem memória persistente
Prefira estas integrações, quando suportadas pelo cliente:
- `.mcp.json` para expor ferramentas MCP, incluindo o codebase-memory-mcp
- `AGENTS.md` para agentes compatíveis como Codex, Cursor e Kiro
- `.github/copilot-instructions.md` para GitHub Copilot
- `.cursor/rules/` para regras de projeto do Cursor
- `.kiro/steering/` para steering files do Kiro

### codebase-memory-mcp — Grafo do código
Se o MCP do codebase-memory-mcp estiver conectado e respondendo, prefira o grafo antes de explorar arquivos manualmente.
Se o MCP não estiver disponível, faça fallback para busca manual sem bloquear o trabalho.
- **Indexar projeto**: chame `index_repository` com o caminho do repositório
- **Quem chama função X?**: `trace_call_path(function_name="X", direction="inbound")`
- **O que X chama?**: `trace_call_path(function_name="X", direction="outbound")`
- **Buscar por nome**: `search_graph(label="Function", name_pattern=".*Padrão.*")`
- **Código sem uso**: `search_graph(label="Function", relationship="CALLS", direction="inbound", max_degree=0, exclude_entry_points=true)`
- **Rotas REST**: `search_graph(label="Route")`
- **Chamadas HTTP entre serviços**: `search_graph(relationship="HTTP_CALLS")`
- **Query customizada**: `query_graph(query="MATCH (f:Function)-[:CALLS]->(g) RETURN g.name LIMIT 20")`
- **Ler código fonte**: `get_code_snippet(qualified_name="pacote.Função")`

### RTK — Compressão de output de terminal
Se o comando `rtk` existir e estiver funcionando, use `rtk <comando>` quando fizer sentido.
Se não estiver disponível, execute o comando normal sem bloquear o fluxo.
Para ver quanto foi economizado: `rtk gain`
Para ver oportunidades de economia: `rtk discover`

### Headroom — Compressão de chamadas à API
Se a sessão atual tiver sido iniciada com wrapper do Headroom, use Headroom.
Se não tiver wrapper ativo ou o proxy não estiver rodando, não use Headroom e siga com a API normal.
Suporte oficial de wrapper: `claude`, `codex` e `cursor`.
- Compatibilidade adicional depende do cliente aceitar proxy/base URL custom
- Iniciar proxy: `headroom proxy --port 8787`
- Ver economia em tempo real: `curl http://localhost:8787/stats`

### MemStack — Memória persistente entre sessões
Se o MemStack estiver instalado e disponível no cliente atual, use-o.
Se não estiver disponível, continue sem memória persistente.
Integração automática disponível hoje apenas no Claude Code.
Comandos de ajuda no terminal:
- memstack help
- memstack start
- memstack stop
- memstack stats
- memstack search "<query>"
- memstack get-sessions <project> --limit 5
- memstack get-insights <project>
- memstack get-context <project>
- memstack get-plan <project>
- memstack export-md <project>


---
# DWYT — Don't Waste Your Tokens

Este projeto usa um stack de ferramentas para reduzir consumo de tokens.
Clientes integrados neste repositório:
- Claude Code

Todas as integrações deste projeto são opcionais.
Regra geral:
- Se Headroom estiver ativo via wrapper, use Headroom; se não estiver, não use
- Se o MCP do codebase-memory-mcp estiver conectado e respondendo, use ele; se não estiver, faça fallback para busca manual
- Se RTK existir e estiver funcionando, use RTK; se não, rode os comandos normalmente
- Se MemStack estiver disponível no cliente atual, use ele; se não, siga sem memória persistente
Prefira estas integrações, quando suportadas pelo cliente:
- `.mcp.json` para expor ferramentas MCP, incluindo o codebase-memory-mcp
- `AGENTS.md` para agentes compatíveis como Codex, Cursor e Kiro
- `.github/copilot-instructions.md` para GitHub Copilot
- `.cursor/rules/` para regras de projeto do Cursor
- `.kiro/steering/` para steering files do Kiro

### codebase-memory-mcp — Grafo do código
Se o MCP do codebase-memory-mcp estiver conectado e respondendo, prefira o grafo antes de explorar arquivos manualmente.
Se o MCP não estiver disponível, faça fallback para busca manual sem bloquear o trabalho.
- **Indexar projeto**: chame `index_repository` com o caminho do repositório
- **Quem chama função X?**: `trace_call_path(function_name="X", direction="inbound")`
- **O que X chama?**: `trace_call_path(function_name="X", direction="outbound")`
- **Buscar por nome**: `search_graph(label="Function", name_pattern=".*Padrão.*")`
- **Código sem uso**: `search_graph(label="Function", relationship="CALLS", direction="inbound", max_degree=0, exclude_entry_points=true)`
- **Rotas REST**: `search_graph(label="Route")`
- **Chamadas HTTP entre serviços**: `search_graph(relationship="HTTP_CALLS")`
- **Query customizada**: `query_graph(query="MATCH (f:Function)-[:CALLS]->(g) RETURN g.name LIMIT 20")`
- **Ler código fonte**: `get_code_snippet(qualified_name="pacote.Função")`

### RTK — Compressão de output de terminal
Se o comando `rtk` existir e estiver funcionando, use `rtk <comando>` quando fizer sentido.
Se não estiver disponível, execute o comando normal sem bloquear o fluxo.
Para ver quanto foi economizado: `rtk gain`
Para ver oportunidades de economia: `rtk discover`

### Headroom — Compressão de chamadas à API
Se a sessão atual tiver sido iniciada com wrapper do Headroom, use Headroom.
Se não tiver wrapper ativo ou o proxy não estiver rodando, não use Headroom e siga com a API normal.
Suporte oficial de wrapper: `claude`, `codex` e `cursor`.
- Compatibilidade adicional depende do cliente aceitar proxy/base URL custom
- Iniciar proxy: `headroom proxy --port 8787`
- Ver economia em tempo real: `curl http://localhost:8787/stats`

### MemStack — Memória persistente entre sessões
Se o MemStack estiver instalado e disponível no cliente atual, use-o.
Se não estiver disponível, continue sem memória persistente.
Integração automática disponível hoje apenas no Claude Code.
Comandos de ajuda no terminal:
- memstack help
- memstack start
- memstack stop
- memstack stats
- memstack search "<query>"
- memstack get-sessions <project> --limit 5
- memstack get-insights <project>
- memstack get-context <project>
- memstack get-plan <project>
- memstack export-md <project>


---
# DWYT — Don't Waste Your Tokens

Este projeto usa um stack de ferramentas para reduzir consumo de tokens.
Clientes integrados neste repositório:
- Claude Code

Todas as integrações deste projeto são opcionais.
Regra geral:
- Se Headroom estiver ativo via wrapper, use Headroom; se não estiver, não use
- Se o MCP do codebase-memory-mcp estiver conectado e respondendo, use ele; se não estiver, faça fallback para busca manual
- Se RTK existir e estiver funcionando, use RTK; se não, rode os comandos normalmente
- Se MemStack estiver disponível no cliente atual, use ele; se não, siga sem memória persistente
Prefira estas integrações, quando suportadas pelo cliente:
- `.mcp.json` para expor ferramentas MCP, incluindo o codebase-memory-mcp
- `AGENTS.md` para agentes compatíveis como Codex, Cursor e Kiro
- `.github/copilot-instructions.md` para GitHub Copilot
- `.cursor/rules/` para regras de projeto do Cursor
- `.kiro/steering/` para steering files do Kiro

### codebase-memory-mcp — Grafo do código
Se o MCP do codebase-memory-mcp estiver conectado e respondendo, prefira o grafo antes de explorar arquivos manualmente.
Se o MCP não estiver disponível, faça fallback para busca manual sem bloquear o trabalho.
- **Indexar projeto**: chame `index_repository` com o caminho do repositório
- **Quem chama função X?**: `trace_call_path(function_name="X", direction="inbound")`
- **O que X chama?**: `trace_call_path(function_name="X", direction="outbound")`
- **Buscar por nome**: `search_graph(label="Function", name_pattern=".*Padrão.*")`
- **Código sem uso**: `search_graph(label="Function", relationship="CALLS", direction="inbound", max_degree=0, exclude_entry_points=true)`
- **Rotas REST**: `search_graph(label="Route")`
- **Chamadas HTTP entre serviços**: `search_graph(relationship="HTTP_CALLS")`
- **Query customizada**: `query_graph(query="MATCH (f:Function)-[:CALLS]->(g) RETURN g.name LIMIT 20")`
- **Ler código fonte**: `get_code_snippet(qualified_name="pacote.Função")`

### RTK — Compressão de output de terminal
Se o comando `rtk` existir e estiver funcionando, use `rtk <comando>` quando fizer sentido.
Se não estiver disponível, execute o comando normal sem bloquear o fluxo.
Para ver quanto foi economizado: `rtk gain`
Para ver oportunidades de economia: `rtk discover`

### Headroom — Compressão de chamadas à API
Se a sessão atual tiver sido iniciada com wrapper do Headroom, use Headroom.
Se não tiver wrapper ativo ou o proxy não estiver rodando, não use Headroom e siga com a API normal.
Suporte oficial de wrapper: `claude`, `codex` e `cursor`.
- Compatibilidade adicional depende do cliente aceitar proxy/base URL custom
- Iniciar proxy: `headroom proxy --port 8787`
- Ver economia em tempo real: `curl http://localhost:8787/stats`

### MemStack — Memória persistente entre sessões
Se o MemStack estiver instalado e disponível no cliente atual, use-o.
Se não estiver disponível, continue sem memória persistente.
Integração automática disponível hoje apenas no Claude Code.
Comandos de ajuda no terminal:
- memstack help
- memstack start
- memstack stop
- memstack stats
- memstack search "<query>"
- memstack get-sessions <project> --limit 5
- memstack get-insights <project>
- memstack get-context <project>
- memstack get-plan <project>
- memstack export-md <project>


---
# DWYT — Don't Waste Your Tokens

Este projeto usa um stack de ferramentas para reduzir consumo de tokens.
Clientes integrados neste repositório:
- Claude Code
- Codex

Todas as integrações deste projeto são opcionais.
Regra geral:
- Se Headroom estiver ativo via wrapper, use Headroom; se não estiver, não use
- Se o MCP do codebase-memory-mcp estiver conectado e respondendo, use ele; se não estiver, faça fallback para busca manual
- Se RTK existir e estiver funcionando, use RTK; se não, rode os comandos normalmente
- Se MemStack estiver disponível no cliente atual, use ele; se não, siga sem memória persistente
Prefira estas integrações, quando suportadas pelo cliente:
- `.mcp.json` para expor ferramentas MCP, incluindo o codebase-memory-mcp
- `AGENTS.md` para agentes compatíveis como Codex, Cursor e Kiro
- `.github/copilot-instructions.md` para GitHub Copilot
- `.cursor/rules/` para regras de projeto do Cursor
- `.kiro/steering/` para steering files do Kiro

### codebase-memory-mcp — Grafo do código
Se o MCP do codebase-memory-mcp estiver conectado e respondendo, prefira o grafo antes de explorar arquivos manualmente.
Se o MCP não estiver disponível, faça fallback para busca manual sem bloquear o trabalho.
- **Indexar projeto**: chame `index_repository` com o caminho do repositório
- **Quem chama função X?**: `trace_call_path(function_name="X", direction="inbound")`
- **O que X chama?**: `trace_call_path(function_name="X", direction="outbound")`
- **Buscar por nome**: `search_graph(label="Function", name_pattern=".*Padrão.*")`
- **Código sem uso**: `search_graph(label="Function", relationship="CALLS", direction="inbound", max_degree=0, exclude_entry_points=true)`
- **Rotas REST**: `search_graph(label="Route")`
- **Chamadas HTTP entre serviços**: `search_graph(relationship="HTTP_CALLS")`
- **Query customizada**: `query_graph(query="MATCH (f:Function)-[:CALLS]->(g) RETURN g.name LIMIT 20")`
- **Ler código fonte**: `get_code_snippet(qualified_name="pacote.Função")`

### RTK — Compressão de output de terminal
Se o comando `rtk` existir e estiver funcionando, use `rtk <comando>` quando fizer sentido.
Se não estiver disponível, execute o comando normal sem bloquear o fluxo.
Para ver quanto foi economizado: `rtk gain`
Para ver oportunidades de economia: `rtk discover`

### Headroom — Compressão de chamadas à API
Se a sessão atual tiver sido iniciada com wrapper do Headroom, use Headroom.
Se não tiver wrapper ativo ou o proxy não estiver rodando, não use Headroom e siga com a API normal.
Suporte oficial de wrapper: `claude`, `codex` e `cursor`.
- Compatibilidade adicional depende do cliente aceitar proxy/base URL custom
- Iniciar proxy: `headroom proxy --port 8787`
- Ver economia em tempo real: `curl http://localhost:8787/stats`

### MemStack — Memória persistente entre sessões
Se o MemStack estiver instalado e disponível no cliente atual, use-o.
Se não estiver disponível, continue sem memória persistente.
Integração automática disponível hoje apenas no Claude Code.
Comandos de ajuda no terminal:
- memstack help
- memstack start
- memstack stop
- memstack stats
- memstack search "<query>"
- memstack get-sessions <project> --limit 5
- memstack get-insights <project>
- memstack get-context <project>
- memstack get-plan <project>
- memstack export-md <project>


---
# DWYT — Don't Waste Your Tokens

Este projeto usa um stack de ferramentas para reduzir consumo de tokens.
Clientes integrados neste repositório:
- Claude Code
- Codex

Todas as integrações deste projeto são opcionais.
Regra geral:
- Se Headroom estiver ativo via wrapper, use Headroom; se não estiver, não use
- Se o MCP do codebase-memory-mcp estiver conectado e respondendo, use ele; se não estiver, faça fallback para busca manual
- Se RTK existir e estiver funcionando, use RTK; se não, rode os comandos normalmente
- Se MemStack estiver disponível no cliente atual, use ele; se não, siga sem memória persistente
Prefira estas integrações, quando suportadas pelo cliente:
- `.mcp.json` para expor ferramentas MCP, incluindo o codebase-memory-mcp
- `AGENTS.md` para agentes compatíveis como Codex, Cursor e Kiro
- `.github/copilot-instructions.md` para GitHub Copilot
- `.cursor/rules/` para regras de projeto do Cursor
- `.kiro/steering/` para steering files do Kiro

### RTK — Compressão de output de terminal
Se o comando `rtk` existir e estiver funcionando, use `rtk <comando>` quando fizer sentido.
Se não estiver disponível, execute o comando normal sem bloquear o fluxo.
Para ver quanto foi economizado: `rtk gain`
Para ver oportunidades de economia: `rtk discover`

### Headroom — Compressão de chamadas à API
Se a sessão atual tiver sido iniciada com wrapper do Headroom, use Headroom.
Se não tiver wrapper ativo ou o proxy não estiver rodando, não use Headroom e siga com a API normal.
Suporte oficial de wrapper: `claude`, `codex` e `cursor`.
- Compatibilidade adicional depende do cliente aceitar proxy/base URL custom
- Iniciar proxy: `headroom proxy --port 8787`
- Ver economia em tempo real: `curl http://localhost:8787/stats`

### MemStack — Memória persistente entre sessões
Se o MemStack estiver instalado e disponível no cliente atual, use-o.
Se não estiver disponível, continue sem memória persistente.
Integração automática disponível hoje apenas no Claude Code.
Comandos de ajuda no terminal:
- memstack help
- memstack start
- memstack stop
- memstack stats
- memstack search "<query>"
- memstack get-sessions <project> --limit 5
- memstack get-insights <project>
- memstack get-context <project>
- memstack get-plan <project>
- memstack export-md <project>


---
# DWYT — Don't Waste Your Tokens

Este projeto usa um stack de ferramentas para reduzir consumo de tokens.
Clientes integrados neste repositório:
- Claude Code
- Codex

Todas as integrações deste projeto são opcionais.
Regra geral:
- Se Headroom estiver ativo via wrapper, use Headroom; se não estiver, não use
- Se o MCP do codebase-memory-mcp estiver conectado e respondendo, use ele; se não estiver, faça fallback para busca manual
- Se RTK existir e estiver funcionando, use RTK; se não, rode os comandos normalmente
- Se MemStack estiver disponível no cliente atual, use ele; se não, siga sem memória persistente
Prefira estas integrações, quando suportadas pelo cliente:
- `.mcp.json` para expor ferramentas MCP, incluindo o codebase-memory-mcp
- `AGENTS.md` para agentes compatíveis como Codex, Cursor e Kiro
- `.github/copilot-instructions.md` para GitHub Copilot
- `.cursor/rules/` para regras de projeto do Cursor
- `.kiro/steering/` para steering files do Kiro

### codebase-memory-mcp — Grafo do código
Se o MCP do codebase-memory-mcp estiver conectado e respondendo, prefira o grafo antes de explorar arquivos manualmente.
Se o MCP não estiver disponível, faça fallback para busca manual sem bloquear o trabalho.
- **Indexar projeto**: chame `index_repository` com o caminho do repositório
- **Quem chama função X?**: `trace_call_path(function_name="X", direction="inbound")`
- **O que X chama?**: `trace_call_path(function_name="X", direction="outbound")`
- **Buscar por nome**: `search_graph(label="Function", name_pattern=".*Padrão.*")`
- **Código sem uso**: `search_graph(label="Function", relationship="CALLS", direction="inbound", max_degree=0, exclude_entry_points=true)`
- **Rotas REST**: `search_graph(label="Route")`
- **Chamadas HTTP entre serviços**: `search_graph(relationship="HTTP_CALLS")`
- **Query customizada**: `query_graph(query="MATCH (f:Function)-[:CALLS]->(g) RETURN g.name LIMIT 20")`
- **Ler código fonte**: `get_code_snippet(qualified_name="pacote.Função")`

### RTK — Compressão de output de terminal
Se o comando `rtk` existir e estiver funcionando, use `rtk <comando>` quando fizer sentido.
Se não estiver disponível, execute o comando normal sem bloquear o fluxo.
Para ver quanto foi economizado: `rtk gain`
Para ver oportunidades de economia: `rtk discover`

### Headroom — Compressão de chamadas à API
Se a sessão atual tiver sido iniciada com wrapper do Headroom, use Headroom.
Se não tiver wrapper ativo ou o proxy não estiver rodando, não use Headroom e siga com a API normal.
Suporte oficial de wrapper: `claude`, `codex` e `cursor`.
- Compatibilidade adicional depende do cliente aceitar proxy/base URL custom
- Iniciar proxy: `headroom proxy --port 8787`
- Ver economia em tempo real: `curl http://localhost:8787/stats`

### MemStack — Memória persistente entre sessões
Se o MemStack estiver instalado e disponível no cliente atual, use-o.
Se não estiver disponível, continue sem memória persistente.
Integração automática disponível hoje apenas no Claude Code.
Comandos de ajuda no terminal:
- memstack help
- memstack start
- memstack stop
- memstack stats
- memstack search "<query>"
- memstack get-sessions <project> --limit 5
- memstack get-insights <project>
- memstack get-context <project>
- memstack get-plan <project>
- memstack export-md <project>



<!-- headroom:rtk-instructions -->
# RTK (Rust Token Killer) - Token-Optimized Commands

When running shell commands, **always prefix with `rtk`**. This reduces context
usage by 60-90% with zero behavior change. If rtk has no filter for a command,
it passes through unchanged — so it is always safe to use.

## Key Commands
```bash
# Git (59-80% savings)
rtk git status          rtk git diff            rtk git log

# Files & Search (60-75% savings)
rtk ls <path>           rtk read <file>         rtk grep <pattern>
rtk find <pattern>      rtk diff <file>

# Test (90-99% savings) — shows failures only
rtk pytest tests/       rtk cargo test          rtk test <cmd>

# Build & Lint (80-90% savings) — shows errors only
rtk tsc                 rtk lint                rtk cargo build
rtk prettier --check    rtk mypy                rtk ruff check

# Analysis (70-90% savings)
rtk err <cmd>           rtk log <file>          rtk json <file>
rtk summary <cmd>       rtk deps                rtk env

# GitHub (26-87% savings)
rtk gh pr view <n>      rtk gh run list         rtk gh issue list

# Infrastructure (85% savings)
rtk docker ps           rtk kubectl get         rtk docker logs <c>

# Package managers (70-90% savings)
rtk pip list            rtk pnpm install        rtk npm run <script>
```

## Rules
- In command chains, prefix each segment: `rtk git add . && rtk git commit -m "msg"`
- For debugging, use raw command without rtk prefix
- `rtk proxy <cmd>` runs command without filtering but tracks usage
<!-- /headroom:rtk-instructions -->
