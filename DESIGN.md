<p align="center">
  <img src="public/gemma_guardian_full_logo.svg" alt="GemmaGuardian Logo" width="420" />
</p>

# 📐 Documento de Design de Software (SDD) — GemmaGuardian

> **Projeto:** GemmaGuardian — Plataforma Multiagente de IA Verde para Preservação Ambiental da Amazônia  
> **Hackathon:** Build with Gemma: Amazon Eco-Hack (UFAC)  
> **Versão:** 1.0.0  
> **Status:** Aprovado / Arquitetura do Sistema  

---

## 1. Diagrama de Arquitetura do Sistema

A arquitetura do **GemmaGuardian** segue o padrão de componentes modulares com camada de apresentação reativa, microsserviços de agentes de IA baseados em **Gemma 2**, e barramentos de dados desacoplados para viabilizar operação local e em áreas remotas da Amazônia.

```
+-----------------------------------------------------------------------------------+
|                                                                                   |
|                                INTERFACE DO USUÁRIO                               |
|                     (Painel GIS React / Tailwind / Leaflet)                      |
|                                                                                   |
+----------------------------------------+------------------------------------------+
                                         |
         +-------------------------------+-------------------------------+
         |                               |                               |
         v                               v                               v
+-----------------+             +-----------------+             +-----------------+
|   Módulo GIS &  |             | Agente Jurídico |             |  Agente Ecólogo |
|    Shapefiles   |<----------->|    Florestal    |<----------->|      PRAD       |
|    (Gemma 2B)   |             |   (Gemma 9B)    |             |   (Gemma 27B)   |
+--------+--------+             +--------+--------+             +--------+--------+
         ^                               ^                               ^
         |                               |                               |
         |                               |                               |
+--------+--------+             +--------+--------+             +--------+--------+      +------------------+
|   Banco de      |             |   Banco de      |             |   Banco de      |      |     MÓDULO DE    |
| Dados / Cache   |             | Dados / WFS     |             | Dados / PRAD    |----->| ANÁLISE DE DADOS |
|   Shapefile     |             |    ICMBio       |             |   Biomassa      |      |   (Visão Comp.   |
+-----------------+             +-----------------+             +-----------------+      |   & Dosseis)     |
                                                                                         +--------+---------+
                                                                                                  |
                                                                                                  v
                                                                                         +------------------+
                                                                                         |   Banco de       |
                                                                                         | Dados / Imagens  |
                                                                                         |   Satélite       |
                                                                                         +------------------+
```

---

## 2. Detalhamento dos Componentes do Sistema

### 2.1. Interface do Usuário (Presentation Layer)
- **Tecnologias:** React 18, Vite, Tailwind CSS, Lucide Icons, Leaflet GIS.
- **Função:** Fornecer um painel limpo, responsivo e intuitivo para consulta de terrenos rurais, visualização de camadas geoespaciais, interação com agentes de IA e exportação de documentos oficiais (PRAD em PDF/GeoJSON).

### 2.2. Camada de Agentes de IA (Business Logic Layer)
- **Analista GIS (Gemma 2B IT):**
  - Responsável por ler a geometria dos arquivos `.SHP` e converter o Sistema de Referência de Coordenadas (CRS) para SIRGAS 2000 (EPSG:4674).
  - Executa filtragens leves em borda com mínimo consumo de energia.
- **Agente Jurídico Florestal (Gemma 2 9B IT):**
  - Implementa RAG (Retrieval-Augmented Generation) sobre o Código Florestal Brasileiro (Lei nº 12.651/2012).
  - Cruza o CPF/CNPJ do imóvel com os registros do WFS do ICMBio/IBAMA para emitir vereditos legais.
- **Agente Ecólogo de Restauração (Gemma 2 27B IT):**
  - Calcula a densidade de plantio usando o método de Nucleação de Anderson.
  - Seleciona espécies nativas da Bacia do Acre e gera cronogramas físico-financeiros de recuperação.
- **Módulo de Análise de Dados & Visão Computacional:**
  - Analisa a densidade de copas e cobertura vegetal a partir de histogramas de imagem e detecção de clareiras em tempo real.

### 2.3. Camada de Dados e Persistência (Data Access Layer)
- **Banco de Dados / Cache Shapefile:** Armazena os polígonos geoespaciais, metadados de imóveis do Acre (ex: RESEX Chico Mendes) e geometrias WKT.
- **Banco de Dados / WFS ICMBio:** Cache local e sincronização WFS GeoServer INDE contendo registros públicos de autos de infração e termos de embargo.
- **Banco de Dados / PRAD & Biomassa:** Repositório de matrizes biogeográficas de espécies nativas, taxas de sequestro de carbono e custos regionais de mudas.
- **Banco de Dados / Imagens de Satélite:** Armazenamento de tiles e matrizes de visão computacional.

---

## 3. Fluxo de Dados

```
[Usuário] ──(Upload SHP / Consulta CPF)──> [Interface do Usuário]
                                                   │
                                       ┌───────────┴───────────┐
                                       ▼                       ▼
                           [Agente Analista GIS]    [Agente Jurídico WFS]
                                       │                       │
                                       ▼                       ▼
                           (Projeção EPSG:4674)    (Checagem Embargo #101)
                                       └───────────┬───────────┘
                                                   ▼
                                     [Agente Ecólogo de Restauração]
                                                   │
                                                   ▼
                                      (Cálculo de PRAD & Mudas)
                                                   │
                                                   ▼
                                       [Exportador PDF / GeoJSON]
```

---

## 4. Requisitos Não-Funcionais e Diretrizes de "Green AI"

1. **Eficiência de Borda (Edge Computing):**  
   O sistema foi arquitetado para executar tarefas críticas de parsing GIS e análise RAG localmente, reduzindo a dependência de conectividade constante nas áreas isoladas da Amazônia.
2. **Baixo Consumo Computacional:**  
   Uso prioritário do modelo leve **Gemma 2B** para operações frequentes de interface e geoprocessamento, reservando modelos maiores para compilações sob demanda.
3. **Resiliência e Tolerância a Falhas:**  
   Caso o serviço WFS do ICMBio esteja inacessível, o sistema utiliza o mecanismo de fallback com a base em CSV local importada, garantindo operação contínua.
4. **Segurança e Privacidade:**  
   Não há vazamento de chaves de API nem dados confidenciais do produtor rural para o lado do cliente (browser); todas as chamadas sensíveis são tratadas no servidor proxy Node.js/Express.

---

## 5. Conclusão

O design do **GemmaGuardian** alia rigor técnico em Engenharia de Software Verde a uma arquitetura modular de agentes orientada aos desafios reais da Amazônia, permitindo rápida integração, escalabilidade e alto valor prático para o hackathon **Build with Gemma: Amazon Eco-Hack (UFAC 2026)**.
