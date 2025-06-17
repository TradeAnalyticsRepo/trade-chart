import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface CollectionData {
  tradeDate: string;
  indivCollectionVolume: number;
  foreCollectionVolume: number;
  finInvCollectionVolume: number;
  insurCollectionVolume: number;
  pensCollectionVolume: number;
  etcFinCollectionVolume: number;
  etcCollectionVolume: number;
  trustCollectionVolume: number;
  sTrustCollectionVolume: number;
}

interface Props {
  data: CollectionData;
}

export default function CollectionVolumeChart({ data }: Props) {
  const chartData = {
    labels: [data.tradeDate],
    datasets: [
      {
        label: '개인',
        data: [data.indivCollectionVolume],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: '외국인',
        data: [data.foreCollectionVolume],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: '기관',
        data: [
          data.finInvCollectionVolume +
            data.insurCollectionVolume +
            data.pensCollectionVolume +
            data.etcFinCollectionVolume +
            data.etcCollectionVolume +
            data.trustCollectionVolume +
            data.sTrustCollectionVolume,
        ],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '매집수량 차트',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '매집수량',
        },
      },
      x: {
        title: {
          display: true,
          text: '날짜',
        },
      },
    },
  };

  return (
    <div className='w-full h-[400px] p-4'>
      <Line
        options={options}
        data={chartData}
      />
    </div>
  );
}
