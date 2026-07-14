
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

  try {
    const { messages } = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
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
Mantenha respostas concisas — máximo 3 parágrafos.`,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error, text: 'Erro na API: ' + response.status }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || 'Desculpa, algo deu errado.';

    return new Response(JSON.stringify({ text }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ text: 'Erro interno: ' + err.message }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
