import { db } from "@/db";

const CountriesPage = async () => {
  let countries = [];
  let error: string | null = null;

  try {
    countries = await db.query.country.findMany({
      orderBy: (country, { asc }) => [asc(country.name)], // Order alphabetically by name
    });
  } catch (err) {
    console.error("Failed to fetch countries:", err);
    error = "Failed to load countries. Please try again later.";
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Countries</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!error && countries.length === 0 && (
        <p>No countries found in the database.</p>
      )}

      {!error && countries.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={tableHeaderStyle}>ID</th>
              <th style={tableHeaderStyle}>Alpha-2 Code</th>
              <th style={tableHeaderStyle}>Name</th>
            </tr>
          </thead>
          <tbody>
            {countries.map(country => (
              <tr key={country.id}>
                <td style={tableCellStyle}>{country.id}</td>
                <td style={tableCellStyle}>{country.alpha2Code}</td>
                <td style={tableCellStyle}>{country.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CountriesPage;

// Simple inline styles for the table
const tableHeaderStyle = {
  padding: "10px",
  border: "1px solid #ddd",
  textAlign: "left" as const, // Cast to literal type for CSS property
};

const tableCellStyle = {
  padding: "10px",
  border: "1px solid #ddd",
};

const tableRowStyle = {
  "&:nth-child(even)": {
    backgroundColor: "#f9f9f9",
  },
};
