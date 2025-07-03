import { useState, useEffect } from "react";
import axios from "../utils/axios"; // 替换原本的 import


export default function ServiceDashboard() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState("");

  // 获取所有服务项
  const fetchServices = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/services/");
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // 添加服务项
  const handleAdd = async () => {
    if (!newService.trim()) return;
    try {
      await axios.post("http://localhost:8000/api/services/", { name: newService }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      setNewService("");
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  // 删除服务项
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/services/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <h2>服务管理</h2>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="新服务名称"
          value={newService}
          onChange={(e) => setNewService(e.target.value)}
        />
        <button onClick={handleAdd}>添加服务</button>
      </div>

      <ul>
        {services.map((service) => (
          <li key={service.id} style={{ marginBottom: "0.5rem" }}>
            {service.name}
            <button
              onClick={() => handleDelete(service.id)}
              style={{ marginLeft: "1rem" }}
            >
              删除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
