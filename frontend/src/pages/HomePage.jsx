import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div style={{ textAlign: "center", padding: "3rem" }}>
      <h1>Welcome to 4U Nails</h1>
      <p>Discover your perfect nail style</p>
      <Link to="/book">
        <button style={{ marginTop: "1rem", padding: "0.8rem 1.5rem" }}>
          Book an Appointment
        </button>
      </Link>
    </div>
  );
}
