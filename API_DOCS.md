# 📘 Docens — Backend API Documentation

> **Gerado a partir da análise completa do frontend**
> Última atualização: 2026-02-23

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Convenções](#convenções)
3. [Modelos de Dados (Schemas)](#modelos-de-dados-schemas)
4. [Autenticação](#1-autenticação)
5. [Usuários & Perfis](#2-usuários--perfis)
6. [Instituições](#3-instituições)
7. [Matérias (Subjects)](#4-matérias-subjects)
8. [Professores (Teacher Profiles)](#5-professores-teacher-profiles)
9. [Aulões (Class Events)](#6-aulões-class-events)
10. [Matrículas (Enrollments)](#7-matrículas-enrollments)
11. [Pagamentos (Payments)](#8-pagamentos-payments)
12. [Área do Aluno](#9-área-do-aluno)
13. [Área do Professor](#10-área-do-professor)
14. [Regras de Negócio](#regras-de-negócio)

---

## Visão Geral

A API serve uma plataforma de marketplace de **aulas ao vivo (Aulões)** que conecta professores (ex-alunos) a estudantes de instituições de ensino específicas.

**Stack sugerida:** Node.js (Express/Fastify/NestJS) + PostgreSQL + Supabase Auth
**Base URL:** `https://api.docens.app/v1`

---

## Convenções

| Item         | Formato                                                 |
| ------------ | ------------------------------------------------------- |
| IDs          | `string` (UUID v4 preferencialmente)                    |
| Datas        | ISO 8601 (`2026-02-22T19:30:00.000Z`)                   |
| Moeda        | `number` em **centavos** (ex: `14900` = R$ 149,00)      |
| Paginação    | `?page=1&limit=20` (quando aplicável)                   |
| Autenticação | `Authorization: Bearer <jwt_token>`                     |
| Erros        | `{ "error": "CÓDIGO", "message": "Descrição legível" }` |

### Códigos de erro padrão

| HTTP | Código                    | Descrição                                        |
| ---- | ------------------------- | ------------------------------------------------ |
| 400  | `VALIDATION_ERROR`        | Payload inválido                                 |
| 401  | `UNAUTHORIZED`            | Token ausente ou inválido                        |
| 403  | `FORBIDDEN`               | Sem permissão para esta ação                     |
| 404  | `NOT_FOUND`               | Recurso não encontrado                           |
| 409  | `CONFLICT`                | Recurso já existente (ex: enrollment duplicado)  |
| 422  | `BUSINESS_RULE_VIOLATION` | Violação de regra de negócio (ex: aula esgotada) |

---

## Modelos de Dados (Schemas)

### User

```typescript
{
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "BOTH";
}
```

### StudentProfile

```typescript
{
  id: string;
  userId: string;
  preferredInstitutionId?: string;
  institutionIds: string[]; // Instituicoes selecionadas no onboarding/perfil
  labels: string[];         // Tags livres: "Fase 2", "Medicina", etc.
}
```

### TeacherProfile

```typescript
{
  id: string;
  userId: string;
  photo: string;           // Iniciais fallback (max 2 chars)
  photoUrl?: string;       // URL da foto de perfil
  bio: string;
  headline: string; // Ex: "Cálculo, estatística e raciocínio quantitativo"
  institutionIds: string[]; // Instituicoes em que deseja/aceita lecionar
  subjectIds: string[];     // Materias que deseja lecionar
  labels: string[];         // Tags livres do perfil
  isVerified: boolean;
}
```

### Institution

```typescript
{
  id: string;
  name: string; // "Fundação Getulio Vargas"
  shortName: string; // "FGV"
  city: string; // "São Paulo"
  type: "SCHOOL" | "UNIVERSITY";
  logoUrl: string;
}
```

### Subject

```typescript
{
  id: string;
  name: string;          // "Calculo I"
  icon?: string;         // Nome do ícone Lucide: "Sigma", "Atom", etc.
}
```

### InstitutionSubject

```typescript
{
  id: string;
  institutionId: string;
  subjectId: string;
  yearLabel: string; // "1º Ano", "2º Período"
  yearOrder: number; // Para ordenação
}
```

### TeacherSubject

```typescript
{
  id: string;
  teacherProfileId: string;
  subjectId: string;
  levelTag?: string;     // "Graduação", "Vestibular"
}
```

### ClassEvent (Aulão)

```typescript
{
  id: string;
  title: string;
  description: string;
  teacherProfileId: string;
  subjectId: string;
  institutionId: string;
  startsAt: string;                           // ISO 8601
  durationMin: number;                        // Em minutos
  priceCents: number;                         // Em centavos
  capacity: number;                           // Total de vagas
  soldSeats: number;                          // Vagas vendidas
  publicationStatus: "DRAFT" | "PUBLISHED" | "FINISHED";
  meetingStatus: "LOCKED" | "RELEASED";
  meetingUrl?: string;                        // URL do Google Meet/Zoom
}
```

### Enrollment

```typescript
{
  id: string;
  classEventId: string;
  studentProfileId: string;
  status: "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
  createdAt: string; // ISO 8601
}
```

### Payment

```typescript
{
  id: string;
  enrollmentId: string;
  provider: "STRIPE" | "MERCADOPAGO" | "MOCK";
  amountCents: number;
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
}
```

---

## 1. Autenticação

### `POST /auth/register`

Cria uma nova conta de usuário. Usado na página `/cadastro`.

**Request Body:**

```json
{
  "name": "Ana Martins",
  "email": "ana@aluno.docens.app",
  "phone": "(11) 99999-9999",
  "password": "minimo8chars",
  "role": "TEACHER",
  "institutionIds": ["ins-fgv", "ins-mobile"],
  "labels": ["Direito", "Fase 2"],
  "subjectIds": ["sub-direito", "sub-redacao"],
  "photoUrl": "https://cdn.docens.app/profiles/ana.jpg"
}
```

| Campo            | Tipo       | Obrigatório | Validação                                                                                   |
| ---------------- | ---------- | ----------- | ------------------------------------------------------------------------------------------- |
| `name`           | string     | ✅          | Min 2 chars                                                                                 |
| `email`          | string     | ✅          | Email válido, único                                                                         |
| `phone`          | string     | ✅          | Formato brasileiro                                                                          |
| `password`       | string     | ✅          | Min 8 chars                                                                                 |
| `role`           | string     | ✅          | Enum: `"STUDENT"` ou `"TEACHER"`                                                            |
| `institutionIds` | string[]   | ✅          | Ao menos 1 instituição válida                                                               |
| `labels`         | string[]   | ❌          | Máx 15 labels, cada label máx 40 chars                                                     |
| `subjectIds`     | string[]   | ✅*         | Obrigatório quando `role=TEACHER`; cada item deve existir em `subjects`                    |
| `photoUrl`       | string     | ❌          | URL válida; recomendado usar endpoint de upload antes de registrar                          |

\* `subjectIds` pode ser opcional para aluno.

**Response `201 Created`:**

```json
{
  "user": {
    "id": "u-abc123",
    "name": "Ana Martins",
    "email": "ana@aluno.docens.app",
    "role": "TEACHER"
  },
  "studentProfile": null,
  "teacherProfile": {
    "id": "tp-ana",
    "userId": "u-abc123",
    "photo": "AM",
    "photoUrl": "https://cdn.docens.app/profiles/ana.jpg",
    "headline": "",
    "bio": "",
    "institutionIds": ["ins-fgv", "ins-mobile"],
    "subjectIds": ["sub-direito", "sub-redacao"],
    "labels": ["Direito", "Fase 2"],
    "isVerified": false
  },
  "token": "eyJhbGciOiJIUz..."
}
```

**Erros:**

- `409 CONFLICT` → Email já cadastrado

---

### `POST /auth/login`

Login do usuário. Usado na página `/login`.

**Request Body:**

```json
{
  "email": "ana@aluno.docens.app",
  "password": "minimo8chars"
}
```

**Response `200 OK`:**

```json
{
  "user": {
    "id": "u-abc123",
    "name": "Ana Martins",
    "email": "ana@aluno.docens.app",
    "role": "STUDENT"
  },
  "studentProfile": {
    "id": "sp-ana",
    "userId": "u-abc123",
    "preferredInstitutionId": "ins-fgv",
    "institutionIds": ["ins-fgv", "ins-mobile"],
    "labels": ["Direito", "Fase 2"]
  },
  "teacherProfile": null,
  "token": "eyJhbGciOiJIUz..."
}
```

**Erros:**

- `401 UNAUTHORIZED` → Credenciais inválidas

---

### `GET /auth/me`

Retorna o usuário autenticado e seus perfis. Usado pelo layout/navegação para saber se o usuário está logado e qual é seu papel.

**Headers:** `Authorization: Bearer <token>`

**Response `200 OK`:**

```json
{
  "user": {
    "id": "u-abc123",
    "name": "Ana Martins",
    "email": "ana@aluno.docens.app",
    "role": "STUDENT"
  },
  "studentProfile": {
    "id": "sp-ana",
    "userId": "u-abc123",
    "preferredInstitutionId": "ins-fgv",
    "institutionIds": ["ins-fgv", "ins-mobile"],
    "labels": ["Direito", "Fase 2"]
  },
  "teacherProfile": null
}
```

---

## 2. Usuários & Perfis

### `GET /users/:userId`

Retorna dados públicos de um usuário.

**Response `200 OK`:**

```json
{
  "id": "u-teacher-luiza",
  "name": "Luiza Costa",
  "role": "TEACHER"
}
```

> **Nota:** O `email` **NÃO** deve ser retornado para outros usuários — somente para o próprio user ou para professores vendo alunos compradores de suas aulas.

---

## 3. Instituições

### `GET /institutions`

Lista todas as instituições. Usado na página `/explorar`.

**Query Parameters:**

| Param    | Tipo   | Padrão | Descrição                                      |
| -------- | ------ | ------ | ---------------------------------------------- |
| `type`   | string | —      | Filtrar por tipo: `"SCHOOL"` ou `"UNIVERSITY"` |
| `search` | string | —      | Busca por nome, shortName ou cidade            |

**Response `200 OK`:**

```json
[
  {
    "id": "ins-fgv",
    "name": "Fundação Getulio Vargas",
    "shortName": "FGV",
    "city": "São Paulo",
    "type": "UNIVERSITY",
    "logoUrl": "/imgs/faculdades/fgv-logo-0.png"
  },
  {
    "id": "ins-mobile",
    "name": "Colégio Móbile",
    "shortName": "Móbile",
    "city": "São Paulo",
    "type": "SCHOOL",
    "logoUrl": "/imgs/escolas/mobile.png"
  }
]
```

---

### `GET /institutions/:institutionId`

Retorna os detalhes de uma instituição. Usado na página `/instituicoes/[institutionId]`.

**Response `200 OK`:**

```json
{
  "id": "ins-fgv",
  "name": "Fundação Getulio Vargas",
  "shortName": "FGV",
  "city": "São Paulo",
  "type": "UNIVERSITY",
  "logoUrl": "/imgs/faculdades/fgv-logo-0.png"
}
```

---

### `GET /institutions/:institutionId/subjects`

Lista as matérias de uma instituição **agrupadas por ano/período**. Usado na página `/instituicoes/[institutionId]`.

**Response `200 OK`:**

```json
{
  "institution": {
    "id": "ins-mobile",
    "name": "Colégio Móbile",
    "shortName": "Móbile",
    "type": "SCHOOL"
  },
  "yearLevels": [
    {
      "yearLabel": "1º Ano",
      "yearOrder": 1,
      "subjects": [
        {
          "id": "sub-matematica",
          "name": "Matematica",
          "icon": "Sigma",
          "teacherCount": 1
        },
        {
          "id": "sub-portugues",
          "name": "Lingua Portuguesa",
          "icon": "BookOpen",
          "teacherCount": 1
        }
      ]
    },
    {
      "yearLabel": "2º Ano",
      "yearOrder": 2,
      "subjects": [
        {
          "id": "sub-quimica",
          "name": "Quimica",
          "icon": "FlaskConical",
          "teacherCount": 1
        }
      ]
    }
  ]
}
```

> **Importante:** O campo `teacherCount` é calculado contando quantos professores distintos têm aulas **PUBLISHED** naquela matéria+instituição. O frontend mostra "X professores" em cada card de matéria.

---

## 4. Matérias (Subjects)

### `GET /subjects`

Lista todas as matérias disponíveis na plataforma.

**Response `200 OK`:**

```json
[
  { "id": "sub-calculo", "name": "Calculo I", "icon": "Sigma" },
  { "id": "sub-direito", "name": "Direito Constitucional", "icon": "Scale" },
  { "id": "sub-fisica", "name": "Fisica", "icon": "Atom" }
]
```

---

### `GET /subjects/:subjectId`

Retorna uma matéria específica.

**Response `200 OK`:**

```json
{
  "id": "sub-calculo",
  "name": "Calculo I",
  "icon": "Sigma"
}
```

---

## 5. Professores (Teacher Profiles)

### `GET /institutions/:institutionId/subjects/:subjectId/teachers`

Lista professores que têm aulas publicadas para uma matéria em uma instituição. Usado na página `/instituicoes/[institutionId]/materias/[subjectId]`.

**Response `200 OK`:**

```json
{
  "institution": {
    "id": "ins-mobile",
    "shortName": "Móbile"
  },
  "subject": {
    "id": "sub-matematica",
    "name": "Matematica",
    "icon": "Sigma"
  },
  "totalTeachers": 1,
  "totalClasses": 2,
  "teachers": [
    {
      "id": "tp-carlos",
      "photo": "CM",
      "headline": "Matematica e ciencias exatas",
      "bio": "Engenheiro com mestrado em Matematica Aplicada...",
      "isVerified": true,
      "userName": "Carlos Mendes",
      "openClassCount": 2,
      "nextEvent": {
        "id": "ce-mobile-matematica",
        "title": "Matematica: Funcoes e Graficos para o Vestibular",
        "startsAt": "2026-02-25T18:00:00.000Z",
        "durationMin": 120,
        "priceCents": 9900,
        "capacity": 60,
        "soldSeats": 22
      },
      "events": [
        {
          "id": "ce-mobile-matematica",
          "title": "Matematica: Funcoes e Graficos para o Vestibular",
          "description": "Aulao com resolucao intensiva de questoes...",
          "startsAt": "2026-02-25T18:00:00.000Z",
          "durationMin": 120,
          "priceCents": 9900,
          "capacity": 60,
          "soldSeats": 22,
          "publicationStatus": "PUBLISHED",
          "meetingStatus": "LOCKED"
        }
      ]
    }
  ]
}
```

---

### `GET /institutions/:institutionId/teachers/:teacherProfileId`

Retorna perfil completo de um professor com suas aulas nessa instituição. Usado na página `/instituicoes/[institutionId]/professores/[teacherProfileId]`.

**Response `200 OK`:**

```json
{
  "teacher": {
    "id": "tp-rafael",
    "photo": "RP",
    "headline": "Calculo, estatistica e raciocinio quantitativo",
    "bio": "Ex-insper com foco em calculo e estatistica...",
    "isVerified": true,
    "userName": "Rafael Prado"
  },
  "institution": {
    "id": "ins-insper",
    "name": "Insper Instituto de Ensino e Pesquisa",
    "shortName": "Insper"
  },
  "stats": {
    "totalClasses": 3,
    "totalSubjects": 2,
    "openSpots": 2
  },
  "classesBySubject": {
    "sub-calculo": {
      "subject": { "id": "sub-calculo", "name": "Calculo I", "icon": "Sigma" },
      "events": [
        {
          "id": "ce-insper-calculo",
          "title": "Calculo Intensivo: Limites e Derivadas",
          "description": "Imersao ao vivo com lista guiada...",
          "startsAt": "2026-02-22T18:00:00.000Z",
          "durationMin": 100,
          "priceCents": 14900,
          "capacity": 50,
          "soldSeats": 34,
          "publicationStatus": "PUBLISHED",
          "meetingStatus": "RELEASED",
          "meetingUrl": "https://meet.docens.app/calculo-intensivo"
        }
      ]
    }
  }
}
```

---

### `PUT /teacher-profile`

Atualiza o perfil do professor autenticado. Usado na página `/professor/perfil`.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "photo": "LC",
  "photoUrl": "https://cdn.docens.app/profiles/luiza.jpg",
  "headline": "Direito e redacao argumentativa",
  "bio": "Ex-aluna de Direito FGV. Coordena grupos de argumentacao para provas orais.",
  "institutionIds": ["ins-fgv", "ins-mobile"],
  "subjectIds": ["sub-direito", "sub-redacao"],
  "labels": ["Direito", "Fase 2", "Oratoria"]
}
```

| Campo            | Tipo     | Obrigatório | Validação                                      |
| ---------------- | -------- | ----------- | ---------------------------------------------- |
| `photo`          | string   | ✅          | Max 2 chars, uppercase (fallback)              |
| `photoUrl`       | string   | ❌          | URL válida                                     |
| `headline`       | string   | ✅          | Max 100 chars                                  |
| `bio`            | string   | ✅          | Max 500 chars                                  |
| `institutionIds` | string[] | ✅          | Ao menos 1 instituição válida                  |
| `subjectIds`     | string[] | ✅          | Ao menos 1 matéria válida                      |
| `labels`         | string[] | ❌          | Máx 15 labels, cada label máx 40 chars        |

**Response `200 OK`:**

```json
{
  "id": "tp-luiza",
  "userId": "u-teacher-luiza",
  "photo": "LC",
  "photoUrl": "https://cdn.docens.app/profiles/luiza.jpg",
  "bio": "Ex-aluna de Direito FGV...",
  "headline": "Direito e redacao argumentativa",
  "institutionIds": ["ins-fgv", "ins-mobile"],
  "subjectIds": ["sub-direito", "sub-redacao"],
  "labels": ["Direito", "Fase 2", "Oratoria"],
  "isVerified": true
}
```

---

### `PUT /student-profile`

Atualiza o perfil do aluno autenticado. Usado na página `/aluno/perfil`.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "preferredInstitutionId": "ins-fgv",
  "institutionIds": ["ins-fgv", "ins-mobile"],
  "labels": ["Direito", "Fase 2"]
}
```

| Campo                    | Tipo     | Obrigatório | Validação                               |
| ------------------------ | -------- | ----------- | --------------------------------------- |
| `preferredInstitutionId` | string   | ❌          | Deve existir em `institutions`          |
| `institutionIds`         | string[] | ✅          | Ao menos 1 instituição válida           |
| `labels`                 | string[] | ❌          | Máx 15 labels, cada label máx 40 chars |

**Response `200 OK`:**

```json
{
  "id": "sp-ana",
  "userId": "u-abc123",
  "preferredInstitutionId": "ins-fgv",
  "institutionIds": ["ins-fgv", "ins-mobile"],
  "labels": ["Direito", "Fase 2"]
}
```

---

## 6. Aulões (Class Events)

### `GET /class-events/:classEventId`

Retorna os detalhes de um aulão publicado. Usado na página `/auloes/[classEventId]`.

**Headers (opcional):** `Authorization: Bearer <token>` — se autenticado, inclui o `enrollment` do aluno.

**Response `200 OK`:**

```json
{
  "classEvent": {
    "id": "ce-fgv-argumentacao",
    "title": "Clinica de Argumentacao para Casos Contemporaneos",
    "description": "Sessao ao vivo focada em construcao de tese...",
    "startsAt": "2026-02-23T19:30:00.000Z",
    "durationMin": 90,
    "priceCents": 12900,
    "capacity": 60,
    "soldSeats": 48,
    "publicationStatus": "PUBLISHED",
    "meetingStatus": "LOCKED",
    "meetingUrl": null
  },
  "institution": {
    "id": "ins-fgv",
    "name": "Fundação Getulio Vargas",
    "shortName": "FGV"
  },
  "subject": {
    "id": "sub-direito",
    "name": "Direito Constitucional",
    "icon": "Scale"
  },
  "teacher": {
    "id": "tp-luiza",
    "photo": "LC",
    "headline": "Direito e redacao argumentativa",
    "bio": "Ex-aluna de Direito FGV...",
    "isVerified": true,
    "userName": "Luiza Costa"
  },
  "enrollment": {
    "id": "enr-ana-fgv-argumentacao",
    "status": "PAID",
    "createdAt": "2026-02-21T14:00:00.000Z"
  },
  "accessState": "WAITING_RELEASE",
  "isSoldOut": false,
  "spotsLeft": 12
}
```

**Valores de `accessState`:**

| Valor             | Significado                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `NEEDS_PURCHASE`  | Aluno não tem enrollment → mostra botão "Garanta sua vaga"                                   |
| `PENDING_PAYMENT` | Enrollment com status PENDING → mostra "Pagamento em análise"                                |
| `WAITING_RELEASE` | Enrollment PAID mas `meetingStatus=LOCKED` ou antes da hora → mostra "Vaga garantida"        |
| `CAN_ENTER`       | Enrollment PAID + hora \>= startsAt + meetingStatus=RELEASED → mostra botão "Entrar na aula" |

> **Regra:** Só retornar `meetingUrl` quando `accessState === "CAN_ENTER"`. Em outros estados, retornar `null`.

---

### `GET /class-events`

Lista aulões publicados. Usado internamente pelo frontend para feeds.

**Query Parameters:**

| Param              | Tipo   | Descrição                              |
| ------------------ | ------ | -------------------------------------- |
| `institutionId`    | string | Filtrar por instituição                |
| `subjectId`        | string | Filtrar por matéria                    |
| `teacherProfileId` | string | Filtrar por professor                  |
| `status`           | string | `"PUBLISHED"`, `"DRAFT"`, `"FINISHED"` |

**Response `200 OK`:**

```json
[
  {
    "id": "ce-fgv-argumentacao",
    "title": "Clinica de Argumentacao...",
    "description": "Sessao ao vivo...",
    "teacherProfileId": "tp-luiza",
    "subjectId": "sub-direito",
    "institutionId": "ins-fgv",
    "startsAt": "2026-02-23T19:30:00.000Z",
    "durationMin": 90,
    "priceCents": 12900,
    "capacity": 60,
    "soldSeats": 48,
    "publicationStatus": "PUBLISHED",
    "meetingStatus": "LOCKED"
  }
]
```

---

### `POST /class-events`

Cria um novo aulão (como rascunho). Usado na página `/professor/novo-aulao`.

**Headers:** `Authorization: Bearer <token>` (somente teacher)

**Request Body:**

```json
{
  "title": "Calculo Intensivo: Limites e Derivadas",
  "description": "Imersao ao vivo com lista guiada e resolucao de questoes...",
  "institutionId": "ins-insper",
  "subjectId": "sub-calculo",
  "startsAt": "2026-03-01T19:00:00.000Z",
  "durationMin": 90,
  "capacity": 50,
  "priceCents": 14900
}
```

| Campo           | Tipo   | Obrigatório | Validação                           |
| --------------- | ------ | ----------- | ----------------------------------- |
| `title`         | string | ✅          | Min 5, Max 200 chars                |
| `description`   | string | ✅          | Min 10, Max 1000 chars              |
| `institutionId` | string | ✅          | Deve existir na tabela institutions |
| `subjectId`     | string | ✅          | Deve existir na tabela subjects     |
| `startsAt`      | string | ✅          | ISO 8601, deve ser no futuro        |
| `durationMin`   | number | ✅          | Min 30, Max 300, step 15            |
| `capacity`      | number | ✅          | Min 1, Max 500                      |
| `priceCents`    | number | ✅          | Min 0 (0 = gratuito)                |

**Response `201 Created`:**

```json
{
  "id": "ce-novo-123",
  "title": "Calculo Intensivo: Limites e Derivadas",
  "description": "Imersao ao vivo...",
  "teacherProfileId": "tp-rafael",
  "subjectId": "sub-calculo",
  "institutionId": "ins-insper",
  "startsAt": "2026-03-01T19:00:00.000Z",
  "durationMin": 90,
  "priceCents": 14900,
  "capacity": 50,
  "soldSeats": 0,
  "publicationStatus": "DRAFT",
  "meetingStatus": "LOCKED",
  "meetingUrl": null
}
```

> **Nota:** O `teacherProfileId` é definido automaticamente a partir do token do professor autenticado.

---

### `PATCH /class-events/:classEventId`

Atualiza um aulão. Usado para publicar, atualizar dados, ou liberar link.

**Headers:** `Authorization: Bearer <token>` (somente o teacher dono)

**Request Body (exemplo — publicar):**

```json
{
  "publicationStatus": "PUBLISHED"
}
```

**Request Body (exemplo — liberar meeting):**

```json
{
  "meetingStatus": "RELEASED",
  "meetingUrl": "https://meet.docens.app/calculo"
}
```

**Request Body (exemplo — finalizar):**

```json
{
  "publicationStatus": "FINISHED"
}
```

**Response `200 OK`:** Retorna o ClassEvent atualizado.

**Regras:**

- Somente o professor dono pode alterar
- `meetingUrl` só pode ser setado quando `meetingStatus` = `RELEASED`
- Transições de status válidas: `DRAFT → PUBLISHED → FINISHED`

---

## 7. Matrículas (Enrollments)

### `POST /enrollments`

Cria uma matrícula para o aluno autenticado. Usado pelo checkout flow.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "classEventId": "ce-fgv-argumentacao"
}
```

| Campo          | Tipo   | Obrigatório | Validação                                |
| -------------- | ------ | ----------- | ---------------------------------------- |
| `classEventId` | string | ✅          | Deve existir, ser PUBLISHED, e ter vagas |

**Response `201 Created`:**

```json
{
  "id": "enr-abc123",
  "classEventId": "ce-fgv-argumentacao",
  "studentProfileId": "sp-ana",
  "status": "PENDING",
  "createdAt": "2026-02-22T20:00:00.000Z"
}
```

**Erros:**

- `409 CONFLICT` → Aluno já matriculado nesta aula
- `422 BUSINESS_RULE_VIOLATION` → Aula esgotada (`soldSeats >= capacity`)
- `404 NOT_FOUND` → Aula não encontrada ou não publicada

---

### `GET /enrollments/:enrollmentId`

Retorna uma matrícula específica.

**Response `200 OK`:**

```json
{
  "id": "enr-ana-insper-calculo",
  "classEventId": "ce-insper-calculo",
  "studentProfileId": "sp-ana",
  "status": "PAID",
  "createdAt": "2026-02-19T10:00:00.000Z"
}
```

---

## 8. Pagamentos (Payments)

### `POST /payments/checkout`

Inicia o fluxo de pagamento para um enrollment. Usado na página `/checkout/[classEventId]`.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "enrollmentId": "enr-abc123",
  "provider": "STRIPE"
}
```

| Campo          | Tipo   | Obrigatório | Validação                                       |
| -------------- | ------ | ----------- | ----------------------------------------------- |
| `enrollmentId` | string | ✅          | Deve existir, pertencer ao user, status PENDING |
| `provider`     | string | ✅          | Enum: `"STRIPE"`, `"MERCADOPAGO"`               |

**Response `200 OK`:**

```json
{
  "paymentId": "pay-abc123",
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

> **Alternativa simplificada (mock):** Se para o MVP vocês quiserem simular o pagamento sem gateway real, podem usar um endpoint que confirma direto:

### `POST /payments/confirm` (Mock/Simplificado)

Confirma o pagamento diretamente (sem gateway). O frontend já usa isso no `PayButton` → `confirmPayment` action.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "classEventId": "ce-fgv-argumentacao"
}
```

**Comportamento:**

1. Verifica se o aluno já tem enrollment → se não, cria com status `PAID`
2. Se já tem enrollment, atualiza status para `PAID`
3. Incrementa `soldSeats` no classEvent
4. Cria registro de `Payment` com `status: "SUCCEEDED"`

**Response `200 OK`:**

```json
{
  "enrollment": {
    "id": "enr-abc123",
    "classEventId": "ce-fgv-argumentacao",
    "studentProfileId": "sp-ana",
    "status": "PAID",
    "createdAt": "2026-02-22T20:00:00.000Z"
  },
  "payment": {
    "id": "pay-abc123",
    "enrollmentId": "enr-abc123",
    "provider": "MOCK",
    "amountCents": 12900,
    "status": "SUCCEEDED"
  },
  "redirectUrl": "/checkout/ce-fgv-argumentacao/sucesso"
}
```

---

### `POST /payments/webhook`

Webhook para receber notificações do gateway (Stripe/MercadoPago).

**Request Body (Stripe example):**

```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "metadata": {
        "enrollmentId": "enr-abc123",
        "classEventId": "ce-fgv-argumentacao"
      }
    }
  }
}
```

**Comportamento:**

1. Atualiza `Payment.status` → `SUCCEEDED`
2. Atualiza `Enrollment.status` → `PAID`
3. Incrementa `ClassEvent.soldSeats`

---

## 9. Área do Aluno

### `GET /student/agenda`

Retorna a agenda do aluno autenticado (todos os enrollments com seus class events). Usado na página `/aluno/meus-auloes`.

**Headers:** `Authorization: Bearer <token>`

**Response `200 OK`:**

```json
{
  "live": [
    {
      "enrollment": {
        "id": "enr-ana-insper-calculo",
        "status": "PAID",
        "createdAt": "2026-02-19T10:00:00.000Z"
      },
      "classEvent": {
        "id": "ce-insper-calculo",
        "title": "Calculo Intensivo: Limites e Derivadas",
        "startsAt": "2026-02-22T18:00:00.000Z",
        "durationMin": 100,
        "priceCents": 14900,
        "capacity": 50,
        "soldSeats": 34,
        "publicationStatus": "PUBLISHED",
        "meetingStatus": "RELEASED",
        "meetingUrl": "https://meet.docens.app/calculo-intensivo"
      },
      "institution": { "id": "ins-insper", "shortName": "Insper" },
      "teacher": { "userName": "Rafael Prado", "headline": "Calculo..." },
      "accessState": "CAN_ENTER"
    }
  ],
  "upcoming": [
    {
      "enrollment": { "...": "..." },
      "classEvent": { "...": "..." },
      "institution": { "...": "..." },
      "teacher": { "...": "..." },
      "accessState": "WAITING_RELEASE"
    }
  ],
  "history": [
    {
      "enrollment": { "...": "..." },
      "classEvent": { "...": "..." },
      "institution": { "...": "..." },
      "teacher": { "...": "..." },
      "accessState": "NEEDS_PURCHASE"
    }
  ]
}
```

**Classificação das aulas:**

- **`live`**: `startsAt <= now <= startsAt + durationMin`
- **`upcoming`**: `startsAt + durationMin > now` e NOT live
- **`history`**: `startsAt + durationMin < now`

> **Nota sobre meetingUrl:** Só incluir na response quando `accessState === "CAN_ENTER"`.

---

## 10. Área do Professor

### `GET /teacher/dashboard`

Retorna os KPIs e detalhamento por aula do professor autenticado. Usado na página `/professor/dashboard`.

**Headers:** `Authorization: Bearer <token>`

**Response `200 OK`:**

```json
{
  "totalRevenueSucceededCents": 186700,
  "totalPaidStudents": 15,
  "totalClasses": 8,
  "publishedClasses": 6,
  "rows": [
    {
      "classEvent": {
        "id": "ce-fgv-argumentacao",
        "title": "Clinica de Argumentacao...",
        "subjectId": "sub-direito",
        "institutionId": "ins-fgv",
        "startsAt": "2026-02-23T19:30:00.000Z",
        "durationMin": 90,
        "priceCents": 12900,
        "capacity": 60,
        "soldSeats": 48,
        "publicationStatus": "PUBLISHED"
      },
      "institution": { "shortName": "FGV" },
      "subject": { "name": "Direito Constitucional" },
      "paidEnrollments": 5,
      "revenueSucceededCents": 64500
    }
  ]
}
```

---

### `GET /teacher/class-events`

Lista todos os aulões do professor autenticado. Usado na página `/professor/auloes`.

**Headers:** `Authorization: Bearer <token>`

**Response `200 OK`:**

```json
{
  "published": [
    {
      "classEvent": {
        "id": "ce-fgv-argumentacao",
        "title": "...",
        "startsAt": "...",
        "durationMin": 90,
        "priceCents": 12900,
        "capacity": 60,
        "publicationStatus": "PUBLISHED"
      },
      "institution": { "shortName": "FGV" },
      "subject": { "name": "Direito Constitucional" },
      "paidEnrollmentCount": 5
    }
  ],
  "drafts": [],
  "finished": []
}
```

---

### `GET /teacher/class-events/:classEventId/buyers`

Lista os compradores de um aulão. Usado na página `/professor/auloes/[classEventId]/compradores`.

**Headers:** `Authorization: Bearer <token>` (somente o teacher dono)

**Response `200 OK`:**

```json
{
  "classEvent": {
    "id": "ce-fgv-argumentacao",
    "title": "Clinica de Argumentacao...",
    "startsAt": "2026-02-23T19:30:00.000Z"
  },
  "institution": { "shortName": "FGV" },
  "subject": { "name": "Direito Constitucional" },
  "paidCount": 5,
  "buyers": [
    {
      "enrollment": {
        "id": "enr-ana-fgv-argumentacao",
        "status": "PAID"
      },
      "user": {
        "name": "Ana Martins",
        "email": "ana@aluno.docens.app"
      },
      "payment": {
        "amountCents": 12900,
        "provider": "MERCADOPAGO",
        "status": "SUCCEEDED"
      }
    },
    {
      "enrollment": {
        "id": "enr-marcos-fgv-argumentacao",
        "status": "PENDING"
      },
      "user": {
        "name": "Marcos Ferreira",
        "email": "marcos.ferreira@aluno.docens.app"
      },
      "payment": {
        "amountCents": 12900,
        "provider": "MOCK",
        "status": "PENDING"
      }
    }
  ]
}
```

---

## Regras de Negócio

### 🔒 Controle de Acesso

| Regra                           | Descrição                                                                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **1 enrollment / aluno / aula** | Um aluno não pode ter mais de um enrollment ativo para o mesmo ClassEvent                                                             |
| **Capacidade**                  | `soldSeats` não pode exceder `capacity`. Verificar no momento do enrollment                                                           |
| **Somente PUBLISHED visível**   | Alunos só veem aulas com `publicationStatus = "PUBLISHED"`                                                                            |
| **Somente owner edita**         | Só o professor dono (`teacherProfileId`) pode editar/atualizar um ClassEvent                                                          |
| **Meeting URL protegido**       | `meetingUrl` só é exposto quando todas as condições forem atendidas: enrollment PAID + `now >= startsAt` + `meetingStatus = RELEASED` |
| **Sem overlap de professor**    | Professor não pode ter 2 aulas no mesmo horário (verificar sobreposição no CREATE/UPDATE)                                             |

### 🔄 Fluxo de Estado do Aluno

```
┌─────────────────┐
│ Visita a aula    │
│ (sem enrollment) │
└────────┬────────┘
         │ Clica "Garanta sua vaga"
         ▼
┌─────────────────┐         ┌─────────────────┐
│ Checkout page    │────────▶│ ENROLLMENT       │
│ Confirma compra  │         │ status: PENDING  │
└─────────────────┘         └────────┬────────┘
                                     │ Pagamento confirmado
                                     ▼
                            ┌─────────────────┐
                            │ ENROLLMENT       │
                            │ status: PAID     │
                            └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
           ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
           │ Antes da hora│ │ Na hora +    │ │ Aula acabou  │
           │ OU meeting   │ │ meeting      │ │              │
           │ LOCKED       │ │ RELEASED     │ │              │
           └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
                  │                │                │
                  ▼                ▼                ▼
          WAITING_RELEASE     CAN_ENTER        FINISHED
          "Vaga garantida"  "Entrar na aula" "Concluída"
```

### 💰 Fluxo de Pagamento

```
POST /payments/confirm (mock)
    │
    ├─ 1. Verifica se classEvent existe e é PUBLISHED
    ├─ 2. Verifica se tem vagas (soldSeats < capacity)
    ├─ 3. Verifica se aluno já tem enrollment
    │     ├─ NÃO → Cria enrollment com status PAID
    │     └─ SIM (PENDING) → Atualiza para PAID
    ├─ 4. Incrementa classEvent.soldSeats
    ├─ 5. Cria Payment com status SUCCEEDED
    └─ 6. Retorna redirect para /checkout/{id}/sucesso
```

### 📊 Cálculo do Dashboard do Professor

```
Para cada aula do professor:
  - paidEnrollments = enrollments.filter(status === "PAID").length
  - revenueSucceeded = Σ payments.filter(status === "SUCCEEDED").amountCents

Totais:
  - totalRevenue = Σ revenueSucceeded de todas as aulas
  - totalPaidStudents = Σ paidEnrollments de todas as aulas
  - totalClasses = total de ClassEvents
  - publishedClasses = ClassEvents.filter(status === "PUBLISHED").length
```

---

## Diagrama de Relacionamentos

```
┌─────────────────────────────────────────────────────────┐
│                        User                              │
│  id, name, email, role                                   │
└───────┬───────────────────────────────┬─────────────────┘
        │ 1:0..1                        │ 1:0..1
        ▼                               ▼
┌────────────────┐              ┌─────────────────┐
│ StudentProfile │              │ TeacherProfile   │
│ id, userId     │              │ id, userId       │
│ institutions[] │              │ photoUrl, labels │
│ labels[]       │              │ institutions[]   │
└───────┬────────┘              └────┬──────┬──────┘
        │ 1:N                        │ 1:N  │ 1:N
        ▼                            │      ▼
┌─────────────────┐                  │  ┌──────────────┐
│   Enrollment    │                  │  │TeacherSubject│
│ classEventId    │◄─────────────┐   │  │ subjectId    │
│ studentProfile  │              │   │  │ levelTag     │
│ status          │              │   │  └──────────────┘
└───────┬─────────┘              │   │
        │ 1:1                    │   │
        ▼                        │   │
┌─────────────────┐              │   │
│    Payment      │              │   │
│ enrollmentId    │              │   │
│ provider        │              │   │
│ amountCents     │              │   │
│ status          │              │   │
└─────────────────┘              │   │
                                 │   │
┌────────────────────────────────┘   │
│          ClassEvent                │
│  id, title, description           │
│  teacherProfileId ◄───────────────┘
│  subjectId  ◄──────── Subject (id, name, icon)
│  institutionId ◄───── Institution (id, name, type...)
│  startsAt, durationMin
│  priceCents, capacity, soldSeats
│  publicationStatus, meetingStatus
│  meetingUrl
└───────────────────────────────────────┘

InstitutionSubject (M:N entre Institution e Subject)
│  institutionId, subjectId
│  yearLabel, yearOrder
└─────────────────────────────
```

---

## Resumo das Rotas

| Método  | Rota                                             | Auth  | Descrição                         |
| ------- | ------------------------------------------------ | ----- | --------------------------------- |
| `POST`  | `/auth/register`                                 | ❌    | Criar conta                       |
| `POST`  | `/auth/login`                                    | ❌    | Login                             |
| `GET`   | `/auth/me`                                       | ✅    | Dados do usuário autenticado      |
| `GET`   | `/institutions`                                  | ❌    | Listar instituições (com filtros) |
| `GET`   | `/institutions/:id`                              | ❌    | Detalhes de uma instituição       |
| `GET`   | `/institutions/:id/subjects`                     | ❌    | Matérias por ano/período          |
| `GET`   | `/institutions/:id/subjects/:subjectId/teachers` | ❌    | Professores de uma matéria        |
| `GET`   | `/institutions/:id/teachers/:teacherId`          | ❌    | Perfil do professor + aulas       |
| `GET`   | `/subjects`                                      | ❌    | Listar todas as matérias          |
| `GET`   | `/subjects/:id`                                  | ❌    | Detalhes de uma matéria           |
| `GET`   | `/class-events`                                  | ❌    | Listar aulões (com filtros)       |
| `GET`   | `/class-events/:id`                              | ❌/✅ | Detalhes de um aulão              |
| `POST`  | `/class-events`                                  | ✅ 🎓 | Criar aulão (teacher only)        |
| `PATCH` | `/class-events/:id`                              | ✅ 🎓 | Atualizar aulão (teacher only)    |
| `POST`  | `/enrollments`                                   | ✅    | Matricular aluno em aulão         |
| `GET`   | `/enrollments/:id`                               | ✅    | Detalhes de uma matrícula         |
| `POST`  | `/payments/confirm`                              | ✅    | Confirmar pagamento (mock)        |
| `POST`  | `/payments/checkout`                             | ✅    | Iniciar checkout (Stripe/MP)      |
| `POST`  | `/payments/webhook`                              | ❌    | Webhook de gateway                |
| `GET`   | `/student/agenda`                                | ✅    | Agenda do aluno                   |
| `GET`   | `/teacher/dashboard`                             | ✅ 🎓 | Dashboard do professor            |
| `GET`   | `/teacher/class-events`                          | ✅ 🎓 | Aulões do professor               |
| `GET`   | `/teacher/class-events/:id/buyers`               | ✅ 🎓 | Compradores de um aulão           |
| `PUT`   | `/student-profile`                               | ✅    | Atualizar perfil do aluno         |
| `PUT`   | `/teacher-profile`                               | ✅ 🎓 | Atualizar perfil do professor     |

**Legenda:** ✅ = Requer autenticação | 🎓 = Somente professor | ❌ = Público

---

## Schema do Banco de Dados (SQL sugerido)

```sql
-- Enums
CREATE TYPE user_role AS ENUM ('STUDENT', 'TEACHER', 'BOTH');
CREATE TYPE institution_type AS ENUM ('SCHOOL', 'UNIVERSITY');
CREATE TYPE publication_status AS ENUM ('DRAFT', 'PUBLISHED', 'FINISHED');
CREATE TYPE meeting_status AS ENUM ('LOCKED', 'RELEASED');
CREATE TYPE enrollment_status AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED');
CREATE TYPE payment_provider AS ENUM ('STRIPE', 'MERCADOPAGO', 'MOCK');
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- Tables
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  phone VARCHAR(30) NOT NULL,
  role user_role NOT NULL DEFAULT 'STUDENT',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  preferred_institution_id UUID REFERENCES institutions(id),
  institution_ids UUID[] NOT NULL DEFAULT '{}',
  labels TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  photo VARCHAR(2) NOT NULL DEFAULT '??',
  photo_url TEXT,
  bio TEXT NOT NULL DEFAULT '',
  headline VARCHAR(100) NOT NULL DEFAULT '',
  institution_ids UUID[] NOT NULL DEFAULT '{}',
  subject_ids UUID[] NOT NULL DEFAULT '{}',
  labels TEXT[] NOT NULL DEFAULT '{}',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  short_name VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  type institution_type NOT NULL,
  logo_url TEXT NOT NULL
);

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50)
);

CREATE TABLE institution_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  subject_id UUID NOT NULL REFERENCES subjects(id),
  year_label VARCHAR(50) NOT NULL,
  year_order INTEGER NOT NULL,
  UNIQUE (institution_id, subject_id, year_label)
);

CREATE TABLE teacher_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_profile_id UUID NOT NULL REFERENCES teacher_profiles(id),
  subject_id UUID NOT NULL REFERENCES subjects(id),
  level_tag VARCHAR(50),
  UNIQUE (teacher_profile_id, subject_id)
);

CREATE TABLE class_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  teacher_profile_id UUID NOT NULL REFERENCES teacher_profiles(id),
  subject_id UUID NOT NULL REFERENCES subjects(id),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  starts_at TIMESTAMPTZ NOT NULL,
  duration_min INTEGER NOT NULL CHECK (duration_min BETWEEN 30 AND 300),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  capacity INTEGER NOT NULL CHECK (capacity BETWEEN 1 AND 500),
  sold_seats INTEGER NOT NULL DEFAULT 0 CHECK (sold_seats >= 0),
  publication_status publication_status NOT NULL DEFAULT 'DRAFT',
  meeting_status meeting_status NOT NULL DEFAULT 'LOCKED',
  meeting_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (sold_seats <= capacity)
);

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_event_id UUID NOT NULL REFERENCES class_events(id),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id),
  status enrollment_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (class_event_id, student_profile_id)
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id),
  provider payment_provider NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  status payment_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_class_events_institution ON class_events(institution_id);
CREATE INDEX idx_class_events_subject ON class_events(subject_id);
CREATE INDEX idx_class_events_teacher ON class_events(teacher_profile_id);
CREATE INDEX idx_class_events_status ON class_events(publication_status);
CREATE INDEX idx_enrollments_class ON enrollments(class_event_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_profile_id);
CREATE INDEX idx_payments_enrollment ON payments(enrollment_id);
```

---

> **Boa sorte com o backend! 🚀** Qualquer dúvida sobre alguma rota ou regra, me chama.
