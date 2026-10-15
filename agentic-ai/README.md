# Agentic AI 10대 개념 — 학습 저장소 모음

"10 Agentic AI Concepts You Need Before 2027"에서 소개된 GitHub 저장소 10개를
git submodule로 연결해 둔 폴더입니다. (원본은 각 저장소에 있고, 여기에는 특정 커밋만 가리킵니다.)

| # | 개념 | 폴더 | 원본 저장소 | 성격 |
|---|------|------|-------------|------|
| 1 | 하네스 엔지니어링 | `01-harness-engineering` | [walkinglabs/awesome-harness-engineering](https://github.com/walkinglabs/awesome-harness-engineering) | 자료 목록 |
| 2 | 루프 엔지니어링 | `02-loop-engineering` | [cobusgreyling/loop-engineering](https://github.com/cobusgreyling/loop-engineering) | 패턴 + CLI + **Claude 스킬** |
| 3 | 컨텍스트 엔지니어링 | `03-context-engineering` | [yzfly/awesome-context-engineering](https://github.com/yzfly/awesome-context-engineering) | 자료 목록 |
| 4 | MCP 서버 설계 | `04-mcp-servers` | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | 참조 구현 코드 |
| 5 | 에이전트 메모리 | `05-agent-memory` | [mnemoverse/awesome-agent-memory](https://github.com/mnemoverse/awesome-agent-memory) | 자료 목록 |
| 6 | 에이전트 오케스트레이션 | `06-agent-orchestration` | [vivy-yi/awesome-agent-orchestration](https://github.com/vivy-yi/awesome-agent-orchestration) | 자료 목록 |
| 7 | AI 가드레일 | `07-ai-guardrails` | [enguard-ai/awesome-ai-guardrails](https://github.com/enguard-ai/awesome-ai-guardrails) | 자료 목록 |
| 8 | 에이전트 평가 | `08-agent-evals` | [benchflow-ai/awesome-evals](https://github.com/benchflow-ai/awesome-evals) | 자료 목록 + 패턴 |
| 9 | 상태형 에이전트 개발 | `09-stateful-agents` | [cloudflare/agents](https://github.com/cloudflare/agents) | SDK 코드 |
| 10 | 에이전트 관측성 | `10-agent-observability` | [anhermon/awesome-agent-observability](https://github.com/anhermon/awesome-agent-observability) | 자료 목록 |

## 내 PC로 받기

```bash
# 처음 클론할 때 한 번에
git clone --recurse-submodules --shallow-submodules https://github.com/khnk30208/khnk30208-vibe-classes1-.git

# 이미 클론해 둔 경우
git pull
git submodule update --init --depth 1
```

## 최신 버전으로 갱신

```bash
git submodule update --remote --depth 1
git add agentic-ai && git commit -m "chore: update agentic-ai references"
```

## Claude Code 스킬

`.claude/skills/`에 설치되어, 이 저장소에서 Claude Code를 열면 바로 쓸 수 있습니다.

- `agentic-ai-concepts` — 위 10개 개념 질문 시 이 폴더의 자료를 근거로 답하게 하는 길잡이 스킬
- loop-engineering에서 가져온 스킬 7개 (MIT 라이선스, `.claude/skills/LICENSE-loop-engineering`):
  `install-loop`, `loop-triage`, `loop-constraints`, `loop-budget`, `budget-negotiator`, `minimal-fix`, `loop-verifier`
