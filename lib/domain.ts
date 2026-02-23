export type UserRole = "STUDENT" | "TEACHER" | "BOTH";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type StudentProfile = {
  id: string;
  userId: string;
  preferredInstitutionId?: string;
  institutionIds: string[];
  labels: string[];
};

export type TeacherProfile = {
  id: string;
  userId: string;
  photo: string;
  photoUrl?: string;
  bio: string;
  headline: string;
  institutionIds: string[];
  subjectIds: string[];
  labels: string[];
  isVerified: boolean;
};

export type Institution = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  type: "SCHOOL" | "UNIVERSITY";
  logoUrl: string;
};

// Let me use the original content from Step 28.
export type Subject = {
  id: string;
  name: string;
  icon?: string;
};

export type InstitutionSubject = {
  id: string;
  institutionId: string;
  subjectId: string;
  yearLabel: string;
  yearOrder: number;
};

export type TeacherSubject = {
  id: string;
  teacherProfileId: string;
  subjectId: string;
  levelTag?: string;
};

export type ClassPublicationStatus = "DRAFT" | "PUBLISHED" | "FINISHED";
export type MeetingReleaseStatus = "LOCKED" | "RELEASED";

export type ClassEvent = {
  id: string;
  title: string;
  description: string;
  teacherProfileId: string;
  subjectId: string;
  institutionId: string;
  startsAt: string;
  durationMin: number;
  priceCents: number;
  capacity: number;
  soldSeats: number;
  publicationStatus: ClassPublicationStatus;
  meetingStatus: MeetingReleaseStatus;
  meetingUrl?: string;
};

export type EnrollmentStatus = "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";

export type Enrollment = {
  id: string;
  classEventId: string;
  studentProfileId: string;
  status: EnrollmentStatus;
  createdAt: string;
};

export type PaymentProvider = "STRIPE" | "MERCADOPAGO" | "MOCK";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export type Payment = {
  id: string;
  enrollmentId: string;
  provider: PaymentProvider;
  amountCents: number;
  status: PaymentStatus;
};

const now = new Date();

