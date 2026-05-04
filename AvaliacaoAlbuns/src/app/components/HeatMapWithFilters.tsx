import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAlbumStore } from '../store/albumStore';

type ViewMode = 'year' | 'month' | 'week';

export function HeatMapWithFilters() {
  const { getActivityHeatMap } = useAlbumStore();
  const [viewMode, setViewMode] = useState<ViewMode>('year');
  const [currentDate, setCurrentDate] = useState(new Date());

  const heatMapData = getActivityHeatMap();
  const maxActivity = Math.max(...Object.values(heatMapData), 0);

  const getColorIntensity = (count: number, isMaxActivity: boolean = false) => {
    if (isMaxActivity && count > 0) return 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50';
    if (count === 0) return 'bg-[#0f0f0f]';
    if (count === 1) return 'bg-blue-900/30';
    if (count === 2) return 'bg-blue-700/50';
    if (count === 3) return 'bg-blue-500/70';
    return 'bg-blue-400';
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'year') {
      newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const days = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const count = heatMapData[dateKey] || 0;
      days.push({ date: new Date(d), count });
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm ${getColorIntensity(day.count, day.count === maxActivity)} border border-gray-800 hover:border-blue-500 transition-all cursor-pointer`}
                    title={`${day.date.toLocaleDateString('pt-BR')}: ${day.count} ${day.count === 1 ? 'ação' : 'ações'}${day.count === maxActivity && day.count > 0 ? ' 🔥 DIA MAIS ATIVO!' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const count = heatMapData[dateKey] || 0;
      days.push({ date: new Date(d), count });
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs text-gray-500 font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`aspect-square rounded-lg ${
                    day
                      ? `${getColorIntensity(day.count, day.count === maxActivity)} border border-gray-800 hover:border-blue-500 transition-all cursor-pointer flex items-center justify-center`
                      : 'bg-transparent'
                  }`}
                  title={day ? `${day.date.toLocaleDateString('pt-BR')}: ${day.count} ${day.count === 1 ? 'ação' : 'ações'}${day.count === maxActivity && day.count > 0 ? ' 🔥 DIA MAIS ATIVO!' : ''}` : ''}
                >
                  {day && <span className="text-xs text-white font-medium">{day.date.getDate()}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dateKey = day.toISOString().split('T')[0];
      const count = heatMapData[dateKey] || 0;
      days.push({ date: day, count });
    }

    const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    return (
      <div className="space-y-3">
        {days.map((day, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-24 text-sm text-gray-400">{weekDays[index]}</div>
            <div className="flex-1 h-12 bg-[#0f0f0f] rounded-lg overflow-hidden border border-gray-800 relative">
              <div
                className={`h-full ${getColorIntensity(day.count, day.count === maxActivity)} flex items-center px-4 transition-all`}
                style={{ width: day.count > 0 ? `${Math.min(100, day.count * 20)}%` : '100%' }}
              >
                <span className="text-white font-medium">
                  {day.date.toLocaleDateString('pt-BR')} - {day.count} {day.count === 1 ? 'ação' : 'ações'}{day.count === maxActivity && day.count > 0 ? ' 🔥' : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getDisplayDate = () => {
    if (viewMode === 'year') {
      return currentDate.getFullYear().toString();
    } else if (viewMode === 'month') {
      return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    } else {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${endOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <div className="flex bg-[#0f0f0f] rounded-lg p-1 border border-gray-800">
            <button
              onClick={() => setViewMode('year')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'year' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Ano
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'month' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'week' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Semana
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 bg-[#0f0f0f] hover:bg-gray-800 rounded-lg border border-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div className="text-white font-medium min-w-[200px] text-center">{getDisplayDate()}</div>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 bg-[#0f0f0f] hover:bg-gray-800 rounded-lg border border-gray-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div>
        {viewMode === 'year' && renderYearView()}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
        <div className="flex items-center gap-2">
          <span>Menos</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-[#0f0f0f] border border-gray-800" />
            <div className="w-3 h-3 rounded-sm bg-blue-900/30 border border-gray-800" />
            <div className="w-3 h-3 rounded-sm bg-blue-700/50 border border-gray-800" />
            <div className="w-3 h-3 rounded-sm bg-blue-500/70 border border-gray-800" />
            <div className="w-3 h-3 rounded-sm bg-blue-400 border border-gray-800" />
          </div>
          <span>Mais</span>
        </div>
        <div className="flex items-center gap-2 text-yellow-400">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50" />
          <span>🔥 Dia mais ativo</span>
        </div>
      </div>
    </div>
  );
}
