// src/components/Quotes/PricesTable.jsx

/**
 * rows: [
 *   {
 *     key?: string,
 *     company: string,
 *     logo: string, // url o import
 *     cols: {
 *       rc: any,        // lo que tu renderCell ya sabe renderizar
 *       total: any,
 *       clasicos: any,
 *       premium: any,
 *       tr: any,
 *     }
 *   }
 * ]
 *
 * renderCell: (cellData) => ReactNode
 * classes: mapea a tus .module.scss (re-usa Paso3.module.scss)
 */

export default function PricesTable({ rows = [], renderCell, classes }) {
  if (!Array.isArray(rows)) rows = [];

  return (
    <div className={classes.tableWrapper} role='region' aria-label='Cotizaciones'>
      <table className={classes.table}>
        <thead>
          <tr>
            <th rowSpan={2}>COMPAÑÍA</th>
            <th rowSpan={2}>RESP. CIVIL</th>
            <th colSpan={3}>TERCEROS COMPLETOS</th>
            <th rowSpan={2}>TODO RIESGO</th>
          </tr>
          <tr>
            <th>TOTAL</th>
            <th>CLÁSICOS</th>
            <th>PREMIUM</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.key ?? row.company ?? i}>
              <th className={classes.companyCell} scope='row'>
                {row.logo ? (
                  <img src={row.logo} alt={row.company} className={classes.brandLogo} />
                ) : (
                  row.company
                )}
              </th>
              <td>{renderCell(row.cols?.rc)}</td>
              <td>{renderCell(row.cols?.total)}</td>
              <td>{renderCell(row.cols?.clasicos)}</td>
              <td>{renderCell(row.cols?.premium)}</td>
              <td>{renderCell(row.cols?.tr)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
