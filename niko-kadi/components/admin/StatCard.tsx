interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: "green" | "yellow" | "red" | "blue" | "gray";
}

const colors = {
  green: "text-green-400",
  yellow: "text-yellow-400",
  red: "text-red-400",
  blue: "text-blue-400",
  gray: "text-gray-300",
};

export default function StatCard({ label, value, sub, color = "gray" }: StatCardProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}
