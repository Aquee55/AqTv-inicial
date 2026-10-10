# AqTv — hospedagem grátis (GitHub + Vercel) + login Firebase

Sem localhost. O app fica online na Vercel. Login só com **e-mail e senha reais** (Firebase).

---

## Visão geral

1. Criar repositório no **GitHub** (pode ser pelo celular)
2. Enviar o código do `aqtv-final`
3. Conectar na **Vercel** (grátis) → deploy automático
4. Configurar **Firebase** (e-mail/senha) e **Cloudflare Stream** nas variáveis de ambiente

URL final algo como: `https://aqtv.vercel.app`

---

## Parte A — GitHub (celular ou PC)

### Pelo celular (app GitHub ou site)

1. Instale o app **GitHub** ou abra https://github.com no navegador
2. Entre na sua conta (crie se não tiver)
3. **+** → **New repository**
4. Nome: `aqtv`
5. Public ou Private
6. **Create repository** (pode criar vazio, sem README)

### Enviar o código

**Opção 1 — PC com Git**

```bash
# extraia o zip, depois:
cd aqtv-final
git init
git add .
git commit -m "AqTv inicial"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/aqtv.git
git push -u origin main
```

(Use o link HTTPS do repositório que o GitHub mostrou.)

**Opção 2 — Upload pelo site do GitHub (celular/PC)**

1. No repositório vazio, **uploading an existing file**
2. Envie **toda a pasta** `aqtv-final` (arquivos e pastas internas: `src`, `package.json`, etc.)
3. Commit

**Opção 3 — GitHub Codespaces / outro PC**

Clone o repo vazio e faça push dos arquivos.

---

## Parte B — Vercel (hospedagem grátis)

1. Abra https://vercel.com e entre com a **mesma conta GitHub**
2. **Add New… → Project**
3. Importe o repositório `aqtv`
4. Framework: **Next.js** (detecta sozinho)
5. **Deploy** (ainda sem env vars — o site sobe; login/live configuramos depois)
6. Anote a URL: `https://algo.vercel.app`

A cada `git push` na `main`, a Vercel atualiza o site sozinha.

---

## Parte C — Firebase (login com e-mail real)

1. https://console.firebase.google.com → **Add project**
2. Nome: AqTv → continue (Analytics opcional)
3. **Authentication** → **Get started**
4. Aba **Sign-in method** → **Email/Password** → **Enable** → Save  
   (só e-mail/senha; não precisa Google)
5. Ícone de engrenagem → **Project settings**
6. Em **Your apps** → **Web** (`</>`) → apelido `aqtv` → Register
7. Copie os valores do `firebaseConfig`:

```
apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId
```

8. Na Vercel: Project → **Settings → Environment Variables** → adicione:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | (apiKey) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | (authDomain) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | (projectId) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | (storageBucket) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | (messagingSenderId) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | (appId) |

9. **Deployments** → nos 3 pontinhos do último deploy → **Redeploy**

No site: **/login** → **Criar conta** com e-mail real + senha (mín. 6 caracteres).

---

## Parte D — Cloudflare Stream (live OBS)

Mesmo processo do guia anterior:

1. dash.cloudflare.com → **Stream** ativado
2. API Token com permissão **Stream Edit**
3. Account ID + Customer code (`customer-xxxxx`)

Na Vercel, Environment Variables:

| Name | Value |
|------|--------|
| `CLOUDFLARE_ACCOUNT_ID` | … |
| `CLOUDFLARE_API_TOKEN` | … |
| `CLOUDFLARE_CUSTOMER_CODE` | customer-xxxxx |

Opcional:

| `YOUTUBE_API_KEY` | chave YouTube Data API |

**Redeploy** de novo.

---

## Parte E — Usar no celular / qualquer lugar

1. Abra `https://seu-projeto.vercel.app`
2. **Entrar** → crie conta com e-mail real
3. **Studio** → gerar chave RTMP → OBS no PC com essa chave
4. **Transmitir agora** → live na Home

O Studio e o Dashboard exigem login Firebase.

---

## Checklist

- [ ] Repo GitHub `aqtv` com os arquivos do projeto
- [ ] Projeto importado na Vercel e deploy ok
- [ ] Firebase: Email/Password ligado + 6 variáveis `NEXT_PUBLIC_FIREBASE_*`
- [ ] Cloudflare: 3 variáveis de Stream
- [ ] Redeploy após preencher as env vars
- [ ] Conta criada em /login com e-mail real
- [ ] Live testada no Studio + OBS

---

## Observações

- **Grátis:** Vercel Hobby, Firebase Spark, Cloudflare Stream tem cota gratuita limitada.
- Dados de live/chat em memória no servidor: em cold start da Vercel podem resetar. Para produção estável com muitos usuários, depois ligue um banco (Supabase) no `src/lib/db.ts`.
- Não use localhost: tudo roda na URL da Vercel.

Dúvida em algum passo (GitHub, Vercel ou Firebase), diga em qual parte parou.
