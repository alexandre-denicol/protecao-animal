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

