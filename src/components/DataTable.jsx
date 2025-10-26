"use client"

export default function DataTable({ columns, data }) {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-primary border-b border-border">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3 text-left text-sm font-semibold text-text">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-border hover:bg-primary transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-3 text-sm text-text">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
