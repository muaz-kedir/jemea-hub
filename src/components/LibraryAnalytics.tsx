import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, BarChart3, PieChart as PieChartIcon, BookOpen } from "lucide-react";

// Sample data - replace with real data from Firestore
const borrowsPerMonth = [
  { month: "Jan", borrows: 45 },
  { month: "Feb", borrows: 62 },
  { month: "Mar", borrows: 78 },
  { month: "Apr", borrows: 55 },
  { month: "May", borrows: 89 },
  { month: "Jun", borrows: 95 },
];

const topCategories = [
  { name: "Islamic Studies", value: 156, color: "#3b82f6" },
  { name: "Science", value: 124, color: "#22c55e" },
  { name: "Literature", value: 98, color: "#a855f7" },
  { name: "History", value: 76, color: "#f59e0b" },
  { name: "Technology", value: 54, color: "#ef4444" },
];

const uploadDistribution = [
  { name: "Books", value: 45, color: "#3b82f6" },
  { name: "Documents", value: 30, color: "#22c55e" },
  { name: "Resources", value: 25, color: "#a855f7" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
        <p className="text-slate-300 text-sm font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color || "#3b82f6" }}>
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
        <p className="text-sm" style={{ color: payload[0].payload.color }}>
          {payload[0].name}: <span className="font-semibold">{payload[0].value}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export const LibraryAnalytics = () => {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-bold">Library Analytics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Line Chart - Books Borrowed Per Month */}
        <Card className="p-4 border-0 shadow-lg bg-slate-900/50 backdrop-blur">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Books Borrowed</h3>
              <p className="text-xs text-muted-foreground">Monthly trend</p>
            </div>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={borrowsPerMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b" 
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="borrows"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bar Chart - Top Categories */}
        <Card className="p-4 border-0 shadow-lg bg-slate-900/50 backdrop-blur">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Top Categories</h3>
              <p className="text-xs text-muted-foreground">Most borrowed</p>
            </div>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCategories} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis 
                  type="number"
                  stroke="#64748b" 
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  stroke="#64748b" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {topCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart - Upload Distribution */}
        <Card className="p-4 border-0 shadow-lg bg-slate-900/50 backdrop-blur lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <PieChartIcon className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Upload Distribution</h3>
              <p className="text-xs text-muted-foreground">By resource type</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="h-[160px] w-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={uploadDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {uploadDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex sm:flex-col gap-4">
              {uploadDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
