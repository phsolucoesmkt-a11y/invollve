# Lembrete de tarefa por e-mail — setup

Manda um e-mail pro responsável **1 dia antes** do prazo da tarefa, quando o
lembrete está ligado no card. Custo: **R$ 0** (usa o SMTP que o sistema já usa
pros e-mails de "nova tarefa").

## Como o usuário liga
No card da tarefa → marcar **"Lembrete por e-mail"**. Precisa de:
- **data de entrega** na tarefa, e
- **e-mail** no cadastro do responsável.

Aparece um selo 🔔 **E-mail** no card quando está ligado.

---

## O que o servidor precisa (1 vez só)

### 1. SMTP — já configurado
Se os e-mails de "nova tarefa" já chegam hoje, **não precisa mexer**. (São as
mesmas variáveis: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.)

### 2. Variável nova: `CRON_SECRET`
No cPanel → **Setup Node.js App** → seção *Environment variables*, adicione:

```
CRON_SECRET = um-segredo-qualquer-aleatorio
```

Serve só pra proteger a URL do lembrete (ninguém de fora dispara). Reinicie o app depois.

### 3. Cron job diário (cPanel → "Cron Jobs")
Roda 1x por dia (ex.: 9h da manhã) e chama a URL do lembrete:

```
0 9 * * *  curl -s "https://SEU_DOMINIO/api/cron/task-reminders?key=SEGREDO"
```

Troque `SEU_DOMINIO` e `SEGREDO` (o mesmo valor do `CRON_SECRET`).

---

## Testar na hora
Abra no navegador (ou `curl`):

```
https://SEU_DOMINIO/api/cron/task-reminders?key=SEGREDO
```

Resposta esperada (JSON):
```json
{ "ok": true, "day": "2026-07-04", "candidates": 1, "sent": 1, "errors": [] }
```
- `candidates` = tarefas que vencem amanhã com lembrete ligado.
- `sent` = e-mails enviados.
- `errors` = falhas (se houver, mostra o motivo).

Cada tarefa é enviada **uma vez só** (marca como enviada; muda de novo se você
alterar a data de entrega).

## Se algo der errado
| Resposta | Causa | Ação |
|---|---|---|
| `CRON_SECRET não configurada` | faltou a env | adicionar `CRON_SECRET` e reiniciar |
| `não autorizado` | `key=` errado na URL | usar o mesmo valor do `CRON_SECRET` |
| `E-mail não configurado (SMTP_USER)` | SMTP ausente | conferir as variáveis `SMTP_*` |
| `candidates: 0` | nenhuma tarefa vence amanhã / sem lembrete / responsável sem e-mail | normal, é só quando não há nada a lembrar |

> Fuso: o "amanhã" é calculado em **America/Sao_Paulo**.
