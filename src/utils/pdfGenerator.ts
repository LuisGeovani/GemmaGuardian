import { jsPDF } from 'jspdf';
import { Property, PradProposal } from '../types';
import { AMAZON_NATIVE_SPECIES } from '../data/mockData';

export const generatePradPdf = async (property: Property, proposal: PradProposal) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const totalSeedlings = Math.round(property.recoveryGapHa * 400);
  const totalCostEstimate = property.recoveryGapHa * 4000;
  const carbonTonsPerYear = Math.round(property.recoveryGapHa * 12);
  const currentDate = new Date().toLocaleDateString('pt-BR');

  // Load Logo as PNG Data URL for jsPDF
  const getLogoDataUrl = (): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 600;
          canvas.height = 240;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, 600, 240);
            resolve(canvas.toDataURL('image/png'));
            return;
          }
        } catch (e) {
          console.warn('Canvas export failed', e);
        }
        resolve(null);
      };
      img.onerror = () => resolve(null);
      img.src = '/gemma_guardian_full_logo.svg';
    });
  };

  const logoDataUrl = await getLogoDataUrl();

  // --- PAGE 1 HEADER ---
  // Header background bar (Emerald)
  doc.setFillColor(6, 78, 59); // emerald-900
  doc.rect(0, 0, 210, 32, 'F');

  // Header accent line
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 32, 210, 2, 'F');

  // Draw Official GemmaGuardian Logo in PDF Header (Right Side)
  if (logoDataUrl) {
    const logoW = 45;
    const logoH = 18;
    const logoX = 210 - logoW - 12; // 153mm
    const logoY = 7;
    doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoW, logoH);
  }

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('RECOMENDAÇÃO PRELIMINAR DE PRAD (ESTIMATIVA)', 15, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(209, 250, 229); // emerald-100
  doc.text(`GemmaGuardian • Agentes Gemma 2 (Green AI / Edge) (${currentDate})`, 15, 23);

  let y = 40;

  // --- PRELIMINARY DISCLAIMER BOX ---
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.roundedRect(15, y, 180, 16, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14); // amber-800
  doc.text('AVISO DE CARÁTER INFORMATIVO E RECOMENDATÓRIO:', 18, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 53, 15);
  const disclaimerText = 'Estes cálculos e plano de plantio foram gerados via Agentes Gemma 2 para orientação do produtor. Não possuem valor de laudo nem substituem a contratação de Engenheiro Florestal para emissão de ART oficial.';
  const splitDisc = doc.splitTextToSize(disclaimerText, 174);
  doc.text(splitDisc, 18, y + 9.5);

  y += 20;

  // --- EXECUTIVE SUMMARY BOX ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(15, y, 180, 28, 3, 3, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('ÁREA P/ RECOMPOSIÇÃO', 20, y + 8);
  doc.text('MUDAS REQUERIDAS', 65, y + 8);
  doc.text('INVESTIMENTO ESTIMADO', 115, y + 8);
  doc.text('SEQUESTRO DE CARBONO', 160, y + 8);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(`${property.recoveryGapHa.toFixed(2)} ha`, 20, y + 18);

  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text(`${totalSeedlings.toLocaleString('pt-BR')} mudas`, 65, y + 18);

  doc.setTextColor(15, 23, 42);
  doc.text(`R$ ${totalCostEstimate.toLocaleString('pt-BR')}`, 115, y + 18);

  doc.setTextColor(4, 120, 87); // emerald-700
  doc.text(`${carbonTonsPerYear} t.CO²/ano`, 160, y + 18);

  y += 36;

  // --- SECTION 1: PROPERTY IDENTIFICATION ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59); // emerald-900
  doc.text('1. DADOS DO IMÓVEL RURAL E EMBARGO AMBIENTAL', 15, y);
  doc.setLineWidth(0.4);
  doc.setDrawColor(16, 185, 129);
  doc.line(15, y + 2, 195, y + 2);

  y += 8;

  // Property Table Grid - Clean 2-column layout with auto-wrapping
  const gridX1 = 20;
  const gridWidth1 = 82;
  const gridX2 = 108;
  const gridWidth2 = 82;

  const propRows = [
    [
      { label: 'Nome do Imóvel:', value: property.name },
      { label: 'Código Shapefile/CAR:', value: property.shapefileCode },
    ],
    [
      { label: 'Município / Estado:', value: `${property.municipality} - ${property.state}` },
      { label: 'Área Total:', value: `${property.totalAreaHa} ha` },
    ],
    [
      { label: 'Cobertura Florestal:', value: `${property.forestCoverHa} ha` },
      { label: 'Déficit R. Legal (PRAD):', value: `${property.recoveryGapHa} ha` },
    ],
    [
      { label: 'Status do Embargo:', value: property.embargoStatus.hasEmbargo ? `ATIVO (${property.embargoStatus.embargoId})` : 'REGULARIZADO' },
      { label: 'Órgão Autuador:', value: property.embargoStatus.organ },
    ],
    [
      { label: 'Coordenadas Ref.:', value: `Lat: ${property.coordinates.lat}, Lng: ${property.coordinates.lng}` },
      { label: 'Sistema de Ref. (CRS):', value: property.coordinates.crs },
    ],
  ];

  let rowY = y + 5;
  const rowPositions: {
    item1: { label: string; valX: number; splitVal: string[] };
    item2: { label: string; valX: number; splitVal: string[] };
    lineY: number;
    rowH: number;
  }[] = [];

  doc.setFontSize(8.5);

  propRows.forEach((row) => {
    // Col 1
    const label1 = row[0].label;
    const val1 = row[0].value;
    doc.setFont('helvetica', 'bold');
    const label1W = doc.getTextWidth(label1 + ' ');
    const maxVal1W = Math.max(20, gridWidth1 - label1W);
    doc.setFont('helvetica', 'normal');
    const splitVal1 = doc.splitTextToSize(val1, maxVal1W);

    // Col 2
    const label2 = row[1].label;
    const val2 = row[1].value;
    doc.setFont('helvetica', 'bold');
    const label2W = doc.getTextWidth(label2 + ' ');
    const maxVal2W = Math.max(20, gridWidth2 - label2W);
    doc.setFont('helvetica', 'normal');
    const splitVal2 = doc.splitTextToSize(val2, maxVal2W);

    const rowH = Math.max(5, Math.max(splitVal1.length, splitVal2.length) * 4.2);

    rowPositions.push({
      item1: { label: label1, valX: gridX1 + label1W, splitVal: splitVal1 },
      item2: { label: label2, valX: gridX2 + label2W, splitVal: splitVal2 },
      lineY: rowY,
      rowH,
    });

    rowY += rowH + 1.5;
  });

  const totalGridHeight = rowY - y + 2;

  // Draw background box
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(15, y, 180, totalGridHeight, 2, 2, 'F');

  // Render text items inside box
  rowPositions.forEach((rp) => {
    doc.setFontSize(8.5);

    // Col 1 label
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(rp.item1.label, gridX1, rp.lineY);

    // Col 1 value
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(rp.item1.splitVal, rp.item1.valX, rp.lineY);

    // Col 2 label
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(rp.item2.label, gridX2, rp.lineY);

    // Col 2 value
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(rp.item2.splitVal, rp.item2.valX, rp.lineY);
  });

  y += totalGridHeight + 8;

  // --- SECTION 2: SPECIES SELECTION & PLANTING MODEL ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text('2. PLANO TÉCNICO DE PLANTIO E ESPÉCIES NATIVAS', 15, y);
  doc.line(15, y + 2, 195, y + 2);

  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const textDesc = `Recomposição vegetal com densidade de 400 mudas/ha adotando o Método Anderson de Ilhas de Nucleação (5m x 5m). O modelo consorcia essências de crescimento rápido com espécies nobres clímax da Bacia do Acre:`;
  const splitDesc = doc.splitTextToSize(textDesc, 180);
  doc.text(splitDesc, 15, y);

  y += splitDesc.length * 4.5 + 4;

  // Species Table Headers
  doc.setFillColor(6, 78, 59);
  doc.rect(15, y, 180, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Espécie Popular', 18, y + 5);
  doc.text('Nome Científico', 65, y + 5);
  doc.text('Grupo Ecológico', 115, y + 5);
  doc.text('Crescimento', 155, y + 5);
  doc.text('Qtd. Mudas', 178, y + 5);

  y += 7;

  AMAZON_NATIVE_SPECIES.forEach((species, index) => {
    const count = Math.round((property.recoveryGapHa * 400) / AMAZON_NATIVE_SPECIES.length);
    if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(15, y, 180, 6.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(species.popularName, 18, y + 4.5);

    doc.setFont('helvetica', 'italic');
    doc.setTextColor(71, 85, 105);
    doc.text(species.scientificName, 65, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(species.ecologicalGroup, 115, y + 4.5);
    doc.text(species.growthRate, 155, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text(`${count}`, 178, y + 4.5);

    y += 6.5;
  });

  y += 8;

  // --- SECTION 3: PHYSICAL & FINANCIAL TIMELINE ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text('3. CRONOGRAMA FÍSICO-FINANCEIRO DE IMPLANTAÇÃO', 15, y);
  doc.line(15, y + 2, 195, y + 2);

  y += 8;

  const cronograma = [
    {
      fase: 'Fase 01 (Mês 01 a 03)',
      desc: 'Isolamento de perímetro com cercamento, adubação verde e preparo das covas.',
      valor: `R$ ${(totalCostEstimate * 0.25).toLocaleString('pt-BR')}`,
    },
    {
      fase: 'Fase 02 (Mês 04 a 06)',
      desc: `Plantio das ${totalSeedlings.toLocaleString('pt-BR')} mudas nativas com tutoramento e hidrogel.`,
      valor: `R$ ${(totalCostEstimate * 0.5).toLocaleString('pt-BR')}`,
    },
    {
      fase: 'Fase 03 (Mês 07 a 36)',
      desc: 'Manutenção periódica, roçada seletiva, combate a formigas e replantio de falhas.',
      valor: `R$ ${(totalCostEstimate * 0.25).toLocaleString('pt-BR')}`,
    },
  ];

  cronograma.forEach((item) => {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(15, y, 180, 12, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(item.fase, 18, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const splitDesc = doc.splitTextToSize(item.desc, 138);
    doc.text(splitDesc, 18, y + 9.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(5, 150, 105);
    doc.text(item.valor, 162, y + 7);

    y += 14;
  });

  // --- LEGAL NOTICE BOX (Replaces Signature Block) ---
  y += 4;
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.roundedRect(15, y, 180, 16, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('OBSERVAÇÃO SOBRE A RECOMENDAÇÃO PRELIMINAR:', 18, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // slate-600
  const legalNote = 'Por se tratar de uma proposta preliminar de planejamento socioambiental, este documento não contém nem requer assinaturas formais. Para a submissão aos órgãos ambientais estaduais/federais, consulte um Engenheiro Florestal habilitado.';
  const splitLegal = doc.splitTextToSize(legalNote, 174);
  doc.text(splitLegal, 18, y + 9.5);

  // Footer seal
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text(`Documento gerado pelos Agentes Gemma 2 - Amazon Eco-Hack UFAC 2026 (ID: PRAD-${property.id.toUpperCase()})`, 15, 288);

  // Save the PDF
  const filename = `PRAD_Relatorio_${property.shapefileCode.replace('.SHP', '')}.pdf`;
  doc.save(filename);
};
