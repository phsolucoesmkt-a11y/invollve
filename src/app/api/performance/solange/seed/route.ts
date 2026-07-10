import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

const MULHERES = [
  { nome: 'PlasmaVitta (Fabiana)', whatsapp: '11976486905', email: 'regenera.academy520@gmail.com', quem_contatou: 'Gabriel', obs: '' },
  { nome: 'Karina de Oliveira Freitas Monteiro', whatsapp: '21964514395', email: 'Karinabianchia@gmail.com', quem_contatou: 'Pedro', obs: '' },
  { nome: 'Pamela Lopess', whatsapp: '11981711101', email: 'Esteticistaabordo@gmail.com', quem_contatou: 'Pedro', obs: '' },
  { nome: 'Gabrielle Mota', whatsapp: '11976820314', email: 'Gabrielle@bvtelecom.com.br', quem_contatou: 'Pedro', obs: '' },
  { nome: 'Madleine Sprocatti', whatsapp: '5511991615757', email: '', quem_contatou: 'Pedro', obs: '' },
  { nome: 'Maristela Carvalho', whatsapp: '5511998939895', email: '', quem_contatou: 'Pedro', obs: 'aceitou participar' },
  { nome: 'Cicleide da Silva Nogueira', whatsapp: '5511968415677', email: '', quem_contatou: 'Pedro', obs: '' },
  { nome: 'Joana Rebuzzi Maciel', whatsapp: '11958803003', email: 'joanarebuzzi@gmail.com', quem_contatou: 'Pedro', obs: 'numero não encontrado' },
  { nome: 'Mônica Rosolen', whatsapp: '11991704646', email: 'monica@mrconsultoriafinanceira.com', quem_contatou: 'Pedro', obs: '' },
  { nome: 'Debora Neri Rovarotto', whatsapp: '16997290150', email: '', quem_contatou: 'Pedro', obs: '' },
  { nome: 'Vanessa Lima', whatsapp: '5567992751112', email: 'Vanessabottimarketing@gmail.com', quem_contatou: 'Pedro', obs: '' },
  { nome: 'Renata Cruz', whatsapp: '11947483043', email: 'refcruz@yahoo.com.br', quem_contatou: 'Sara', obs: 'responder' },
  { nome: 'Maria Helena', whatsapp: '11984947541', email: 'Mariahelenapiaui56@gmail.com', quem_contatou: 'Gabriel', obs: '' },
  { nome: 'Luciane Vieira de Carvalho Miranda', whatsapp: '11947759400', email: 'lucianecarvalho@gmail.com', quem_contatou: 'Pedro', obs: '' },
  { nome: 'Jéssica Thayssa Ferreira de Almeida', whatsapp: '67981370065', email: 'jessica.thayssa@hotmail.com', quem_contatou: 'Pedro', obs: '' },
  { nome: 'Dieide Dias', whatsapp: '11958269860', email: '', quem_contatou: 'Kayque', obs: '' },
  { nome: 'Cristiane Jesus Garcia Portela', whatsapp: '11978239963', email: 'crisjportela@gmail.com', quem_contatou: 'Sara', obs: '' },
  { nome: 'Fabiana Bazolli', whatsapp: '11993919044', email: 'Biabazolli@eventosvivva.com.br', quem_contatou: 'Gabriel', obs: '' },
  { nome: 'Diana Machado', whatsapp: '11999657019', email: 'diana.machado@gmail.com', quem_contatou: 'Gabriel', obs: '' },
  { nome: 'NOELI JACOME', whatsapp: '19995990388', email: 'comercial@nexxatelecom.com.br', quem_contatou: 'Pedro', obs: 'HOMEM' },
  { nome: 'Janete Fátima de Araújo Ferreira', whatsapp: '11984620506', email: 'Janete_etenaj1@hotmail.com', quem_contatou: 'Pedro', obs: '' },
  { nome: 'Adriana Restum', whatsapp: '11996074775', email: 'ardiretoria@planetgirls.com.br', quem_contatou: 'Gabriel', obs: '' },
  { nome: 'Angela De Sousa Cardozo', whatsapp: '11959678194', email: 'atendimento@morangata.com', quem_contatou: 'Pedro', obs: '' },
  { nome: 'Bianca Rodrigues da Silva', whatsapp: '11949484229', email: 'bianca@infinittecorretora.com.br', quem_contatou: 'Pedro', obs: '' },
  { nome: 'Erika Moraes', whatsapp: '11949484229', email: 'Erika.moraes@infinittecorretora.com.br', quem_contatou: 'Pedro', obs: 'numero repetido da Bianca' },
  { nome: 'Tuanny Machado de Souza', whatsapp: '11964768048', email: 'tuannytoro02@gmail.com', quem_contatou: 'Pedro', obs: '' },
  { nome: 'Gabriela Gonçalo', whatsapp: '11958921598', email: 'gabigoncalo92@hotmail.com', quem_contatou: 'Pedro', obs: '' },
  { nome: 'Naiara Garcia', whatsapp: '11973733182', email: 'Naiaragg85@gmail.com', quem_contatou: 'Pedro', obs: '' },
  { nome: 'Juliana Carolina da Silva', whatsapp: '', email: '', quem_contatou: 'Pedro', obs: 'sem numero' },
  { nome: 'Carolina Brandespim', whatsapp: '11973360833', email: 'carol.brandespim@gmail.com', quem_contatou: 'Pedro', obs: '' },
  { nome: 'Alvina Dorneles Viana', whatsapp: '11932273030', email: 'alvinadorneles2023@gmail.com', quem_contatou: 'Kayque', obs: '' },
  { nome: 'Daniella Guimarães Nóbrega Ribeiro', whatsapp: '11917057007', email: 'Daniellagnobrega@hotmail.com', quem_contatou: 'Sara', obs: '' },
  { nome: 'Renata Oliveira dos Santos Onofre', whatsapp: '954016565', email: 'renataonofre2016@gmail.com', quem_contatou: 'Kayque', obs: '' },
  { nome: 'Katharina Vidal Pedrosa', whatsapp: '', email: 'katharinavidal@gmail.com', quem_contatou: 'Pedro', obs: 'sem numero' },
]

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-seed-secret')
  if (secret !== 'invollve-seed-2026') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const existing = await db.all('SELECT COUNT(*) as n FROM solange_mulheres') as any[]
  if (existing[0]?.n > 0) {
    return NextResponse.json({ ok: false, msg: 'Seed já executado', total: existing[0].n })
  }

  for (const m of MULHERES) {
    await db.run(
      `INSERT INTO solange_mulheres (nome, whatsapp, email, quem_contatou, status, obs) VALUES (?, ?, ?, ?, 'contato_feito', ?)`,
      [m.nome, m.whatsapp, m.email, m.quem_contatou, m.obs]
    )
  }

  return NextResponse.json({ ok: true, total: MULHERES.length })
}
