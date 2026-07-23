import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {GoogleGenAI} from '@google/genai';

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-server',
    configureServer(server) {
      // Endpoint 1: Gemma AI Multi-Agent & Environmental Consultant
      const handleGemmaAnalyze = async (req: any, res: any) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { prompt, propertyInfo, agentType } = JSON.parse(body || '{}');
              const apiKey = process.env.GEMINI_API_KEY;

              if (!apiKey) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    error: 'Chave GEMINI_API_KEY não configurada no servidor.',
                  })
                );
                return;
              }

              const ai = new GoogleGenAI({
                apiKey: apiKey,
                httpOptions: {
                  headers: {
                    'User-Agent': 'aistudio-build',
                  },
                },
              });

              let systemPrompt = `Você é a suíte de IA GemmaGuardian para Regularização Ambiental na Amazônia Legal (Acre, RESEX Chico Mendes).
Análise com dados REAIS da propriedade fornecida em tempo real.`;

              if (agentType === 'gis') {
                systemPrompt += `\nPapel: Agente Analista GIS Gemma 2B.
Analise a geometria, vértices, coordenadas GPS, área total em hectares (${propertyInfo?.totalAreaHa} ha), cobertura florestal (${propertyInfo?.forestCoverHa} ha), déficit de Reserva Legal (${propertyInfo?.recoveryGapHa} ha) e código shapefile/polígono (${propertyInfo?.shapefileCode}).
Calcule com precisão matemática as métricas espaciais e a porcentagem preservada vs exigida pelo Código Florestal (80% na Amazônia Legal).
Responda de forma concisa, objetiva e técnica.`;
              } else if (agentType === 'legal') {
                systemPrompt += `\nPapel: Agente Jurídico Ambiental Gemma 9B (RAG Legal).
Analise o status de embargo (${propertyInfo?.embargoStatus?.embargoId || 'N/A'}), órgão autuador (${propertyInfo?.embargoStatus?.organ}), status (${propertyInfo?.embargoStatus?.status}), CPF/CNPJ (${propertyInfo?.embargoStatus?.cpfCnpjMasked}), município (${propertyInfo?.municipality}/${propertyInfo?.state}) e déficit de Reserva Legal (${propertyInfo?.recoveryGapHa} ha).
Fundamente na Lei 12.651/2012 (Código Florestal, Art. 12) e Instruções Normativas do ICMBio/IBAMA. Forneça o veredito jurídico com passos práticos para regularização e desembargo.`;
              } else if (agentType === 'ecology') {
                systemPrompt += `\nPapel: Agente Ecólogo de Restauração Gemma 27B.
Analise o déficit de recomposição de ${propertyInfo?.recoveryGapHa} ha na localização ${propertyInfo?.municipality}/${propertyInfo?.state}.
Recomende estratégias de restauração ecológica (plantio em núcleos/Anderson, adubação verde, cercamento), quantidade exata de mudas nativas (baseado em ~400 mudas/ha), estimativa de custo (R$ 4.000/ha) e captura anual de carbono (~12 t/ha/ano). Cite espécies nativas da Amazônia como Castanheira-do-Brasil, Mogno, Andiroba, Açaí-da-Mata, Ipê-Roxo e Samaúma.`;
              } else if (agentType === 'synthesis') {
                systemPrompt += `\nPapel: Agente de Síntese Multimodal Gemma.
Sintetize os dados espaciais, o veredito jurídico e a estratégia ecológica em um resumo executivo de Plano de Recuperação de Áreas Degradadas (PRAD) pronto para ser exportado.`;
              } else {
                systemPrompt += `\nVocê é o assistente jurídico e ambiental GemmaGuardian.
Responda em tom profissional, citando a legislação ambiental brasileira aplicável (Código Florestal Lei 12.651/2012, Instruções Normativas do ICMBio) e soluções práticas de PRAD.`;
              }

              const fullPrompt = `${systemPrompt}

Dados da Propriedade em Análise em Tempo Real:
${JSON.stringify(propertyInfo || {}, null, 2)}

Instrução/Pergunta do Usuário:
${prompt || 'Realize a análise detalhada dos dados reais da propriedade fornecida.'}`;

              const response = await ai.models.generateContent({
                model: 'gemini-3.6-flash',
                contents: fullPrompt,
              });

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text: response.text }));
            } catch (err: any) {
              console.error('Erro na API Gemini Server:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: err.message || 'Erro ao processar consulta no servidor.',
                })
              );
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method Not Allowed');
        }
      };

      server.middlewares.use('/api/gemini/analyze', handleGemmaAnalyze);
      server.middlewares.use('/api/gemma/analyze', handleGemmaAnalyze);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
