import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  LinearProgress,
} from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, XAxis, YAxis, CartesianGrid, Bar } from "recharts";

export default function CampaignDashboard() {
  // Fake data from API
  const data = {
    overview: {
      name: "Phòng chống bão lũ miền Trung",
      description: "Phòng chống bão lũ",
      status: "in-progress",
      location: {
        address: "UBND Châu Bình, Hà Tĩnh, Việt Nam",
      },
      startDate: "2025-07-17",
      endDate: "2025-11-24",
      counts: {
        departments: 1,
        phases: 3,
        phaseDays: 0,
      },
    },
    volunteers: {
      total: 5,
      byStatus: { approved: 5 },
      evaluation: { excellent: 1, average: 4 },
    },
    departments: [
      { _id: "68a631aa719c6c093187c26a", name: "Phòng Truyền Thống", maxMembers: 2, members: 0 },
    ],
    phases: [
      { _id: "687a0c6dda6fb1df0a1fc6c0", name: "Giai đoạn chuẩn bị", startDate: "2025-07-18", endDate: "2025-07-21" },
      { _id: "689f0370929afc998c0869f7", name: "Phòng chống bão", startDate: "2025-08-15", endDate: "2025-08-17" },
      { _id: "68a60be9b22fd04da6f7f7b1", name: "Hỗ trợ người dân", startDate: "2025-08-20", endDate: "2025-08-28" },
    ],
    checkins: {
      total: 5,
      uniqueUsers: 3,
      attendanceRate: 60,
      byHour: [
        { count: 1, hour: 4 },
        { count: 1, hour: 7 },
        { count: 1, hour: 12 },
        { count: 2, hour: 18 },
      ],
      byMethod: [
        { count: 3, method: "face" },
        { count: 2, method: "manual" },
      ],
    },
    tasks: {
      byStatus: [],
      totalAssigned: 0,
      avgPeerScore: 0,
      avgStaffScore: 0,
    },
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {data.overview.name}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        {data.overview.description}
      </Typography>
      <Typography variant="body2">📍 {data.overview.location.address}</Typography>

      <Grid container spacing={3} mt={2}>
        {/* Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">📊 Thông tin chung</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>Trạng thái: <Chip label={data.overview.status} color="success" size="small" /></Typography>
              <Typography>Bắt đầu: {data.overview.startDate}</Typography>
              <Typography>Kết thúc: {data.overview.endDate}</Typography>
              <Typography>Phòng ban: {data.overview.counts.departments}</Typography>
              <Typography>Giai đoạn: {data.overview.counts.phases}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Volunteers */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">🙋 Tình nguyện viên</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>Tổng: {data.volunteers.total}</Typography>
              <Typography>Approved: {data.volunteers.byStatus.approved}</Typography>
              <Typography>Đánh giá xuất sắc: {data.volunteers.evaluation.excellent}</Typography>
              <Typography>Đánh giá trung bình: {data.volunteers.evaluation.average}</Typography>
              <PieChart width={250} height={200}>
                <Pie
                  data={data.checkins.byMethod}
                  dataKey="count"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  label
                >
                  {data.checkins.byMethod.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </CardContent>
          </Card>
        </Grid>

        {/* Checkins */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">✅ Check-in</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>Tổng: {data.checkins.total}</Typography>
              <Typography>Người duy nhất: {data.checkins.uniqueUsers}</Typography>
              <Typography>Tỉ lệ tham gia: {data.checkins.attendanceRate}%</Typography>
              <LinearProgress variant="determinate" value={data.checkins.attendanceRate} sx={{ mt: 1 }} />
              <BarChart width={250} height={200} data={data.checkins.byHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Departments & Phases */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">🏢 Phòng ban</Typography>
              <Divider sx={{ my: 1 }} />
              <List>
                {data.departments.map((d) => (
                  <ListItem key={d._id}>
                    <ListItemText
                      primary={d.name}
                      secondary={`Số lượng: ${d.members}/${d.maxMembers}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">📅 Giai đoạn</Typography>
              <Divider sx={{ my: 1 }} />
              <List>
                {data.phases.map((p) => (
                  <ListItem key={p._id}>
                    <ListItemText
                      primary={p.name}
                      secondary={`${p.startDate} → ${p.endDate}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