function isoAtOffset(dayOffset: number, hour: number, minute: number) {
  const date = new Date(now);
  date.setDate(now.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const users: User[] = [
  {
    id: "u-student-ana",
    name: "Ana Martins",
    email: "ana@aluno.docens.app",
    role: "STUDENT",
  },
  {
    id: "u-student-pedro",
    name: "Pedro Alves",
    email: "pedro.alves@aluno.docens.app",
    role: "STUDENT",
  },
  {
    id: "u-student-julia",
    name: "Julia Santos",
    email: "julia.santos@aluno.docens.app",
    role: "STUDENT",
  },
  {
    id: "u-student-marcos",
    name: "Marcos Ferreira",
    email: "marcos.ferreira@aluno.docens.app",
    role: "STUDENT",
  },
  {
    id: "u-student-camila",
    name: "Camila Rocha",
    email: "camila.rocha@aluno.docens.app",
    role: "STUDENT",
  },
  {
    id: "u-teacher-luiza",
    name: "Luiza Costa",
    email: "luiza@docens.app",
    role: "TEACHER",
  },
  {
    id: "u-teacher-rafael",
    name: "Rafael Prado",
    email: "rafael@docens.app",
    role: "TEACHER",
  },
  {
    id: "u-teacher-carlos",
    name: "Carlos Mendes",
    email: "carlos@docens.app",
    role: "TEACHER",
  },
  {
    id: "u-teacher-mariana",
    name: "Mariana Souza",
    email: "mariana@docens.app",
    role: "TEACHER",
  },
  {
    id: "u-teacher-beatriz",
    name: "Beatriz Lima",
    email: "beatriz@docens.app",
    role: "TEACHER",
  },
];

export const studentProfiles: StudentProfile[] = [
  {
    id: "sp-ana",
    userId: "u-student-ana",
    preferredInstitutionId: "ins-fgv",
    institutionIds: ["ins-fgv", "ins-mobile"],
    labels: ["Direito", "Fase 2", "Bolsa"],
  },
  {
    id: "sp-pedro",
    userId: "u-student-pedro",
    preferredInstitutionId: "ins-fgv",
    institutionIds: ["ins-fgv"],
    labels: ["Direito", "Simulados"],
  },
  {
    id: "sp-julia",
    userId: "u-student-julia",
    preferredInstitutionId: "ins-fgv",
    institutionIds: ["ins-fgv", "ins-insper"],
    labels: ["Economia", "Vestibular"],
  },
  {
    id: "sp-marcos",
    userId: "u-student-marcos",
    preferredInstitutionId: "ins-insper",
    institutionIds: ["ins-insper"],
    labels: ["Engenharia", "Calculo"],
  },
  {
    id: "sp-camila",
    userId: "u-student-camila",
    preferredInstitutionId: "ins-fgv",
    institutionIds: ["ins-fgv", "ins-band"],
    labels: ["Redacao", "Humanas"],
  },
];

export const teacherProfiles: TeacherProfile[] = [
  {
    id: "tp-luiza",
    userId: "u-teacher-luiza",
    photo: "LC",
    photoUrl: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=300&q=80",
    bio: "Ex-aluna de Direito FGV. Coordena grupos de argumentacao para provas orais e estudos de caso.",
    headline: "Direito e redacao argumentativa",
    institutionIds: ["ins-fgv", "ins-mobile"],
    subjectIds: ["sub-direito", "sub-redacao"],
    labels: ["Direito", "Oratoria", "Fase 2"],
    isVerified: true,
  },
  {
    id: "tp-rafael",
    userId: "u-teacher-rafael",
    photo: "RP",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    bio: "Ex-insper com foco em calculo e estatistica aplicada para graduacao e vestibulares concorridos.",
    headline: "Calculo, estatistica e raciocinio quantitativo",
    institutionIds: ["ins-insper", "ins-inteli", "ins-mobile"],
    subjectIds: ["sub-calculo", "sub-fisica", "sub-estatistica"],
    labels: ["Calculo", "Dados", "Graduacao"],
    isVerified: true,
  },
  {
    id: "tp-carlos",
    userId: "u-teacher-carlos",
    photo: "CM",
    bio: "Engenheiro com mestrado em Matematica Aplicada. Especialista em preparacao para vestibulares de alta concorrencia com foco em resolucao de problemas.",
    headline: "Matematica e ciencias exatas",
    institutionIds: ["ins-mobile", "ins-band", "ins-vertice"],
    subjectIds: ["sub-matematica", "sub-fisica", "sub-quimica"],
    labels: ["Exatas", "Vestibular", "Lista guiada"],
    isVerified: true,
  },
  {
    id: "tp-mariana",
    userId: "u-teacher-mariana",
    photo: "MS",
    bio: "Mestre em Letras pela USP. Especialista em redacao dissertativa e analise literaria para FUVEST e ENEM.",
    headline: "Lingua portuguesa e literatura",
    institutionIds: ["ins-mobile", "ins-band"],
    subjectIds: ["sub-portugues", "sub-literatura", "sub-redacao"],
    labels: ["Letras", "Correcao", "FUVEST"],
    isVerified: false,
  },
  {
    id: "tp-beatriz",
    userId: "u-teacher-beatriz",
    photo: "BL",
    bio: "Doutoranda em Biologia Molecular. Ensina ciencias da natureza com abordagem pratica e contextualizada.",
    headline: "Biologia e quimica para vestibulares",
    institutionIds: ["ins-mobile", "ins-vertice"],
    subjectIds: ["sub-biologia", "sub-quimica", "sub-historia"],
    labels: ["Natureza", "Mapas mentais", "Vestibular"],
    isVerified: true,
  },
];


export const institutions: Institution[] = [
  { 
    id: "ins-fgv", 
    name: "Fundação Getulio Vargas", 
    shortName: "FGV", 
    city: "São Paulo",
    type: "UNIVERSITY",
    logoUrl: "/imgs/faculdades/fgv-logo-0.png"
  },
  { 
    id: "ins-insper", 
    name: "Insper Instituto de Ensino e Pesquisa", 
    shortName: "Insper", 
    city: "São Paulo",
    type: "UNIVERSITY",
    logoUrl: "/imgs/faculdades/INsper.png"
  },
  {
    id: "ins-inteli",
    name: "Inteli - Instituto de Tecnologia e Liderança",
    shortName: "Inteli",
    city: "São Paulo",
    type: "UNIVERSITY",
    logoUrl: "/imgs/faculdades/inteli-logo.png"
  },
  {
    id: "ins-mobile",
    name: "Colégio Móbile",
    shortName: "Móbile",
    city: "São Paulo",
    type: "SCHOOL",
    logoUrl: "/imgs/escolas/mobile.png"
  },
  {
    id: "ins-band",
    name: "Colégio Bandeirantes",
    shortName: "Band",
    city: "São Paulo",
    type: "SCHOOL",
    logoUrl: "/imgs/escolas/Band-logo.jpg"
  },
  {
    id: "ins-vertice",
    name: "Colégio Vértice",
    shortName: "Vértice",
    city: "São Paulo",
    type: "SCHOOL",
    logoUrl: "/imgs/escolas/vertice.png"
  },
];

export const subjects: Subject[] = [
  { id: "sub-calculo", name: "Calculo I", icon: "Sigma" },
  { id: "sub-direito", name: "Direito Constitucional", icon: "Scale" },
  { id: "sub-fisica", name: "Fisica", icon: "Atom" },
  { id: "sub-redacao", name: "Redacao", icon: "PenLine" },
  { id: "sub-matematica", name: "Matematica", icon: "Sigma" },
  { id: "sub-portugues", name: "Lingua Portuguesa", icon: "BookOpen" },
  { id: "sub-biologia", name: "Biologia", icon: "Dna" },
  { id: "sub-quimica", name: "Quimica", icon: "FlaskConical" },
  { id: "sub-historia", name: "Historia", icon: "Landmark" },
  { id: "sub-literatura", name: "Estudos Literários", icon: "BookMarked" },
  { id: "sub-geografia", name: "Geografia", icon: "Globe" },
  { id: "sub-estatistica", name: "Estatistica", icon: "BarChart3" },
  { id: "sub-ingles", name: "Ingles", icon: "Languages" },
];

export const institutionSubjects: InstitutionSubject[] = [
  // Colegio Mobile — Ensino Medio
  { id: "is-mobile-1-mat", institutionId: "ins-mobile", subjectId: "sub-matematica", yearLabel: "1º Ano", yearOrder: 1 },
  { id: "is-mobile-1-por", institutionId: "ins-mobile", subjectId: "sub-portugues", yearLabel: "1º Ano", yearOrder: 1 },
  { id: "is-mobile-1-bio", institutionId: "ins-mobile", subjectId: "sub-biologia", yearLabel: "1º Ano", yearOrder: 1 },
  { id: "is-mobile-1-fis", institutionId: "ins-mobile", subjectId: "sub-fisica", yearLabel: "1º Ano", yearOrder: 1 },
  { id: "is-mobile-1-his", institutionId: "ins-mobile", subjectId: "sub-historia", yearLabel: "1º Ano", yearOrder: 1 },
  { id: "is-mobile-1-ing", institutionId: "ins-mobile", subjectId: "sub-ingles", yearLabel: "1º Ano", yearOrder: 1 },

  { id: "is-mobile-2-mat", institutionId: "ins-mobile", subjectId: "sub-matematica", yearLabel: "2º Ano", yearOrder: 2 },
  { id: "is-mobile-2-por", institutionId: "ins-mobile", subjectId: "sub-portugues", yearLabel: "2º Ano", yearOrder: 2 },
  { id: "is-mobile-2-qui", institutionId: "ins-mobile", subjectId: "sub-quimica", yearLabel: "2º Ano", yearOrder: 2 },
  { id: "is-mobile-2-fis", institutionId: "ins-mobile", subjectId: "sub-fisica", yearLabel: "2º Ano", yearOrder: 2 },
  { id: "is-mobile-2-lit", institutionId: "ins-mobile", subjectId: "sub-literatura", yearLabel: "2º Ano", yearOrder: 2 },
  { id: "is-mobile-2-geo", institutionId: "ins-mobile", subjectId: "sub-geografia", yearLabel: "2º Ano", yearOrder: 2 },

  { id: "is-mobile-3-mat", institutionId: "ins-mobile", subjectId: "sub-matematica", yearLabel: "3º Ano", yearOrder: 3 },
  { id: "is-mobile-3-red", institutionId: "ins-mobile", subjectId: "sub-redacao", yearLabel: "3º Ano", yearOrder: 3 },
  { id: "is-mobile-3-qui", institutionId: "ins-mobile", subjectId: "sub-quimica", yearLabel: "3º Ano", yearOrder: 3 },
  { id: "is-mobile-3-bio", institutionId: "ins-mobile", subjectId: "sub-biologia", yearLabel: "3º Ano", yearOrder: 3 },
  { id: "is-mobile-3-fis", institutionId: "ins-mobile", subjectId: "sub-fisica", yearLabel: "3º Ano", yearOrder: 3 },
  { id: "is-mobile-3-his", institutionId: "ins-mobile", subjectId: "sub-historia", yearLabel: "3º Ano", yearOrder: 3 },

  // Colegio Bandeirantes — Ensino Medio
  { id: "is-band-1-mat", institutionId: "ins-band", subjectId: "sub-matematica", yearLabel: "1º Ano", yearOrder: 1 },
  { id: "is-band-1-fis", institutionId: "ins-band", subjectId: "sub-fisica", yearLabel: "1º Ano", yearOrder: 1 },
  { id: "is-band-1-por", institutionId: "ins-band", subjectId: "sub-portugues", yearLabel: "1º Ano", yearOrder: 1 },
  { id: "is-band-2-qui", institutionId: "ins-band", subjectId: "sub-quimica", yearLabel: "2º Ano", yearOrder: 2 },
  { id: "is-band-2-mat", institutionId: "ins-band", subjectId: "sub-matematica", yearLabel: "2º Ano", yearOrder: 2 },
  { id: "is-band-2-bio", institutionId: "ins-band", subjectId: "sub-biologia", yearLabel: "2º Ano", yearOrder: 2 },
  { id: "is-band-3-red", institutionId: "ins-band", subjectId: "sub-redacao", yearLabel: "3º Ano", yearOrder: 3 },
  { id: "is-band-3-fis", institutionId: "ins-band", subjectId: "sub-fisica", yearLabel: "3º Ano", yearOrder: 3 },
  { id: "is-band-3-mat", institutionId: "ins-band", subjectId: "sub-matematica", yearLabel: "3º Ano", yearOrder: 3 },

  // Colegio Vertice — Ensino Medio
  { id: "is-vert-1-mat", institutionId: "ins-vertice", subjectId: "sub-matematica", yearLabel: "1º Ano", yearOrder: 1 },
  { id: "is-vert-1-por", institutionId: "ins-vertice", subjectId: "sub-portugues", yearLabel: "1º Ano", yearOrder: 1 },
  { id: "is-vert-2-qui", institutionId: "ins-vertice", subjectId: "sub-quimica", yearLabel: "2º Ano", yearOrder: 2 },
  { id: "is-vert-2-fis", institutionId: "ins-vertice", subjectId: "sub-fisica", yearLabel: "2º Ano", yearOrder: 2 },
  { id: "is-vert-3-red", institutionId: "ins-vertice", subjectId: "sub-redacao", yearLabel: "3º Ano", yearOrder: 3 },
  { id: "is-vert-3-mat", institutionId: "ins-vertice", subjectId: "sub-matematica", yearLabel: "3º Ano", yearOrder: 3 },

  // FGV — Graduacao em Direito
  { id: "is-fgv-1-red", institutionId: "ins-fgv", subjectId: "sub-redacao", yearLabel: "1º Periodo", yearOrder: 1 },
  { id: "is-fgv-2-dir", institutionId: "ins-fgv", subjectId: "sub-direito", yearLabel: "2º Periodo", yearOrder: 2 },
  { id: "is-fgv-3-dir", institutionId: "ins-fgv", subjectId: "sub-direito", yearLabel: "3º Periodo", yearOrder: 3 },
  { id: "is-fgv-3-calc", institutionId: "ins-fgv", subjectId: "sub-calculo", yearLabel: "3º Periodo", yearOrder: 3 },

  // Insper — Engenharia / Administracao
  { id: "is-insper-1-calc", institutionId: "ins-insper", subjectId: "sub-calculo", yearLabel: "1º Periodo", yearOrder: 1 },
  { id: "is-insper-1-fis", institutionId: "ins-insper", subjectId: "sub-fisica", yearLabel: "1º Periodo", yearOrder: 1 },
  { id: "is-insper-2-calc", institutionId: "ins-insper", subjectId: "sub-calculo", yearLabel: "2º Periodo", yearOrder: 2 },
  { id: "is-insper-2-est", institutionId: "ins-insper", subjectId: "sub-estatistica", yearLabel: "2º Periodo", yearOrder: 2 },
  { id: "is-insper-3-est", institutionId: "ins-insper", subjectId: "sub-estatistica", yearLabel: "3º Periodo", yearOrder: 3 },

  // Inteli — Tecnologia e Lideranca
  { id: "is-inteli-1-calc", institutionId: "ins-inteli", subjectId: "sub-calculo", yearLabel: "1º Periodo", yearOrder: 1 },
  { id: "is-inteli-1-fis", institutionId: "ins-inteli", subjectId: "sub-fisica", yearLabel: "1º Periodo", yearOrder: 1 },
  { id: "is-inteli-2-est", institutionId: "ins-inteli", subjectId: "sub-estatistica", yearLabel: "2º Periodo", yearOrder: 2 },
  { id: "is-inteli-2-calc", institutionId: "ins-inteli", subjectId: "sub-calculo", yearLabel: "2º Periodo", yearOrder: 2 },
];

export const teacherSubjects: TeacherSubject[] = [
  { id: "ts-1", teacherProfileId: "tp-luiza", subjectId: "sub-direito", levelTag: "Graduacao" },
  { id: "ts-2", teacherProfileId: "tp-luiza", subjectId: "sub-redacao", levelTag: "Vestibular" },
  { id: "ts-3", teacherProfileId: "tp-rafael", subjectId: "sub-calculo", levelTag: "Graduacao" },
  { id: "ts-4", teacherProfileId: "tp-rafael", subjectId: "sub-fisica", levelTag: "Vestibular" },
  { id: "ts-5", teacherProfileId: "tp-rafael", subjectId: "sub-estatistica", levelTag: "Graduacao" },
  { id: "ts-6", teacherProfileId: "tp-carlos", subjectId: "sub-matematica", levelTag: "Vestibular" },
  { id: "ts-7", teacherProfileId: "tp-carlos", subjectId: "sub-fisica", levelTag: "Vestibular" },
  { id: "ts-8", teacherProfileId: "tp-carlos", subjectId: "sub-quimica", levelTag: "Vestibular" },
  { id: "ts-9", teacherProfileId: "tp-mariana", subjectId: "sub-portugues", levelTag: "Vestibular" },
  { id: "ts-10", teacherProfileId: "tp-mariana", subjectId: "sub-literatura", levelTag: "Vestibular" },
  { id: "ts-11", teacherProfileId: "tp-mariana", subjectId: "sub-redacao", levelTag: "Vestibular" },
  { id: "ts-12", teacherProfileId: "tp-beatriz", subjectId: "sub-biologia", levelTag: "Vestibular" },
  { id: "ts-13", teacherProfileId: "tp-beatriz", subjectId: "sub-quimica", levelTag: "Vestibular" },
  { id: "ts-14", teacherProfileId: "tp-beatriz", subjectId: "sub-historia", levelTag: "Vestibular" },
];

export const classEvents: ClassEvent[] = [
  {
    id: "ce-fgv-argumentacao",
    title: "Clinica de Argumentacao para Casos Contemporaneos",
    description:
      "Sessao ao vivo focada em construcao de tese e estrutura de resposta para discussao juridica oral.",
    teacherProfileId: "tp-luiza",
    subjectId: "sub-direito",
    institutionId: "ins-fgv",
    startsAt: isoAtOffset(1, 19, 30),
    durationMin: 90,
    priceCents: 12900,
    capacity: 60,
    soldSeats: 48,
    publicationStatus: "PUBLISHED",
    meetingStatus: "LOCKED",
  },
  {
    id: "ce-fgv-redacao",
    title: "Oficina de Redacao para Provas de Bolsa",
    description:
      "Aulao com foco em repertorio, clareza e construcao de introducoes de alto impacto.",
    teacherProfileId: "tp-luiza",
    subjectId: "sub-redacao",
    institutionId: "ins-fgv",
    startsAt: isoAtOffset(4, 18, 0),
    durationMin: 120,
    priceCents: 9900,
    capacity: 90,
    soldSeats: 90,
    publicationStatus: "PUBLISHED",
    meetingStatus: "LOCKED",
  },
  {
    id: "ce-insper-calculo",
    title: "Calculo Intensivo: Limites e Derivadas",
    description:
      "Imersao ao vivo com lista guiada e resolucao de questoes de nivel Insper para a primeira prova.",
    teacherProfileId: "tp-rafael",
    subjectId: "sub-calculo",
    institutionId: "ins-insper",
    startsAt: isoAtOffset(0, now.getHours() - 1, 0),
    durationMin: 100,
    priceCents: 14900,
    capacity: 50,
    soldSeats: 34,
    publicationStatus: "PUBLISHED",
    meetingStatus: "RELEASED",
    meetingUrl: "https://meet.docens.app/calculo-intensivo",
  },
  {
    id: "ce-insper-estatistica",
    title: "Leitura de Dados para Estudos de Caso",
    description:
      "Sessao pratica com datasets reais, foco em interpretacao de graficos e narrativa quantitativa.",
    teacherProfileId: "tp-rafael",
    subjectId: "sub-calculo",
    institutionId: "ins-insper",
    startsAt: isoAtOffset(3, 20, 0),
    durationMin: 80,
    priceCents: 13900,
    capacity: 45,
    soldSeats: 19,
    publicationStatus: "PUBLISHED",
    meetingStatus: "LOCKED",
  },
  {
    id: "ce-mobile-fisica",
    title: "Fisica Aplicada para Segunda Fase",
    description:
      "Aulao orientado por questoes discursivas com enfase em movimento, energia e interpretacao fisica.",
    teacherProfileId: "tp-rafael",
    subjectId: "sub-fisica",
    institutionId: "ins-mobile",
    startsAt: isoAtOffset(2, 17, 30),
    durationMin: 90,
    priceCents: 8900,
    capacity: 70,
    soldSeats: 55,
    publicationStatus: "PUBLISHED",
    meetingStatus: "LOCKED",
  },
  {
    id: "ce-fgv-draft-casos",
    title: "Laboratorio de Casos Publicos",
    description:
      "Rascunho de novo encontro para aprofundar escrita de pareceres curtos e defesa de argumentos.",
    teacherProfileId: "tp-luiza",
    subjectId: "sub-direito",
    institutionId: "ins-fgv",
    startsAt: isoAtOffset(8, 19, 0),
    durationMin: 90,
    priceCents: 11900,
    capacity: 40,
    soldSeats: 0,
    publicationStatus: "DRAFT",
    meetingStatus: "LOCKED",
  },

  // Colegio Mobile — novas aulas
  {
    id: "ce-mobile-matematica",
    title: "Matematica: Funcoes e Graficos para o Vestibular",
    description: "Aulao com resolucao intensiva de questoes de funcoes, trigonometria e geometria analitica para 3a fase.",
    teacherProfileId: "tp-carlos",
    subjectId: "sub-matematica",
    institutionId: "ins-mobile",
    startsAt: isoAtOffset(3, 18, 0),
    durationMin: 120,
    priceCents: 9900,
    capacity: 60,
    soldSeats: 22,
    publicationStatus: "PUBLISHED",
    meetingStatus: "LOCKED",
  },
  {
    id: "ce-mobile-matematica-2",
    title: "Matematica: Probabilidade e Combinatoria",
    description: "Sessao pratica com foco em probabilidade condicional e analise combinatoria aplicada aos vestibulares concorridos.",
    teacherProfileId: "tp-carlos",
    subjectId: "sub-matematica",
    institutionId: "ins-mobile",
    startsAt: isoAtOffset(7, 19, 30),
    durationMin: 90,
    priceCents: 8900,
    capacity: 50,
    soldSeats: 18,
    publicationStatus: "PUBLISHED",
    meetingStatus: "LOCKED",
  },
  {
    id: "ce-mobile-quimica",
    title: "Quimica Organica: Reacoes e Nomenclatura",
    description: "Revisao completa de quimica organica com foco nas reacoes mais cobradas na segunda fase da FUVEST.",
    teacherProfileId: "tp-beatriz",
    subjectId: "sub-quimica",
    institutionId: "ins-mobile",
    startsAt: isoAtOffset(2, 15, 0),
    durationMin: 90,
    priceCents: 7900,
    capacity: 40,
    soldSeats: 38,
    publicationStatus: "PUBLISHED",
    meetingStatus: "LOCKED",
  },
  {
    id: "ce-mobile-portugues",
    title: "Lingua Portuguesa: Interpretacao e Gramatica",
    description: "Aula focada em interpretacao de textos literarios e gramatica contextualizada para vestibulares como FUVEST e UNICAMP.",
    teacherProfileId: "tp-mariana",
    subjectId: "sub-portugues",
    institutionId: "ins-mobile",
    startsAt: isoAtOffset(5, 17, 0),
    durationMin: 100,
    priceCents: 8500,
    capacity: 55,
    soldSeats: 30,
    publicationStatus: "PUBLISHED",
    meetingStatus: "LOCKED",
  },
  {
    id: "ce-mobile-literatura",
    title: "Literatura Brasileira: Modernismo e Contemporaneo",
    description: "Sessao aprofundada sobre as obras da lista da FUVEST com analise critica e producao de resposta discursiva.",
    teacherProfileId: "tp-mariana",
    subjectId: "sub-literatura",
    institutionId: "ins-mobile",
    startsAt: isoAtOffset(6, 18, 30),
    durationMin: 90,
    priceCents: 7900,
    capacity: 45,
    soldSeats: 12,
    publicationStatus: "PUBLISHED",
    meetingStatus: "LOCKED",
  },
  {
    id: "ce-mobile-biologia",
    title: "Biologia Celular: Divisao e Genetica",
    description: "Aulao sobre mitose, meiose e genetica mendeliana com exercicios de alta dificuldade para segunda fase.",
    teacherProfileId: "tp-beatriz",
    subjectId: "sub-biologia",
    institutionId: "ins-mobile",
    startsAt: isoAtOffset(4, 16, 0),
    durationMin: 90,
    priceCents: 7500,
    capacity: 50,
    soldSeats: 27,
    publicationStatus: "PUBLISHED",
    meetingStatus: "LOCKED",
  },
  {
    id: "ce-mobile-historia",
    title: "Historia do Brasil: Republica e Seculo XX",
    description: "Revisao tematica com analise de fontes primarias e contextualizacao para provas discursivas de historia.",
    teacherProfileId: "tp-beatriz",
    subjectId: "sub-historia",
    institutionId: "ins-mobile",
    startsAt: isoAtOffset(9, 17, 0),
    durationMin: 80,
    priceCents: 6900,
    capacity: 60,
    soldSeats: 10,
    publicationStatus: "PUBLISHED",
    meetingStatus: "LOCKED",
  },
  {
    id: "ce-mobile-redacao",
    title: "Redacao: Dissertacao Argumentativa para FUVEST",
    description: "Workshop ao vivo com producao, correcao e reescrita de redacao seguindo os criterios da FUVEST e UNICAMP.",
    teacherProfileId: "tp-mariana",
    subjectId: "sub-redacao",
    institutionId: "ins-mobile",
    startsAt: isoAtOffset(10, 18, 0),
    durationMin: 120,
    priceCents: 9500,
    capacity: 35,
    soldSeats: 35,
    publicationStatus: "PUBLISHED",
    meetingStatus: "LOCKED",
  },

  // Insper — estatistica
  {
    id: "ce-insper-estatistica-2",
    title: "Estatistica: Inferencia e Testes de Hipotese",
    description: "Sessao pratica com foco em testes t, qui-quadrado e regressao linear aplicados a estudos de caso do Insper.",
    teacherProfileId: "tp-rafael",
    subjectId: "sub-estatistica",
    institutionId: "ins-insper",
    startsAt: isoAtOffset(5, 19, 0),
    durationMin: 100,
    priceCents: 13900,
    capacity: 40,
    soldSeats: 15,
    publicationStatus: "PUBLISHED",
    meetingStatus: "LOCKED",
  },

  // ── Histórico (aulas já concluídas) ─────────────────────────────────────────
  {
    id: "ce-insper-calculo-passado",
    title: "Calculo Intensivo: Integrais e Aplicacoes",
    description: "Sessao focada em tecnicas de integracao e aplicacoes a problemas de area e volume para vestibulandos do Insper.",
    teacherProfileId: "tp-rafael",
    subjectId: "sub-calculo",
    institutionId: "ins-insper",
    startsAt: isoAtOffset(-7, 14, 0),
    durationMin: 100,
    priceCents: 14900,
    capacity: 30,
    soldSeats: 30,
    publicationStatus: "FINISHED",
    meetingStatus: "RELEASED",
  },
  {
    id: "ce-fgv-redacao-passada",
    title: "Redacao Intensiva: Dissertacao Argumentativa",
    description: "Aulao com correcao ao vivo de redacoes enviadas pelos alunos, com foco em repertorio e coesao textual.",
    teacherProfileId: "tp-luiza",
    subjectId: "sub-redacao",
    institutionId: "ins-fgv",
    startsAt: isoAtOffset(-14, 18, 0),
    durationMin: 120,
    priceCents: 9900,
    capacity: 25,
    soldSeats: 25,
    publicationStatus: "FINISHED",
    meetingStatus: "RELEASED",
  },
];

export const enrollments: Enrollment[] = [
  {
    id: "enr-ana-insper-calculo",
    classEventId: "ce-insper-calculo",
    studentProfileId: "sp-ana",
    status: "PAID",
    createdAt: isoAtOffset(-3, 10, 0),
  },
  {
    id: "enr-ana-fgv-argumentacao",
    classEventId: "ce-fgv-argumentacao",
    studentProfileId: "sp-ana",
    status: "PAID",
    createdAt: isoAtOffset(-1, 14, 0),
  },
  {
    id: "enr-ana-mobile-fisica",
    classEventId: "ce-mobile-fisica",
    studentProfileId: "sp-ana",
    status: "PENDING",
    createdAt: isoAtOffset(-1, 16, 0),
  },
  // Pedro — aulas da Luiza
  {
    id: "enr-pedro-fgv-argumentacao",
    classEventId: "ce-fgv-argumentacao",
    studentProfileId: "sp-pedro",
    status: "PAID",
    createdAt: isoAtOffset(-2, 11, 0),
  },
  {
    id: "enr-pedro-fgv-redacao",
    classEventId: "ce-fgv-redacao",
    studentProfileId: "sp-pedro",
    status: "PAID",
    createdAt: isoAtOffset(-3, 9, 0),
  },
  // Julia — aulas da Luiza
  {
    id: "enr-julia-fgv-argumentacao",
    classEventId: "ce-fgv-argumentacao",
    studentProfileId: "sp-julia",
    status: "PAID",
    createdAt: isoAtOffset(-1, 20, 0),
  },
  {
    id: "enr-julia-fgv-redacao-passada",
    classEventId: "ce-fgv-redacao-passada",
    studentProfileId: "sp-julia",
    status: "PAID",
    createdAt: isoAtOffset(-15, 8, 0),
  },
  // Marcos — aula da Luiza
  {
    id: "enr-marcos-fgv-argumentacao",
    classEventId: "ce-fgv-argumentacao",
    studentProfileId: "sp-marcos",
    status: "PENDING",
    createdAt: isoAtOffset(0, 8, 30),
  },
  // Camila — aulas da Luiza
  {
    id: "enr-camila-fgv-redacao",
    classEventId: "ce-fgv-redacao",
    studentProfileId: "sp-camila",
    status: "PAID",
    createdAt: isoAtOffset(-2, 14, 0),
  },
  {
    id: "enr-camila-fgv-argumentacao",
    classEventId: "ce-fgv-argumentacao",
    studentProfileId: "sp-camila",
    status: "PAID",
    createdAt: isoAtOffset(-1, 17, 0),
  },
  // Histórico
  {
    id: "enr-ana-insper-calculo-passado",
    classEventId: "ce-insper-calculo-passado",
    studentProfileId: "sp-ana",
    status: "PAID",
    createdAt: isoAtOffset(-10, 10, 0),
  },
  {
    id: "enr-ana-fgv-redacao-passada",
    classEventId: "ce-fgv-redacao-passada",
    studentProfileId: "sp-ana",
    status: "PAID",
    createdAt: isoAtOffset(-16, 10, 0),
  },
];

export const payments: Payment[] = [
  {
    id: "pay-ana-insper-calculo",
    enrollmentId: "enr-ana-insper-calculo",
    provider: "STRIPE",
    amountCents: 14900,
    status: "SUCCEEDED",
  },
  {
    id: "pay-ana-fgv-argumentacao",
    enrollmentId: "enr-ana-fgv-argumentacao",
    provider: "MERCADOPAGO",
    amountCents: 12900,
    status: "SUCCEEDED",
  },
  {
    id: "pay-ana-mobile-fisica",
    enrollmentId: "enr-ana-mobile-fisica",
    provider: "MOCK",
    amountCents: 8900,
    status: "PENDING",
  },
  // Pagamentos dos novos alunos
  {
    id: "pay-pedro-fgv-argumentacao",
    enrollmentId: "enr-pedro-fgv-argumentacao",
    provider: "STRIPE",
    amountCents: 12900,
    status: "SUCCEEDED",
  },
  {
    id: "pay-pedro-fgv-redacao",
    enrollmentId: "enr-pedro-fgv-redacao",
    provider: "STRIPE",
    amountCents: 9900,
    status: "SUCCEEDED",
  },
  {
    id: "pay-julia-fgv-argumentacao",
    enrollmentId: "enr-julia-fgv-argumentacao",
    provider: "MERCADOPAGO",
    amountCents: 12900,
    status: "SUCCEEDED",
  },
  {
    id: "pay-julia-fgv-redacao-passada",
    enrollmentId: "enr-julia-fgv-redacao-passada",
    provider: "STRIPE",
    amountCents: 9900,
    status: "SUCCEEDED",
  },
  {
    id: "pay-marcos-fgv-argumentacao",
    enrollmentId: "enr-marcos-fgv-argumentacao",
    provider: "MOCK",
    amountCents: 12900,
    status: "PENDING",
  },
  {
    id: "pay-camila-fgv-redacao",
    enrollmentId: "enr-camila-fgv-redacao",
    provider: "MERCADOPAGO",
    amountCents: 9900,
    status: "SUCCEEDED",
  },
  {
    id: "pay-camila-fgv-argumentacao",
    enrollmentId: "enr-camila-fgv-argumentacao",
    provider: "STRIPE",
    amountCents: 12900,
    status: "SUCCEEDED",
  },
];

export const viewer = {
  userId: "u-student-ana",
  studentProfileId: "sp-ana",
  teacherProfileId: "tp-luiza",
};

export function getInstitutionById(institutionId: string) {
  return institutions.find((institution) => institution.id === institutionId);
}

export function getSubjectById(subjectId: string) {
  return subjects.find((subject) => subject.id === subjectId);
}

export function getInstitutionsByIds(institutionIds: string[]) {
  return institutionIds
    .map((institutionId) => getInstitutionById(institutionId))
    .filter((institution): institution is Institution => Boolean(institution));
}

export function getSubjectsByIds(subjectIds: string[]) {
  return subjectIds
    .map((subjectId) => getSubjectById(subjectId))
    .filter((subject): subject is Subject => Boolean(subject));
}

export function getTeacherById(teacherProfileId: string) {
  return teacherProfiles.find((teacher) => teacher.id === teacherProfileId);
}

export function getUserById(userId: string) {
  return users.find((u) => u.id === userId);
}

export function getClassEventById(classEventId: string) {
  return classEvents.find((event) => event.id === classEventId);
}

export function getPublishedClassEvents() {
  return classEvents.filter((event) => event.publicationStatus === "PUBLISHED");
}

export function getPublishedClassEventsByInstitution(institutionId: string) {
  return getPublishedClassEvents().filter(
    (event) => event.institutionId === institutionId,
  );
}

export function getEnrollmentForStudent(
  classEventId: string,
  studentProfileId: string,
) {
  return enrollments.find(
    (enrollment) =>
      enrollment.classEventId === classEventId &&
      enrollment.studentProfileId === studentProfileId,
  );
}

export function getStudentAgenda(studentProfileId: string) {
  return enrollments
    .filter((enrollment) => enrollment.studentProfileId === studentProfileId)
    .map((enrollment) => ({
      enrollment,
      classEvent: getClassEventById(enrollment.classEventId),
    }))
    .filter((item): item is { enrollment: Enrollment; classEvent: ClassEvent } =>
      Boolean(item.classEvent),
    )
    .sort(
      (a, b) =>
        new Date(a.classEvent.startsAt).getTime() -
        new Date(b.classEvent.startsAt).getTime(),
    );
}

export function getTeacherClasses(teacherProfileId: string) {
  return classEvents
    .filter((classEvent) => classEvent.teacherProfileId === teacherProfileId)
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
}

export function isClassSoldOut(classEvent: ClassEvent) {
  return classEvent.soldSeats >= classEvent.capacity;
}

export function canStudentEnterClass(params: {
  classEvent: ClassEvent;
  enrollment?: Enrollment;
  now?: Date;
}) {
  const { classEvent, enrollment, now: nowInput } = params;
  const current = nowInput ?? new Date();
  const startsAt = new Date(classEvent.startsAt);

  return (
    enrollment?.status === "PAID" &&
    current.getTime() >= startsAt.getTime() &&
    classEvent.meetingStatus === "RELEASED"
  );
}

export type StudentAccessState =
  | "NEEDS_PURCHASE"
  | "PENDING_PAYMENT"
  | "WAITING_RELEASE"
  | "CAN_ENTER";

export function getInstitutionSubjectsByYear(institutionId: string): Map<string, { yearLabel: string; yearOrder: number; subjects: Subject[] }> {
  const entries = institutionSubjects.filter((is) => is.institutionId === institutionId);
  const map = new Map<string, { yearLabel: string; yearOrder: number; subjects: Subject[] }>();

  for (const entry of entries) {
    const subject = getSubjectById(entry.subjectId);
    if (!subject) continue;

    if (!map.has(entry.yearLabel)) {
      map.set(entry.yearLabel, { yearLabel: entry.yearLabel, yearOrder: entry.yearOrder, subjects: [] });
    }
    map.get(entry.yearLabel)!.subjects.push(subject);
  }

  return map;
}

export function getYearLevels(institutionId: string) {
  const map = getInstitutionSubjectsByYear(institutionId);
  return Array.from(map.values()).sort((a, b) => a.yearOrder - b.yearOrder);
}

export function getTeachersBySubjectAndInstitution(institutionId: string, subjectId: string): TeacherProfile[] {
  const events = getPublishedClassEvents().filter(
    (e) => e.institutionId === institutionId && e.subjectId === subjectId,
  );
  const teacherIds = Array.from(new Set(events.map((e) => e.teacherProfileId)));
  return teacherIds
    .map((id) => getTeacherById(id))
    .filter((t): t is TeacherProfile => Boolean(t));
}

export function getClassEventsBySubjectAndInstitution(institutionId: string, subjectId: string) {
  return getPublishedClassEvents()
    .filter((e) => e.institutionId === institutionId && e.subjectId === subjectId)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

export function getNextClassEventForTeacher(institutionId: string, subjectId: string, teacherProfileId: string) {
  const now = new Date();
  return getPublishedClassEvents()
    .filter(
      (e) =>
        e.institutionId === institutionId &&
        e.subjectId === subjectId &&
        e.teacherProfileId === teacherProfileId &&
        new Date(e.startsAt).getTime() > now.getTime(),
    )
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];
}

// ── Professor area selectors ─────────────────────────────────────────────────

export function getEnrollmentsByClass(classEventId: string): Enrollment[] {
  return enrollments.filter((e) => e.classEventId === classEventId);
}

export function getPaymentByEnrollmentId(enrollmentId: string): Payment | undefined {
  return payments.find((p) => p.enrollmentId === enrollmentId);
}

export function getStudentProfileById(studentProfileId: string): StudentProfile | undefined {
  return studentProfiles.find((sp) => sp.id === studentProfileId);
}

export type ClassDashboardRow = {
  classEvent: ClassEvent;
  paidEnrollments: number;
  revenueSucceededCents: number;
};

export type TeacherDashboard = {
  totalRevenueSucceededCents: number;
  totalPaidStudents: number;
  totalClasses: number;
  publishedClasses: number;
  rows: ClassDashboardRow[];
};

export function getTeacherDashboard(teacherProfileId: string): TeacherDashboard {
  const classes = getTeacherClasses(teacherProfileId);

  const rows: ClassDashboardRow[] = classes.map((classEvent) => {
    const classEnrollments = getEnrollmentsByClass(classEvent.id);
    const paidEnrollments = classEnrollments.filter((e) => e.status === "PAID");
    const revenueSucceededCents = paidEnrollments.reduce((sum, enrollment) => {
      const payment = getPaymentByEnrollmentId(enrollment.id);
      if (payment?.status === "SUCCEEDED") return sum + payment.amountCents;
      return sum;
    }, 0);
    return { classEvent, paidEnrollments: paidEnrollments.length, revenueSucceededCents };
  });

  return {
    totalRevenueSucceededCents: rows.reduce((s, r) => s + r.revenueSucceededCents, 0),
    totalPaidStudents: rows.reduce((s, r) => s + r.paidEnrollments, 0),
    totalClasses: classes.length,
    publishedClasses: classes.filter((c) => c.publicationStatus === "PUBLISHED").length,
    rows,
  };
}

export type BuyerListItem = {
  enrollment: Enrollment;
  user: User;
  payment: Payment | undefined;
};

export function getBuyerList(classEventId: string): BuyerListItem[] {
  return getEnrollmentsByClass(classEventId)
    .filter((e) => e.status === "PAID" || e.status === "PENDING")
    .map((enrollment) => {
      const studentProfile = getStudentProfileById(enrollment.studentProfileId);
      const user = studentProfile ? getUserById(studentProfile.userId) : undefined;
      const payment = getPaymentByEnrollmentId(enrollment.id);
      return user ? { enrollment, user, payment } : null;
    })
    .filter((item): item is BuyerListItem => item !== null);
}

// ─────────────────────────────────────────────────────────────────────────────

export function getStudentAccessState(params: {
  classEvent: ClassEvent;
  enrollment?: Enrollment;
  now?: Date;
}): StudentAccessState {
  const { classEvent, enrollment, now: nowInput } = params;
  const current = nowInput ?? new Date();
  const startsAt = new Date(classEvent.startsAt);

  if (!enrollment) {
    return "NEEDS_PURCHASE";
  }

  if (enrollment.status === "PENDING") {
    return "PENDING_PAYMENT";
  }

  if (canStudentEnterClass({ classEvent, enrollment, now: current })) {
    return "CAN_ENTER";
  }

  if (enrollment.status === "PAID" && current.getTime() < startsAt.getTime()) {
    return "WAITING_RELEASE";
  }

  if (enrollment.status === "PAID" && classEvent.meetingStatus === "LOCKED") {
    return "WAITING_RELEASE";
  }

  return "NEEDS_PURCHASE";
}
