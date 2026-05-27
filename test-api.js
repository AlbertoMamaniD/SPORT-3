const axios = require('axios');

async function testApi() {
  try {
    const res = await axios.post('http://localhost:8080/api/admin/precios', {
      canchaId: 1, // Assume 1 exists, or at least we get a different error if not
      precioHora: 50,
      horaInicio: "07:00:00",
      horaFin: "23:00:00",
      diaSemana: "LUNES",
      esFeriado: false
    });
    console.log("Success:", res.data);
  } catch (err) {
    if (err.response) {
      console.log("Status:", err.response.status);
      console.log("Data:", err.response.data);
    } else {
      console.log("Error:", err.message);
    }
  }
}

testApi();
