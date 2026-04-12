// src/lib/mocksQuotation.js
// Devuelve un array con aseguradoras y coveragePlans, similar al backend real.

export function getQuotationMock(/* quote opcional */) {
  // Podés usar "quote" si querés condicionar el mock por marca/año, etc.
  return [
    {
      insurance: 'Provincia',
      coveragePlans: [
        { planName: 'RESPONSABILIDAD CIVIL', planValue: 37900 },
        { planName: 'Terceros Completo Clásico', planValue: 51200 },
        { planName: 'Terceros Completo Plus', planValue: 58900 },
        { planName: 'Terceros Completo Premium', planValue: 65500 },
        { planName: 'Todo Riesgo con Franquicia', planValue: 142500 },
      ],
    },
    {
      insurance: 'Mercantil Andina',
      coveragePlans: [
        { planName: 'R.C.L.', planValue: 38500 },
        { planName: 'TC Clásicos', planValue: 49800 },
        { planName: 'TC Plus', planValue: 57400 },
        { planName: 'TC Premium', planValue: 63900 },
        { planName: 'TR Garantizado', planValue: 139900 },
      ],
    },

    {
      insurance: 'ATM',
      coveragePlans: [
        { planName: 'RC', planValue: 35900 },
        { planName: 'Terceros Completo Clásico', planValue: 48900 },
        { planName: 'Terceros Completo Plus', planValue: 55700 },
        { planName: 'Terceros Completo Premium', planValue: 62100 },
        { planName: 'Todo Riesgo', planValue: 145500 },
      ],
    },
  ];
}
