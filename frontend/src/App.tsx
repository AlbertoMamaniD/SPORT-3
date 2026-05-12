function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Proyecto Arquitectura DDD</h1>
      <p>Backend: Spring Boot | Frontend: React</p>
      <hr />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h3>Estructura Backend</h3>
          <ul>
            <li>domain (model, repository)</li>
            <li>application (service, dto)</li>
            <li>infrastructure (persistence)</li>
            <li>interfaces (rest)</li>
          </ul>
        </div>
        <div>
          <h3>Estructura Frontend</h3>
          <ul>
            <li>domain</li>
            <li>infrastructure</li>
            <li>ui (components, pages)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
