const Card = ({ title, children }) => {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginBottom: "10px" }}>{title}</h2>
      <div>{children}</div>
    </div>
  )
}

export default Card
