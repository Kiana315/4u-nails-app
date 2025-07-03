import { useState, useEffect } from "react";
import axios from "axios";

export default function BookingForm() {
  const [form, setForm] = useState({
    customer_name: "",
    phone_number: "",
    service: "",
    technician: "",
    date: "",
    time: "",
  });

  const [services, setServices] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    // 获取服务
    axios.get("http://127.0.0.1:8000/api/services/")
      .then((res) => setServices(res.data))
      .catch((err) => console.error("获取服务失败", err));

    // 获取技师
    axios.get("http://127.0.0.1:8000/api/technicians/")
      .then((res) => setTechnicians(res.data))
      .catch((err) => console.error("获取技师失败", err));

    // 生成时间段（10:00 - 19:00，每15分钟一个）
    const generatedSlots = Array.from({ length: 37 }, (_, i) => {
      const hour = 10 + Math.floor(i * 15 / 60);
      const minute = (i * 15) % 60;
      return `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
    });
    setTimeSlots(generatedSlots);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/appointments/", form);
      alert("预约成功！");
    } catch (error) {
      console.error(error);
      alert("预约失败！");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", marginTop: "1rem" }}>
      <input
        name="customer_name"
        placeholder="姓名"
        required
        value={form.customer_name}
        onChange={handleChange}
      />
      <input
        name="phone_number"
        placeholder="电话"
        required
        value={form.phone_number}
        onChange={handleChange}
      />
      <select name="service" value={form.service} onChange={handleChange} required>
        <option value="">请选择服务项目</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <select name="technician" value={form.technician} onChange={handleChange}>
        <option value="">可选技师</option>
        {technicians.map((tech) => (
          <option key={tech.id} value={tech.id}>
            {tech.username}
          </option>
        ))}
      </select>
      <input
        type="date"
        name="date"
        required
        value={form.date}
        onChange={handleChange}
      />
      <select name="time" value={form.time} onChange={handleChange} required>
        <option value="">请选择时间</option>
        {timeSlots.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      <button type="submit" style={{ marginTop: "1rem" }}>
        提交预约
      </button>
    </form>
  );
}
