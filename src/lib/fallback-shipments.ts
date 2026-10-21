import { ShipmentDetailedDTO, ShipmentFilterOptions } from '@/server/actions/shipments.actions';

export const FALLBACK_DETAILED_SHIPMENTS: ShipmentDetailedDTO[] = [
  {
    id: 'shipment-1',
    orderNumber: 'ORD-2026-88204',
    companyId: 'comp-lulu-uae',
    salesOrgId: 'so-1010',
    salesOrgName: 'Allanasons Frozen Meat Division',
    salesOrgCode: 'SO-1010',
    shipToParty: 'LuLu Hypermarket - Al Barsha Dubai Logistics Hub',
    destinationCountry: 'United Arab Emirates',
    totalQuantityMt: 54.00,
    totalAmountUsd: 248400.00,
    status: 'IN_TRANSIT',
    shippingLine: 'Maersk Line',
    vesselName: 'Monaco Maersk',
    voyageNumber: '2642W',
    portOfLoading: 'JNPT Nhava Sheva, India',
    portOfDestination: 'Jebel Ali Port, Dubai',
    shippingDate: '2026-10-12T08:00:00.000Z',
    etd: '2026-10-14T12:00:00.000Z',
    eta: '2026-10-24T18:00:00.000Z',
    createdAt: '2026-10-10T09:30:00.000Z',
    totalContainers: 2,
    totalSkus: 2,
    containers: [
      {
        id: 'cont-1',
        containerNumber: 'MSKU7281920',
        sealNumber: 'ML-98214',
        reeferSetTemp: '-18.0°C',
        totalQuantityMt: 28.00,
        totalAmountUsd: 128800.00,
        items: [
          {
            id: 'item-1',
            productId: 'prod-buf-sil-01',
            sku: 'AL-BUF-SIL-01',
            productName: 'Frozen Boneless Buffalo Silverside',
            brand: 'Allana',
            primaryPackaging: 'Vacuum Block (IWP)',
            cutSize: '3 - 5 kg whole muscle cut',
            quantityMt: 28.00,
            amountUsd: 128800.00,
            imageUrl: 'products/images/AL-BUF-SIL-01-sample.webp',
          },
        ],
      },
      {
        id: 'cont-2',
        containerNumber: 'MSKU7281921',
        sealNumber: 'ML-98215',
        reeferSetTemp: '-18.0°C',
        totalQuantityMt: 26.00,
        totalAmountUsd: 119600.00,
        items: [
          {
            id: 'item-2',
            productId: 'prod-buf-top-02',
            sku: 'AL-BUF-TOP-02',
            productName: 'Frozen Boneless Buffalo Topside',
            brand: 'Allana',
            primaryPackaging: 'Vacuum Block (IWP)',
            cutSize: '4 - 7 kg whole muscle cut',
            quantityMt: 26.00,
            amountUsd: 119600.00,
            imageUrl: 'products/images/AL-BUF-TOP-02-sample.webp',
          },
        ],
      },
    ],
    documents: [
      {
        id: 'doc-1',
        documentType: 'BILL_OF_LADING',
        fileName: 'MAEU-BOL-2642W-88204.pdf',
        fileUrl: 'shipments/documents/MAEU-BOL-2642W-88204.pdf',
        fileSizeBytes: 245000,
        createdAt: '2026-10-14T14:00:00.000Z',
      },
      {
        id: 'doc-2',
        documentType: 'VET_CERT',
        fileName: 'VET-CERT-EIA-2026-9921.pdf',
        fileUrl: 'shipments/documents/VET-CERT-EIA-2026-9921.pdf',
        fileSizeBytes: 184000,
        createdAt: '2026-10-13T10:00:00.000Z',
      },
      {
        id: 'doc-3',
        documentType: 'HALAL_CERT',
        fileName: 'HALAL-JUH-2026-0814.pdf',
        fileUrl: 'shipments/documents/HALAL-JUH-2026-0814.pdf',
        fileSizeBytes: 165000,
        createdAt: '2026-10-13T11:00:00.000Z',
      },
    ],
  },
  {
    id: 'shipment-2',
    orderNumber: 'ORD-2026-88210',
    companyId: 'comp-lulu-uae',
    salesOrgId: 'so-1010',
    salesOrgName: 'Allanasons Frozen Meat Division',
    salesOrgCode: 'SO-1010',
    shipToParty: 'LuLu Hypermarket - Riyadh Central Distribution Center',
    destinationCountry: 'Saudi Arabia',
    totalQuantityMt: 48.00,
    totalAmountUsd: 230400.00,
    status: 'ARRIVED_PORT',
    shippingLine: 'CMA CGM',
    vesselName: 'CMA CGM Jules Verne',
    voyageNumber: '0FL71W',
    portOfLoading: 'Mundra Port, Gujarat, India',
    portOfDestination: 'Jeddah Islamic Port, Saudi Arabia',
    shippingDate: '2026-10-06T10:00:00.000Z',
    etd: '2026-10-08T16:00:00.000Z',
    eta: '2026-10-18T14:00:00.000Z',
    createdAt: '2026-10-04T11:00:00.000Z',
    totalContainers: 2,
    totalSkus: 2,
    containers: [
      {
        id: 'cont-3',
        containerNumber: 'CMAU8192033',
        sealNumber: 'CM-44019',
        reeferSetTemp: '-18.0°C',
        totalQuantityMt: 24.00,
        totalAmountUsd: 115200.00,
        items: [
          {
            id: 'item-3',
            productId: 'prod-buf-str-04',
            sku: 'AL-BUF-STR-04',
            productName: 'Frozen Buffalo Striploin (Sirloin)',
            brand: 'Allana',
            primaryPackaging: 'Vacuum Block (IWP)',
            cutSize: '2.5 - 3.5 kg',
            quantityMt: 24.00,
            amountUsd: 115200.00,
            imageUrl: 'products/images/AL-BUF-TOP-02-sample.webp',
          },
        ],
      },
    ],
    documents: [
      {
        id: 'doc-4',
        documentType: 'BILL_OF_LADING',
        fileName: 'CMA-BOL-0FL71W-88210.pdf',
        fileUrl: 'shipments/documents/CMA-BOL-0FL71W-88210.pdf',
        fileSizeBytes: 260000,
        createdAt: '2026-10-08T18:00:00.000Z',
      },
    ],
  },
  {
    id: 'shipment-3',
    orderNumber: 'ORD-2026-88195',
    companyId: 'comp-lulu-uae',
    salesOrgId: 'so-1010',
    salesOrgName: 'Allanasons Frozen Meat Division',
    salesOrgCode: 'SO-1010',
    shipToParty: 'LuLu Hypermarket - Dubai Investment Park Central Butchery',
    destinationCountry: 'United Arab Emirates',
    totalQuantityMt: 52.50,
    totalAmountUsd: 241500.00,
    status: 'CUSTOMS_CLEARED',
    shippingLine: 'Hapag-Lloyd',
    vesselName: 'Al Jmeliyah',
    voyageNumber: '2638E',
    portOfLoading: 'JNPT Nhava Sheva, India',
    portOfDestination: 'Jebel Ali Port, Dubai',
    shippingDate: '2026-09-28T09:00:00.000Z',
    etd: '2026-09-30T14:00:00.000Z',
    eta: '2026-10-09T16:00:00.000Z',
    createdAt: '2026-09-25T14:20:00.000Z',
    totalContainers: 2,
    totalSkus: 2,
    containers: [
      {
        id: 'cont-4',
        containerNumber: 'HLXU8910243',
        sealNumber: 'HL-44102',
        reeferSetTemp: '-18.0°C',
        totalQuantityMt: 26.25,
        totalAmountUsd: 120750.00,
        items: [
          {
            id: 'item-4',
            productId: 'prod-buf-ten-03',
            sku: 'AL-BUF-TEN-03',
            productName: 'Frozen Boneless Buffalo Tenderloin (Fillet)',
            brand: 'Allana',
            primaryPackaging: 'Vacuum Block (IWP)',
            cutSize: '1.5 - 2.5 kg whole muscle cut',
            quantityMt: 26.25,
            amountUsd: 120750.00,
            imageUrl: 'products/images/tenderloin-sample.webp',
          },
        ],
      },
      {
        id: 'cont-5',
        containerNumber: 'HLXU8910244',
        sealNumber: 'HL-44103',
        reeferSetTemp: '-18.0°C',
        totalQuantityMt: 26.25,
        totalAmountUsd: 120750.00,
        items: [
          {
            id: 'item-5',
            productId: 'prod-buf-rib-05',
            sku: 'AL-BUF-RIB-05',
            productName: 'Frozen Boneless Buffalo Ribeye (Cube Roll)',
            brand: 'Allana',
            primaryPackaging: 'Vacuum Block (IWP)',
            cutSize: '2.0 - 3.0 kg whole muscle cut',
            quantityMt: 26.25,
            amountUsd: 120750.00,
            imageUrl: 'products/images/ribeye-sample.webp',
          },
        ],
      },
    ],
    documents: [
      {
        id: 'doc-5',
        documentType: 'BILL_OF_LADING',
        fileName: 'HLXU-BOL-2638E-88195.pdf',
        fileUrl: 'shipments/documents/HLXU-BOL-2638E-88195.pdf',
        fileSizeBytes: 248000,
        createdAt: '2026-09-30T16:00:00.000Z',
      },
      {
        id: 'doc-6',
        documentType: 'CUSTOMS_DECLARATION',
        fileName: 'CUSTOMS-DXB-2026-99214.pdf',
        fileUrl: 'shipments/documents/CUSTOMS-DXB-2026-99214.pdf',
        fileSizeBytes: 192000,
        createdAt: '2026-10-09T18:00:00.000Z',
      },
    ],
  },
  {
    id: 'shipment-4',
    orderNumber: 'ORD-2026-88235',
    companyId: 'comp-lulu-uae',
    salesOrgId: 'so-2020',
    salesOrgName: 'Allana International FZE (JAFZA Re-Export)',
    salesOrgCode: 'SO-2020',
    shipToParty: 'LuLu International Logistics - JAFZA Cold Store Facility',
    destinationCountry: 'United Arab Emirates',
    totalQuantityMt: 26.00,
    totalAmountUsd: 132600.00,
    status: 'LOADED',
    shippingLine: 'MSC',
    vesselName: 'MSC Oscar',
    voyageNumber: 'MS2644',
    portOfLoading: 'JNPT Nhava Sheva, India',
    portOfDestination: 'Jebel Ali Port, Dubai',
    shippingDate: '2026-10-17T08:00:00.000Z',
    etd: '2026-10-19T10:00:00.000Z',
    eta: '2026-10-29T18:00:00.000Z',
    createdAt: '2026-10-15T08:00:00.000Z',
    totalContainers: 1,
    totalSkus: 1,
    containers: [
      {
        id: 'cont-6',
        containerNumber: 'MSCU7710928',
        sealNumber: 'MSC-99120',
        reeferSetTemp: '-18.0°C',
        totalQuantityMt: 26.00,
        totalAmountUsd: 132600.00,
        items: [
          {
            id: 'item-6',
            productId: 'prod-buf-flk-06',
            sku: 'AL-BUF-FLK-06',
            productName: 'Frozen Boneless Buffalo Flank',
            brand: 'Allana',
            primaryPackaging: 'Vacuum Block (IWP)',
            cutSize: 'Whole muscle cut',
            quantityMt: 26.00,
            amountUsd: 132600.00,
            imageUrl: 'products/images/flank-sample.webp',
          },
        ],
      },
    ],
    documents: [
      {
        id: 'doc-10',
        documentType: 'BILL_OF_LADING',
        fileName: 'MSCU-BOL-2644-88240.pdf',
        fileUrl: 'shipments/documents/MSCU-BOL-2644-88240.pdf',
        fileSizeBytes: 240000,
        createdAt: '2026-10-17T12:00:00.000Z',
      },
    ],
  },
  {
    id: 'shipment-5',
    orderNumber: 'ORD-2026-88250',
    companyId: 'comp-lulu-uae',
    salesOrgId: 'so-1010',
    salesOrgName: 'Allanasons Frozen Meat Division',
    salesOrgCode: 'SO-1010',
    shipToParty: 'LuLu Hypermarket - Al Barsha Dubai Logistics Hub',
    destinationCountry: 'United Arab Emirates',
    totalQuantityMt: 48.00,
    totalAmountUsd: 220800.00,
    status: 'BOOKED',
    shippingLine: 'Maersk Line',
    vesselName: 'Madrid Maersk',
    voyageNumber: '2646W',
    portOfLoading: 'JNPT Nhava Sheva, India',
    portOfDestination: 'Jebel Ali Port, Dubai',
    shippingDate: '2026-10-22T08:00:00.000Z',
    etd: '2026-10-24T12:00:00.000Z',
    eta: '2026-11-03T18:00:00.000Z',
    createdAt: '2026-10-18T10:00:00.000Z',
    totalContainers: 2,
    totalSkus: 2,
    containers: [
      {
        id: 'cont-7',
        containerNumber: 'MSKU9012341',
        sealNumber: 'ML-55102',
        reeferSetTemp: '-18.0°C',
        totalQuantityMt: 24.00,
        totalAmountUsd: 110400.00,
        items: [
          {
            id: 'item-7',
            productId: 'prod-buf-knu-03',
            sku: 'AL-BUF-KNU-03',
            productName: 'Frozen Boneless Buffalo Knuckle',
            brand: 'Allana',
            primaryPackaging: 'Vacuum Block (IWP)',
            cutSize: '3 - 5 kg whole muscle cut',
            quantityMt: 24.00,
            amountUsd: 110400.00,
            imageUrl: 'products/images/knuckle-sample.webp',
          },
        ],
      },
      {
        id: 'cont-8',
        containerNumber: 'MSKU9012342',
        sealNumber: 'ML-55103',
        reeferSetTemp: '-18.0°C',
        totalQuantityMt: 24.00,
        totalAmountUsd: 110400.00,
        items: [
          {
            id: 'item-8',
            productId: 'prod-buf-rum-05',
            sku: 'AL-BUF-RUM-05',
            productName: 'Frozen Boneless Buffalo Rumpsteak',
            brand: 'Allana',
            primaryPackaging: 'Vacuum Block (IWP)',
            cutSize: '2.5 - 4 kg whole muscle cut',
            quantityMt: 24.00,
            amountUsd: 110400.00,
            imageUrl: 'products/images/rumpsteak-sample.webp',
          },
        ],
      },
    ],
    documents: [
      {
        id: 'doc-11',
        documentType: 'BOOKING_CONFIRMATION',
        fileName: 'MAEU-BKG-2646W-88250.pdf',
        fileUrl: 'shipments/documents/MAEU-BKG-2646W-88250.pdf',
        fileSizeBytes: 195000,
        createdAt: '2026-10-18T11:00:00.000Z',
      },
    ],
  },
  {
    id: 'shipment-6',
    orderNumber: 'ORD-2026-88180',
    companyId: 'comp-lulu-uae',
    salesOrgId: 'so-3030',
    salesOrgName: 'Allanasons Consumer Products Division',
    salesOrgCode: 'SO-3030',
    shipToParty: 'LuLu Hypermarket - Dubai Festival City Supercenter',
    destinationCountry: 'United Arab Emirates',
    totalQuantityMt: 24.00,
    totalAmountUsd: 144000.00,
    status: 'DELIVERED',
    shippingLine: 'CMA CGM',
    vesselName: 'CMA CGM Antoine de Saint Exupery',
    voyageNumber: '0FL62W',
    portOfLoading: 'JNPT Nhava Sheva, India',
    portOfDestination: 'Jebel Ali Port, Dubai',
    shippingDate: '2026-09-15T08:00:00.000Z',
    etd: '2026-09-17T12:00:00.000Z',
    eta: '2026-09-27T18:00:00.000Z',
    createdAt: '2026-09-10T09:00:00.000Z',
    totalContainers: 1,
    totalSkus: 2,
    containers: [
      {
        id: 'cont-9',
        containerNumber: 'CMAU6543210',
        sealNumber: 'CM-11094',
        reeferSetTemp: '-18.0°C',
        totalQuantityMt: 24.00,
        totalAmountUsd: 144000.00,
        items: [
          {
            id: 'item-9',
            productId: 'prod-cust-burger-01',
            sku: 'LL-CUST-PAT-01',
            productName: 'LuLu Premium Buffalo Burger Patties',
            brand: 'LuLu Chef Select',
            primaryPackaging: 'Retail Display Master Carton',
            cutSize: '100g calibrated patty',
            quantityMt: 24.00,
            amountUsd: 144000.00,
            imageUrl: 'products/images/burger-sample.webp',
          },
        ],
      },
    ],
    documents: [
      {
        id: 'doc-12',
        documentType: 'DELIVERY_ORDER',
        fileName: 'CMDU-DO-88180.pdf',
        fileUrl: 'shipments/documents/CMDU-DO-88180.pdf',
        fileSizeBytes: 180000,
        createdAt: '2026-09-28T09:00:00.000Z',
      },
    ],
  },
  {
    id: 'shipment-7',
    orderNumber: 'ORD-2026-88301',
    companyId: 'comp-lulu-uae',
    salesOrgId: 'so-4040',
    salesOrgName: 'Allanasons Agro-Commodities Division',
    salesOrgCode: 'SO-4040',
    shipToParty: 'LuLu Central Commodity Silos - Port Rashid Dubai',
    destinationCountry: 'United Arab Emirates',
    totalQuantityMt: 44.00,
    totalAmountUsd: 88000.00,
    status: 'IN_TRANSIT',
    shippingLine: 'Hapag-Lloyd',
    vesselName: 'Barzan',
    voyageNumber: '2643E',
    portOfLoading: 'Kandla Port, Gujarat, India',
    portOfDestination: 'Jebel Ali Port, Dubai',
    shippingDate: '2026-10-14T09:00:00.000Z',
    etd: '2026-10-16T14:00:00.000Z',
    eta: '2026-10-25T16:00:00.000Z',
    createdAt: '2026-10-12T10:30:00.000Z',
    totalContainers: 2,
    totalSkus: 1,
    containers: [
      {
        id: 'cont-10',
        containerNumber: 'HLXU4419201',
        sealNumber: 'HL-77192',
        reeferSetTemp: 'Ambient Dry Container',
        totalQuantityMt: 22.00,
        totalAmountUsd: 44000.00,
        items: [
          {
            id: 'item-10',
            productId: 'prod-agro-ric-01',
            sku: 'AL-AGRO-RIC-01',
            productName: 'Indian 1121 Extra Long Grain Basmati Rice',
            brand: 'Allana Royal Heritage',
            primaryPackaging: 'Multiwall Jute Sacks',
            cutSize: '8.35mm average grain length',
            quantityMt: 22.00,
            amountUsd: 44000.00,
            imageUrl: 'products/images/rice-sample.webp',
          },
        ],
      },
      {
        id: 'cont-11',
        containerNumber: 'HLXU4419202',
        sealNumber: 'HL-77193',
        reeferSetTemp: 'Ambient Dry Container',
        totalQuantityMt: 22.00,
        totalAmountUsd: 44000.00,
        items: [
          {
            id: 'item-11',
            productId: 'prod-agro-ric-01',
            sku: 'AL-AGRO-RIC-01',
            productName: 'Indian 1121 Extra Long Grain Basmati Rice',
            brand: 'Allana Royal Heritage',
            primaryPackaging: 'Multiwall Jute Sacks',
            cutSize: '8.35mm average grain length',
            quantityMt: 22.00,
            amountUsd: 44000.00,
            imageUrl: 'products/images/rice-sample.webp',
          },
        ],
      },
    ],
    documents: [
      {
        id: 'doc-13',
        documentType: 'PHYTOSANITARY_CERT',
        fileName: 'PHYTO-IN-2026-88301.pdf',
        fileUrl: 'shipments/documents/PHYTO-IN-2026-88301.pdf',
        fileSizeBytes: 210000,
        createdAt: '2026-10-15T15:00:00.000Z',
      },
    ],
  },
];

