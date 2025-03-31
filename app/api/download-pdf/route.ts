import { NextResponse } from "next/server";
import fs from "fs";

import { gerarTabelaDebitos } from "./geradorTabela";
import path from "path";
import { chromium } from "playwright-core";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data) {
      return new NextResponse(
        JSON.stringify({ error: "Dados inválidos para gerar o PDF" }),
        { status: 400 }
      );
    }

    const templatePath = path.join(
      process.cwd(),
      "public",
      "template-pdf",
      "CDT.html"
    );
    let html = fs.readFileSync(templatePath, "utf8");

    const cssPath = path.join(
      process.cwd(),
      "public",
      "template-pdf",
      "CDT.css"
    );
    const css = fs.readFileSync(cssPath, "utf8");

    html = html.replace("</head>", `<style>${css}</style></head>`);

    const tabelaDebitosHTML = await gerarTabelaDebitos(data.debitos);

    const formatIdentification = (value: string) => {
      if (value.length === 14) {
        return value;
      }
      if (value.length === 11) {
        return value;
      }
      return value;
    };

    html = html
      .replace(/{{situacao}}/g, data.situacao)
      .replace(/{{dataEmissao}}/g, data.dataEmissao)
      .replace(/{{dataValidade}}/g, data.dataValidade)
      .replace(/{{identificacao}}/g, formatIdentification(data.identificacao))
      .replace(/{{codigoAutenticidade}}/g, data.codigoAutenticidade)
      .replace(/{{nomeIdentificacao}}/g, data.nomeIdentificacao ?? "")
      .replace(/{{sujeitoPassivo}}/g, data.sujeitoPassivo)
      .replace(/{{tipoIdentificador}}/g, data.tipoIdentificador)
      .replace("{{tabelaDebitos}}", tabelaDebitosHTML);

    const browser = await chromium.launch({
      executablePath: require("playwright").chromium.executablePath(),
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle" });

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

    await browser.close();

    console.log("Recebendo dados:", data);
    console.log("Lendo template:", templatePath);
    console.log("Lendo CSS:", cssPath);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="relatorio.pdf"',
      },
    });
  } catch (error) {
    console.error("Erro ao gerar o PDF:", error);
    return new NextResponse(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500 }
    );
  }
}
