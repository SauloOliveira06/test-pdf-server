"use server";
export async function gerarTabelaDebitos(debitos: IDebitoCDT[]): Promise<string> {
  let tabelaHTML = "";

  const gruposPorCNPJ: Record<string, IDebitoCDT[]> = debitos.reduce<
    Record<string, IDebitoCDT[]>
  >((acc, debito) => {
    if (!acc[debito.sujeitoPassivo]) {
      acc[debito.sujeitoPassivo] = [];
    }
    acc[debito.sujeitoPassivo].push(debito);
    return acc;
  }, {});

  for (const cnpj in gruposPorCNPJ) {
    tabelaHTML += `
          <table>
              <thead>
                  <tr>
                      <th scope="col" colspan="3" class="filial">CNPJ ${cnpj}</th>
                  </tr>
              </thead>
              <tbody>`;

    const gruposPorTipoDebito: Record<string, any[]> = gruposPorCNPJ[
      cnpj
    ].reduce<Record<string, IDebitoCDT[]>>((acc, debito) => {
      if (!acc[debito.tipoDebito]) {
        acc[debito.tipoDebito] = [];
      }
      acc[debito.tipoDebito].push(debito);
      return acc;
    }, {});

    for (const tipo in gruposPorTipoDebito) {
      const primeiroDebito = gruposPorTipoDebito[tipo][0];
      const tipoIdentificador =
        primeiroDebito?.tipoIdentificador ?? "Tipo Identificador";

      tabelaHTML += `
        <tr class="tipo-debito"><th scope="col" style="text-align: center;" colspan="4">${tipo}</th></tr>
        <tr>
            <th scope="col">${tipoIdentificador}</th>
            <th scope="col">Período</th>
            <th scope="col">Detalhes</th>
        </tr>`;

      gruposPorTipoDebito[tipo].forEach((debito) => {
        tabelaHTML += `
                  <tr>
                      <td>${debito.numeroIdentificador ?? "-"}</td>
                      <td>${debito.periodoReferencia ?? "-"}</td>
                      <td>${debito.detalhe ?? "-"}</td>
                  </tr>`;
      });
    }

    tabelaHTML += `</tbody></table>`;
  }

  return tabelaHTML;
}
 