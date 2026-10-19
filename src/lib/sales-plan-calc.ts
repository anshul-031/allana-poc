/**
 * Sales Plan & Forecasting Calculation Engine
 * Calculates Target, Rollover/Last Month Transfer, Shipped, Pipeline, and Delta
 * with multi-tier rollups and UOM formatting.
 */

export type UnitOfMeasureType = 'TONNES' | 'USD';

export interface SkuPlanItem {
  id: string;
  sku: string;
  skuName: string;
  targetTonnes: number;
  targetUsd: number;
  lastMonthBalanceTonnes: number;
  lastMonthBalanceUsd: number;
  shippedTonnes: number;
  shippedUsd: number;
  pipelineTonnes: number;
  pipelineUsd: number;
  deltaTonnes: number;
  deltaUsd: number;
  statusTonnes: 'SURPLUS' | 'DEFICIT';
  statusUsd: 'SURPLUS' | 'DEFICIT';
}

export interface ShipToGroup {
  shipToParty: string;
  items: SkuPlanItem[];
  totals: {
    targetTonnes: number;
    targetUsd: number;
    lastMonthBalanceTonnes: number;
    lastMonthBalanceUsd: number;
    shippedTonnes: number;
    shippedUsd: number;
    pipelineTonnes: number;
    pipelineUsd: number;
    deltaTonnes: number;
    deltaUsd: number;
    statusTonnes: 'SURPLUS' | 'DEFICIT';
    statusUsd: 'SURPLUS' | 'DEFICIT';
  };
}

export interface CountryGroup {
  country: string;
  shipToGroups: ShipToGroup[];
  totals: {
    targetTonnes: number;
    targetUsd: number;
    lastMonthBalanceTonnes: number;
    lastMonthBalanceUsd: number;
    shippedTonnes: number;
    shippedUsd: number;
    pipelineTonnes: number;
    pipelineUsd: number;
    deltaTonnes: number;
    deltaUsd: number;
    statusTonnes: 'SURPLUS' | 'DEFICIT';
    statusUsd: 'SURPLUS' | 'DEFICIT';
    totalSkus: number;
  };
}

export interface SalesPlanSummary {
  countries: CountryGroup[];
  grandTotal: {
    targetTonnes: number;
    targetUsd: number;
    lastMonthBalanceTonnes: number;
    lastMonthBalanceUsd: number;
    shippedTonnes: number;
    shippedUsd: number;
    pipelineTonnes: number;
    pipelineUsd: number;
    deltaTonnes: number;
    deltaUsd: number;
    statusTonnes: 'SURPLUS' | 'DEFICIT';
    statusUsd: 'SURPLUS' | 'DEFICIT';
    totalCountries: number;
    totalShipToParties: number;
    totalSkus: number;
  };
}

/**
 * Calculates Delta = (Shipped + Pipeline) - Target
 */
export function calculateDelta(shipped: number, pipeline: number, target: number): number {
  const result = shipped + pipeline - target;
  // Round to 2 decimal places to avoid IEEE 754 precision issues
  return Math.round(result * 100) / 100;
}

/**
 * Determines surplus or deficit status based on delta
 */
export function determineStatus(delta: number): 'SURPLUS' | 'DEFICIT' {
  return delta >= 0 ? 'SURPLUS' : 'DEFICIT';
}

/**
 * Formats value according to Unit of Measure (Tonnes vs USD)
 */
