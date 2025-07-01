import { useState } from "react";
import axios from "axios";

export default function BookingForm() {
  const [form, setForm] = useState({
    customer_name: "",
    phone_number: "",
    service: "French Manicure",
    technician: "",
    date: "",
    time: "10:00",
    status: "Pending",
  });

  const services = [
    "French Manicure",
    "Gel Polish",
    "Nail Art Design",
    "Extension with Gel",
  ];

  const timeSlots = Array.from({ length: 37 }, (_, i) => {
    const hour = 10 + Math.floor(i * 15 / 60);
    const minute = (i * 15) % 60;
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/appointments/", form);
      alert("Appointment booked successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to book appointment.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", marginTop: "1rem" }}>
      <input name="customer_name" placeholder="Name" required onChange={handleChange} />
      <input name="phone_number" placeholder="Phone" required onChange={handleChange} />
      <select name="service" value={form.service} onChange={handleChange}>
        {services.map((s) => <option key={s}>{s}</option>)}
      </select>
      <input name="technician" placeholder="Preferred Technician" onChange={handleChange} />
      <input type="date" name="date" required onChange={handleChange} />
      <select name="time" value={form.time} onChange={handleChange}>
        {timeSlots.map((t) => <option key={t}>{t}</option>)}
      </select>
      <button type="submit">Book</button>
    </form>
  );
}
