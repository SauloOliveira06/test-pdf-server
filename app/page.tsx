"use client";
import { useState } from "react";
import { IRelatorioCDT } from "./types/debito";

const data: IRelatorioCDT = {
  numeroProtocolo: "123456789",
  codigoAutenticidade: "XYZ-987654",
  dataEmissao: "2025-03-31",
  dataValidade: "2025-06-30",
  situacao: "Regular",
  identificacao: "12345678000195",
  nomeIdentificacao: "Empresa Exemplo LTDA",
  debitos: [
    {
      sujeitoPassivo: "12345678000195",
      tipoDebito: "ICMS",
      tipoIdentificador: "CNPJ",
      numeroIdentificador: "12345678000195",
      periodoReferencia: "2024-01",
      detalhe: "Débito referente ao período de janeiro/2024"
    }
  ]
};


export default function GerarPDF() {
  const [loading, setLoading] = useState(false);

  const handleGeneratePDF = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/download-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error("Erro ao gerar o PDF");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <button 
        onClick={handleGeneratePDF} 
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50" 
        disabled={loading}
      >
        {loading ? "Gerando..." : "Gerar PDF"}
      </button>
    </div>
  );
}
