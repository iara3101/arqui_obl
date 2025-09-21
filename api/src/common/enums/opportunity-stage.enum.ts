export enum OpportunityStage {
  PREPARACION = 'PREPARACION',
  PRESENTACION = 'PRESENTACION',
  NEGOCIACION = 'NEGOCIACION',
  VENTA = 'VENTA',
  NO_VENTA = 'NO_VENTA',
}

export const WIN_STAGES = new Set<OpportunityStage>([OpportunityStage.VENTA]);