export function formatMetricValue(value: number, uom: UnitOfMeasureType, isDelta = false): string {
  const absValue = Math.abs(value);
  const prefix = isDelta ? (value >= 0 ? '+' : '-') : value < 0 ? '-' : '';

  if (uom === 'USD') {
    const formattedNum = absValue.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${prefix}$${formattedNum}`;
  }

  // TONNES: 2 decimal places with MT suffix
  const formattedNum = absValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${prefix}${formattedNum} MT`;
}

/**
 * Builds and aggregates SkuPlanItem with calculated deltas and statuses
 */
export function createSkuPlanItem(input: {
  id: string;
  sku: string;
  skuName: string;
  targetTonnes: number;
  targetUsd: number;
  lastMonthBalanceTonnes?: number;
  lastMonthBalanceUsd?: number;
  shippedTonnes: number;
  shippedUsd: number;
  pipelineTonnes: number;
  pipelineUsd: number;
}): SkuPlanItem {
  const lastMonthTonnes = input.lastMonthBalanceTonnes ?? 0;
  const lastMonthUsd = input.lastMonthBalanceUsd ?? 0;

  const deltaTonnes = calculateDelta(input.shippedTonnes, input.pipelineTonnes, input.targetTonnes);
  const deltaUsd = calculateDelta(input.shippedUsd, input.pipelineUsd, input.targetUsd);

  return {
    id: input.id,
    sku: input.sku,
    skuName: input.skuName,
    targetTonnes: input.targetTonnes,
    targetUsd: input.targetUsd,
    lastMonthBalanceTonnes: lastMonthTonnes,
    lastMonthBalanceUsd: lastMonthUsd,
    shippedTonnes: input.shippedTonnes,
    shippedUsd: input.shippedUsd,
    pipelineTonnes: input.pipelineTonnes,
    pipelineUsd: input.pipelineUsd,
    deltaTonnes,
    deltaUsd,
    statusTonnes: determineStatus(deltaTonnes),
    statusUsd: determineStatus(deltaUsd),
  };
}

/**
 * Aggregates raw items into Country -> ShipTo -> SKU hierarchical summary
 */
export function aggregateSalesPlan(
  rawRecords: Array<{
    id: string;
    country: string;
    shipToParty: string;
    sku: string;
    skuName: string;
    targetTonnes: number;
    targetUsd: number;
    lastMonthBalanceTonnes?: number;
    lastMonthBalanceUsd?: number;
    shippedTonnes: number;
    shippedUsd: number;
    pipelineTonnes: number;
    pipelineUsd: number;
  }>
): SalesPlanSummary {
  // Map country -> shipTo -> items
  const countryMap = new Map<string, Map<string, SkuPlanItem[]>>();

  for (const record of rawRecords) {
    if (!countryMap.has(record.country)) {
      countryMap.set(record.country, new Map());
    }
    const shipToMap = countryMap.get(record.country)!;
    if (!shipToMap.has(record.shipToParty)) {
      shipToMap.set(record.shipToParty, []);
    }

    const item = createSkuPlanItem(record);
    shipToMap.get(record.shipToParty)!.push(item);
  }

  const countries: CountryGroup[] = [];

  let grandTargetTonnes = 0;
  let grandTargetUsd = 0;
  let grandLastMonthTonnes = 0;
  let grandLastMonthUsd = 0;
  let grandShippedTonnes = 0;
  let grandShippedUsd = 0;
  let grandPipelineTonnes = 0;
  let grandPipelineUsd = 0;
  let totalShipToPartiesCount = 0;
  let totalSkusCount = 0;

  for (const [countryName, shipToMap] of countryMap.entries()) {
    const shipToGroups: ShipToGroup[] = [];

    let countryTargetTonnes = 0;
    let countryTargetUsd = 0;
    let countryLastMonthTonnes = 0;
    let countryLastMonthUsd = 0;
    let countryShippedTonnes = 0;
    let countryShippedUsd = 0;
    let countryPipelineTonnes = 0;
    let countryPipelineUsd = 0;
    let countrySkusCount = 0;

    for (const [shipToPartyName, items] of shipToMap.entries()) {
      let shipTargetTonnes = 0;
      let shipTargetUsd = 0;
      let shipLastMonthTonnes = 0;
      let shipLastMonthUsd = 0;
      let shipShippedTonnes = 0;
      let shipShippedUsd = 0;
      let shipPipelineTonnes = 0;
      let shipPipelineUsd = 0;

      for (const item of items) {
        shipTargetTonnes += item.targetTonnes;
        shipTargetUsd += item.targetUsd;
        shipLastMonthTonnes += item.lastMonthBalanceTonnes;
        shipLastMonthUsd += item.lastMonthBalanceUsd;
        shipShippedTonnes += item.shippedTonnes;
        shipShippedUsd += item.shippedUsd;
        shipPipelineTonnes += item.pipelineTonnes;
        shipPipelineUsd += item.pipelineUsd;
      }

      const shipDeltaTonnes = calculateDelta(shipShippedTonnes, shipPipelineTonnes, shipTargetTonnes);
      const shipDeltaUsd = calculateDelta(shipShippedUsd, shipPipelineUsd, shipTargetUsd);

      shipToGroups.push({
        shipToParty: shipToPartyName,
        items,
        totals: {
          targetTonnes: Math.round(shipTargetTonnes * 100) / 100,
          targetUsd: Math.round(shipTargetUsd * 100) / 100,
          lastMonthBalanceTonnes: Math.round(shipLastMonthTonnes * 100) / 100,
          lastMonthBalanceUsd: Math.round(shipLastMonthUsd * 100) / 100,
          shippedTonnes: Math.round(shipShippedTonnes * 100) / 100,
          shippedUsd: Math.round(shipShippedUsd * 100) / 100,
          pipelineTonnes: Math.round(shipPipelineTonnes * 100) / 100,
          pipelineUsd: Math.round(shipPipelineUsd * 100) / 100,
          deltaTonnes: shipDeltaTonnes,
          deltaUsd: shipDeltaUsd,
          statusTonnes: determineStatus(shipDeltaTonnes),
          statusUsd: determineStatus(shipDeltaUsd),
        },
      });

      countryTargetTonnes += shipTargetTonnes;
      countryTargetUsd += shipTargetUsd;
      countryLastMonthTonnes += shipLastMonthTonnes;
      countryLastMonthUsd += shipLastMonthUsd;
      countryShippedTonnes += shipShippedTonnes;
      countryShippedUsd += shipShippedUsd;
      countryPipelineTonnes += shipPipelineTonnes;
      countryPipelineUsd += shipPipelineUsd;
      countrySkusCount += items.length;
      totalShipToPartiesCount += 1;
    }

    const countryDeltaTonnes = calculateDelta(countryShippedTonnes, countryPipelineTonnes, countryTargetTonnes);
    const countryDeltaUsd = calculateDelta(countryShippedUsd, countryPipelineUsd, countryTargetUsd);

    countries.push({
      country: countryName,
      shipToGroups,
      totals: {
        targetTonnes: Math.round(countryTargetTonnes * 100) / 100,
        targetUsd: Math.round(countryTargetUsd * 100) / 100,
        lastMonthBalanceTonnes: Math.round(countryLastMonthTonnes * 100) / 100,
        lastMonthBalanceUsd: Math.round(countryLastMonthUsd * 100) / 100,
        shippedTonnes: Math.round(countryShippedTonnes * 100) / 100,
        shippedUsd: Math.round(countryShippedUsd * 100) / 100,
        pipelineTonnes: Math.round(countryPipelineTonnes * 100) / 100,
        pipelineUsd: Math.round(countryPipelineUsd * 100) / 100,
        deltaTonnes: countryDeltaTonnes,
        deltaUsd: countryDeltaUsd,
        statusTonnes: determineStatus(countryDeltaTonnes),
        statusUsd: determineStatus(countryDeltaUsd),
        totalSkus: countrySkusCount,
      },
    });

    grandTargetTonnes += countryTargetTonnes;
    grandTargetUsd += countryTargetUsd;
    grandLastMonthTonnes += countryLastMonthTonnes;
    grandLastMonthUsd += countryLastMonthUsd;
    grandShippedTonnes += countryShippedTonnes;
    grandShippedUsd += countryShippedUsd;
    grandPipelineTonnes += countryPipelineTonnes;
    grandPipelineUsd += countryPipelineUsd;
    totalSkusCount += countrySkusCount;
  }

  const grandDeltaTonnes = calculateDelta(grandShippedTonnes, grandPipelineTonnes, grandTargetTonnes);
  const grandDeltaUsd = calculateDelta(grandShippedUsd, grandPipelineUsd, grandTargetUsd);

  return {
    countries,
    grandTotal: {
      targetTonnes: Math.round(grandTargetTonnes * 100) / 100,
      targetUsd: Math.round(grandTargetUsd * 100) / 100,
      lastMonthBalanceTonnes: Math.round(grandLastMonthTonnes * 100) / 100,
      lastMonthBalanceUsd: Math.round(grandLastMonthUsd * 100) / 100,
      shippedTonnes: Math.round(grandShippedTonnes * 100) / 100,
      shippedUsd: Math.round(grandShippedUsd * 100) / 100,
      pipelineTonnes: Math.round(grandPipelineTonnes * 100) / 100,
      pipelineUsd: Math.round(grandPipelineUsd * 100) / 100,
      deltaTonnes: grandDeltaTonnes,
      deltaUsd: grandDeltaUsd,
      statusTonnes: determineStatus(grandDeltaTonnes),
      statusUsd: determineStatus(grandDeltaUsd),
      totalCountries: countries.length,
      totalShipToParties: totalShipToPartiesCount,
      totalSkus: totalSkusCount,
    },
  };
}
