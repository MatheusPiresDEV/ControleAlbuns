import { useAlbumStore } from '../store/albumStore';

export function HeatMap() {
  const { getActivityHeatMap } = useAlbumStore();
  const heatMapData = getActivityHeatMap();

  const getColorIntensity = (count: number) => {
    if (count === 0) return 'bg-[#0f0f0f]';
    if (count === 1) return 'bg-blue-900/30';
    if (count === 2) return 'bg-blue-700/50';
    if (count === 3) return 'bg-blue-500/70';
    return 'bg-blue-400';
  };

  const today = new Date();
  const daysToShow = 365;
  const weeks = Math.ceil(daysToShow / 7);

  const days = [];
  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const count = heatMapData[dateKey] || 0;
    days.push({ date, count });
  }

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 justify-around text-xs text-gray-500 pr-2">
            {weekDays.map((day, i) => (
              <div key={i} className="h-3">{i % 2 === 0 ? day : ''}</div>
            ))}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: weeks }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const dayData = days[weekIndex * 7 + dayIndex];
                  if (!dayData) return <div key={dayIndex} className="w-3 h-3" />;

                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm ${getColorIntensity(dayData.count)} border border-gray-800 hover:border-blue-500 transition-all cursor-pointer`}
                      title={`${dayData.date.toLocaleDateString('pt-BR')}: ${dayData.count} ${dayData.count === 1 ? 'avaliação' : 'avaliações'}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
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
      </div>
    </div>
  );
}
