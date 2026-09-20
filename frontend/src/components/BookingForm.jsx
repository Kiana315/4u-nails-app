import { useState, useEffect } from "react";
import axios from "axios";

const publicApi = axios.create({
  baseURL: `${(import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "")}/api/`,
});

export default function BookingForm() {
  const [form, setForm] = useState({
    customer_name: "",
    phone_number: "",
    service: "",
    technician: "",
    date: "",
    time: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.all([publicApi.get("services/"), publicApi.get("technicians/")])
      .then(([serviceResponse, technicianResponse]) => {
        if (!active) return;
        setServices(serviceResponse.data);
        setTechnicians(technicianResponse.data);
      })
      .catch(() => {
        if (active) setError("无法加载预约选项，请刷新页面重试。");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // 生成时间段（10:00 - 19:00，每15分钟一个）
    const generatedSlots = Array.from({ length: 37 }, (_, i) => {
      const hour = 10 + Math.floor(i * 15 / 60);
      const minute = (i * 15) % 60;
      return `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
    });
    setTimeSlots(generatedSlots);
    return () => { active = false; };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || submitted) return;
    setSubmitting(true);
    setError("");
    try {
      await publicApi.post("appointments/", {
        ...form,
        service: Number(form.service),
        technician: form.technician ? Number(form.technician) : null,
      });
      setSubmitted(true);
    } catch (error) {
      const details = error.response?.data;
      setError(details && typeof details === "object"
        ? Object.values(details).flat().join(" ")
        : "预约未能确认，请联系门店核实后再重试。");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return <p role="status">预约已提交，请保留所选日期和时间。未指定技师的预约将由门店安排。</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", marginTop: "1rem" }}>
      <p>无需注册或登录，填写联系方式即可预约。</p>
      {loading && <p role="status">正在加载预约选项…</p>}
      {error && <p role="alert">{error}</p>}
      <fieldset disabled={loading || submitting} style={{ border: 0, padding: 0 }}>
      <input
        aria-label="姓名"
        maxLength={100}
        name="customer_name"
        placeholder="姓名"
        required
        value={form.customer_name}
        onChange={handleChange}
      />
      <input
        type="tel"
        aria-label="电话"
        maxLength={20}
        name="phone_number"
        placeholder="电话"
        required
        value={form.phone_number}
        onChange={handleChange}
      />
      <select aria-label="服务项目" name="service" value={form.service} onChange={handleChange} required>
        <option value="">请选择服务项目</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <select aria-label="技师" name="technician" value={form.technician} onChange={handleChange}>
        <option value="">不指定技师，由门店安排</option>
        {technicians.map((tech) => (
          <option key={tech.id} value={tech.id}>
            {tech.username}
          </option>
        ))}
      </select>
      <input
        aria-label="日期"
        type="date"
        name="date"
        required
        value={form.date}
        onChange={handleChange}
      />
      <select aria-label="时间" name="time" value={form.time} onChange={handleChange} required>
        <option value="">请选择时间</option>
        {timeSlots.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      <button disabled={services.length === 0 || submitting} type="submit" style={{ marginTop: "1rem" }}>
        {submitting ? "正在提交…" : "提交预约"}
      </button>
      </fieldset>
    </form>
  );
}
