<p align="center">
  <img src="public/gemma_guardian_full_logo.svg" alt="GemmaGuardian Logo" width="480" />
</p>

# 🌲 GemmaGuardian — IA Verde & Agentes Gemma para Preservação da Amazônia

> **Projeto desenvolvido para o hackathon *Build with Gemma: Amazon Eco-Hack***  
> **Sede:** Universidade Federal do Acre (UFAC) — Rio Branco, Acre  
> **Foco:** Inteligência Artificial de Borda (Edge AI), Gestão Florestal Sustentável, Análise GIS e Emissão de PRAD para a Amazônia Legal.

---

## 📌 Visão Geral do Projeto

O **GemmaGuardian** é uma plataforma geointeligente e multiagente projetada para acelerar o processo de regularização ambiental e restauração florestal em áreas degradadas ou embargadas da Amazônia Legal — com foco especial nas Reservas Extrativistas e propriedades rurais do Estado do Acre (como a **RESEX Chico Mendes** em Xapuri).

Utilizando a família de modelos abertos **Google Gemma 2** (Gemma 2B, 9B e 27B), o sistema orquestra **4 agentes especializados de IA Verde** capazes de rodar em ambientes de computação de borda (*Edge Computing*) com conectividade limitada, promovendo o cumprimento do **Código Florestal Brasileiro (Lei nº 12.651/2012)** e a reintegração de produtores à economia sustentável.

---

## 🚀 Principais Funcionalidades

1. **🗺️ Visualizador GIS & Processamento de Polígonos (Shapefiles)**
   - Leitura de terrenos em formato Shapefile (`.SHP`) com projeção de coordenadas **SIRGAS 2000 (EPSG:4674)** e UTM Fuso 19S.
   - Análise espacial interativa com camadas de sobreposição de vegetação, hidrografia, RL (Reserva Legal) e APPs (Áreas de Preservação Permanente).

2. **🛡️ Integração WFS Oficial do ICMBio / INDE (Consulta de Embargos em Tempo Real)**
   - Conexão direta via protocolo GeoServer WFS com o repositório público do **ICMBio / INDE**.
   - Busca por CPF, CNPJ, nome do autuado ou Unidade de Conservação.
   - Importação e exportação de bases de dados locais em CSV para operação 100% offline em áreas remotas da floresta.

3. **👁️ Módulo de Visão Computacional (Análise de Cobertura de Copas)**
   - Processamento de imagens de satélite/drone para estimativa percentual de densidade de dosseis e mapeamento de clareiras em áreas degradadas.

4. **⚖️ Agente Jurídico Florestal com RAG (Gemma 2 9B)**
   - Análise de conformidade legal baseada na regra de 80% de Reserva Legal para a Amazônia Legal (Artigo 12 do Código Florestal).
   - Emissão de veredito automático sobre embargos ativos (#101), multas e diretrizes de celebração de TAC (Termo de Ajustamento de Conduta).
   - Assistente conversacional jurídico em tempo real via backend `/api/gemma/analyze`.

5. **🌱 Agente Ecólogo & Gerador de PRAD (Gemma 2 27B)**
   - Elaboração automatizada do **Plano de Recuperação de Áreas Degradadas (PRAD)** com base na metodologia de **Nucleação de Anderson**.
   - Seleção inteligente de espécies nativas adaptadas à Bacia Florestal do Acre (ex: *Castanheira, Mogno, Andiroba, Açaí, Samaúma, Copaíba*).
   - Cronograma detalhado de 3 anos de plantio, cálculo de orçamento estimado (R$/ha e R$/muda) e estimativa de captura de CO₂ (toneladas/ano).

6. **📄 Exportador Oficial de PRAD em PDF & GeoJSON**
   - Emissão de laudo técnico formatado para submissão nos órgãos ambientais (IMAC / IBAMA / ICMBio).
   - Exportação do polígono ajustado em formato GeoJSON para cadastramento no CAR.

---

## 🤖 Arquitetura Multiagente Gemma 2

O GemmaGuardian divide a complexidade da análise ambiental em quatro agentes especializados, otimizados para operar em arquitetura distribuída e leve (*Green AI*):

| Agente | Modelo Utilizado | Papel & Responsabilidade |
| :--- | :--- | :--- |
| **1. Analista GIS** | `Gemma 2B IT` (Edge) | Leitura de shapefiles, transformação de CRS EPSG:4674 e processamento leve de visão computacional. |
| **2. Jurídico Florestal** | `Gemma 2 9B IT` (RAG) | Cruzamento de dados com bases WFS do ICMBio/IBAMA e RAG jurídico no Código Florestal (Lei 12.651/12). |
| **3. Ecólogo de Restauração** | `Gemma 2 27B IT` (Bio) | Modelagem biogeográfica, seleção de mudas nativas do Acre e cálculo de densidade de plantio. |
| **4. Síntese Multimodal** | `Gemma Multimodal` | Compilação do veredito final, geração da proposta de PRAD e formatação dos relatórios executivos. |

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide React, Motion, Leaflet.js (GIS Web).
- **Backend Service:** Node.js, Express.js, `esbuild`, `tsx`.
- **Inteligência Artificial:** SDK `@google/genai` configurado para a família de modelos **Google Gemma 2**.
- **Geoprocessamento & PDF:** Leaflet CRS EPSG:4674, `jspdf`, `jspdf-autotable`, HTML5 Canvas API para Visão Computacional.

---

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou bun

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/usuario/gemma-guardian.git
   cd gemma-guardian
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente:**
   Crie um arquivo `.env` baseado no `.env.example`:
   ```env
   GEMINI_API_KEY=sua_chave_de_api_aqui
   ```

4. **Iniciar o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   A aplicação estará acessível em `http://localhost:3000`.

5. **Gerar Build de Produção:**
   ```bash
   npm run build
   npm start
   ```

---

## 📜 Licença e Créditos

Desenvolvido com orgulho para o **Build with Gemma: Amazon Eco-Hack 2026** — Universidade Federal do Acre (UFAC).  
*Tecnologia de ponta a serviço da preservação da floresta amazônica e das comunidades tradicionais.*
