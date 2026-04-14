import { useState } from 'react';
import Header from '../src/components/header';
import Navigation from './components/navigation';
import AgendaSection from './components/agendasection';
import TimelineSection from './components/timelinesection';

function App() {
  const [activeSection, setActiveSection] = useState<string>('agenda');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3">
            <Navigation
              activeSection={activeSection}
              onNavigate={setActiveSection}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6">
            {activeSection === 'agenda' && <AgendaSection />}
            {activeSection === 'sobre' && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-white">
                <h2 className="text-3xl font-bold mb-4">Sobre o LACIS</h2>
                <p className="text-gray-200 leading-relaxed">
                  Conteúdo sobre o LACIS...
                </p>
              </div>
            )}
            {/* Adicione mais seções conforme necessário */}
          </div>

          {/* Timeline Sidebar */}
          <div className="lg:col-span-3">
            <TimelineSection />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-white">
          <p className="font-semibold text-lg mb-2">LACIS</p>
          <p className="text-sm text-gray-300">
            e-mail: culturadimc@gmail.com
          </p>
          <p className="text-sm text-gray-300">
            Endereço: TRAVESSA DO LABIRINTO, 22 05508 020 SÃO PAULO SP BRASIL
          </p>
          <p className="text-sm text-gray-300 mt-2">
            Expediente: segunda à sexta, das 9 às 18 horas. Telefone: 55 11 7070 1500
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;