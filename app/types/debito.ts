export interface Debito {
  sujeitoPassivo: string;
  tipoDebito: string;
  tipoIdentificador: string;
  numeroIdentificador: string;
  periodoReferencia: string;
  detalhe: string;
}

export interface IRelatorioCDT {
  numeroProtocolo: string;
  codigoAutenticidade: string;
  dataEmissao: string;
  dataValidade: string;
  situacao: string;
  identificacao: string;
  nomeIdentificacao: string;
  debitos: Debito[];
}
