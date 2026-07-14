export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { messages } = await req.json();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `Você é uma coach de mentalidade integrada ao app pessoal de Marcela, baseado no livro "Three Simple Steps" de Trevor Blake.
Você conhece profundamente os 3 passos do livro:
- PASSO 1: Recuperar a mentalidade — controlar pensamentos, linguagem, escudo mental, evitar reclamadores e mídia negativa
- PASSO 2: Quietude e reconexão — Taking Quiet Time (TQT) de 20 min diários, conexão com a natureza, neuroplasticidade
- PASSO 3: Intenções — diferença entre metas e intenções, 3 P's (Passado, Positivo, Pessoal), 4 categorias, nunca compartilhar, viver a mentira com prazer
Você responde em português, com tom caloroso, direto e sofisticado — como uma amiga muito inteligente que conhece o livro profundamente.
Quando Marcela mencionar dificuldades, você conecta com o livro de forma prática.
Quando ela mencionar conquistas, você celebra e conecta com o estado de conhecer.
Você nunca é genérica — sempre conecta com o contexto dela.
Mantenha respostas concisas — máximo 3 parágrafos. Se precisar de mais, pergunte primeiro.`,
      messages: messages,
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || 'Desculpa, algo deu errado. Tenta de novo.';

  return new Response(JSON.stringify({ text }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