export function filterFallbackShipments(options?: ShipmentFilterOptions) {
  let filtered = [...FALLBACK_DETAILED_SHIPMENTS];

  if (options?.destinationCountry && options.destinationCountry !== 'ALL') {
    const c = options.destinationCountry.trim().toLowerCase();
    filtered = filtered.filter((s) => s.destinationCountry.toLowerCase().includes(c));
  }

  if (options?.salesOrgId && options.salesOrgId !== 'ALL') {
    filtered = filtered.filter((s) => s.salesOrgId === options.salesOrgId);
  }

  if (options?.status && options.status !== 'ALL') {
    filtered = filtered.filter((s) => s.status === options.status);
  }

  if (options?.shipToParty && options.shipToParty.trim()) {
    const stp = options.shipToParty.trim().toLowerCase();
    filtered = filtered.filter((s) => s.shipToParty.toLowerCase().includes(stp));
  }

  if (options?.search && options.search.trim()) {
    const q = options.search.trim().toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.orderNumber.toLowerCase().includes(q) ||
        s.shipToParty.toLowerCase().includes(q) ||
        (s.vesselName && s.vesselName.toLowerCase().includes(q)) ||
        s.shippingLine.toLowerCase().includes(q)
    );
  }

  if (options?.sortBy === 'orderNumber_asc') {
    filtered.sort((a, b) => a.orderNumber.localeCompare(b.orderNumber));
  } else if (options?.sortBy === 'orderNumber_desc') {
    filtered.sort((a, b) => b.orderNumber.localeCompare(a.orderNumber));
  } else if (options?.sortBy === 'totalQuantityMt_asc') {
    filtered.sort((a, b) => a.totalQuantityMt - b.totalQuantityMt);
  } else if (options?.sortBy === 'totalQuantityMt_desc') {
    filtered.sort((a, b) => b.totalQuantityMt - a.totalQuantityMt);
  } else if (options?.sortBy === 'totalAmountUsd_asc') {
    filtered.sort((a, b) => a.totalAmountUsd - b.totalAmountUsd);
  } else if (options?.sortBy === 'totalAmountUsd_desc') {
    filtered.sort((a, b) => b.totalAmountUsd - a.totalAmountUsd);
  } else {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const page = Math.max(1, options?.page || 1);
  const limit = options?.limit || 10;
  const skip = (page - 1) * limit;
  const paginated = filtered.slice(skip, skip + limit);

  const countrySet = new Set<string>();
  const salesOrgMap = new Map<string, { id: string; name: string; code: string }>();

  FALLBACK_DETAILED_SHIPMENTS.forEach((s) => {
    countrySet.add(s.destinationCountry);
    salesOrgMap.set(s.salesOrgId, {
      id: s.salesOrgId,
      name: s.salesOrgName,
      code: s.salesOrgCode,
    });
  });

  return {
    shipments: paginated,
    total: filtered.length,
    page,
    pageSize: limit,
    totalPages: Math.ceil(filtered.length / limit) || 1,
    countries: Array.from(countrySet).sort(),
    salesOrgs: Array.from(salesOrgMap.values()),
  };
}
