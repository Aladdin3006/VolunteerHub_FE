import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { format, isSameDay, addMonths, subMonths } from "date-fns";
import { useNavigate } from "react-router-dom";
import { fetchTasksByVolunteer } from "../../apis/task";
import { vi } from "date-fns/locale";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Tooltip,
} from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import Header from "@/components/Header/Header";

interface Task {
  _id: string;
  title: string;
  phaseDayDate: string;
  campaignName: string;
  campaignId: string;
  status: string; // Added status field
}

const CalendarTask: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id || user?._id;
  const token = user?.token;

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId || !token) return;
      try {
        const data = await fetchTasksByVolunteer(
          userId,
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          token
        );
        setTasks(data.data || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, [currentDate, userId, token]);

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => isSameDay(new Date(task.phaseDayDate), date));
  };

  // Calculate task statistics
  const totalTasks = tasks.length;
  const incompleteTasks = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;

  const renderTooltipContent = (tasksForDate: Task[]) => {
    return (
      <Box sx={{ p: 1 }}>
        {tasksForDate.map((task, index) => (
          <Box
            key={task._id}
            sx={{
              mb: index < tasksForDate.length - 1 ? 1 : 0,
              "&:last-child": { mb: 0 },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                color: "white",
                fontFamily: "'Nunito Sans', sans-serif",
              }}
            >
              Chiến dịch:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "white",
                fontFamily: "'Nunito Sans', sans-serif",
                mb: 1,
              }}
            >
              {task.campaignName}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                color: "white",
                fontFamily: "'Nunito Sans', sans-serif",
              }}
            >
              Nhiệm vụ:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "white",
                fontFamily: "'Nunito Sans', sans-serif",
              }}
            >
              {task.title}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const tasksForDate = getTasksForDate(date);
      const isToday = isSameDay(date, new Date());
      const isCompleted =
        tasksForDate.length > 0 &&
        tasksForDate.every((task) => task.status !== "in-progress");

      if (tasksForDate.length > 0) {
        return (
          <Tooltip
            title={renderTooltipContent(tasksForDate)}
            placement="top"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: "#1976d2",
                  "& .MuiTooltip-arrow": {
                    color: "#1976d2",
                  },
                  maxWidth: 300,
                  fontSize: "0.875rem",
                  fontFamily: "'Nunito Sans', sans-serif",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                },
              },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "1px",
                right: "2px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 6px",
                fontSize: "10px",
                fontWeight: "bold",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  color: "#4caf50",
                  fontWeight: "bold",
                  marginBottom: "1px",
                }}
              >
                Có nhiệm vụ
              </span>
              <span
                style={{
                  backgroundColor: isCompleted ? "#4caf50" : "#1976d2",
                  borderRadius: "50%",
                  minWidth: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  color: "white",
                }}
              >
                {tasksForDate.length}
              </span>
            </Box>
          </Tooltip>
        );
      }

      // Only show "Today" indicator if it's today AND there are no tasks
      if (isToday && tasksForDate.length === 0) {
        return (
          <Box
            sx={{
              position: "absolute",
              top: "2px",
              display: "flex",
              alignItems: "center",
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            Hôm nay
          </Box>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const tasksForDate = getTasksForDate(date);
      const isToday = isSameDay(date, new Date());

      let className = "";
      if (tasksForDate.length > 0) className += "has-tasks ";
      if (isToday) className += "is-today ";

      return className.trim() || null;
    }
    return null;
  };

  const handleTileClick = (date: Date) => {
    const tasksForDate = getTasksForDate(date);
    if (tasksForDate.length > 0) {
      navigate(`/campaigns/${tasksForDate[0].campaignId}/tasks`);
    }
  };

  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "url('https://via.placeholder.com/1920x1080?text=Calendar+Background')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.1,
          zIndex: -1,
        },
      }}
    >
      <Header />
      <Box sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 10 }}>
        <Card
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#1976d2",
              textAlign: "center",
            }}
          >
            Nhiệm vụ của bạn trong tháng{" "}
            {format(currentDate, "MMMM yyyy", { locale: vi })}
          </Typography>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
                px: 2,
              }}
            >
              <Button
                variant="contained"
                startIcon={<KeyboardArrowLeft />}
                onClick={handlePrevMonth}
                sx={{
                  background:
                    "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                  color: "white",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                  },
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  transition: "all 0.3s ease",
                }}
              >
                Tháng trước
              </Button>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#1976d2",
                  textAlign: "center",
                  fontSize: "1.5rem",
                }}
              >
                {format(currentDate, "MMMM yyyy", { locale: vi })}
              </Typography>
              <Button
                variant="contained"
                endIcon={<KeyboardArrowRight />}
                onClick={handleNextMonth}
                sx={{
                  background:
                    "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                  color: "white",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                  },
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  transition: "all 0.3s ease",
                }}
              >
                Tháng sau
              </Button>
            </Box>
            <Calendar
              onChange={setCurrentDate}
              value={currentDate}
              onClickDay={handleTileClick}
              tileContent={tileContent}
              tileClassName={tileClassName}
              minDetail="month"
              maxDetail="month"
              className="react-calendar"
              tileDisabled={({ date }) => {
                const tasksForDate = getTasksForDate(date);
                // const isToday = isSameDay(date, new Date());
                return tasksForDate.length === 0 || date > new Date(); // Disable days with no tasks (except today if it has tasks) or future dates
              }}
              showNeighboringMonth={true}
              calendarType="gregory"
            />
          </CardContent>
        </Card>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 4,
            p: 2,
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontWeight: "bold",
              color: "#1976d2",
              fontFamily: "'Nunito Sans', sans-serif",
            }}
          >
            Nhiệm vụ trong tháng: {totalTasks}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: "bold",
              color: "#d32f2f",
              fontFamily: "'Nunito Sans', sans-serif",
            }}
          >
            Nhiệm vụ chưa hoàn thành: {incompleteTasks}
          </Typography>
        </Box>
      </Box>

      <style jsx global>{`
        .react-calendar {
          width: 100%;
          border: none;
          font-family: "Nunito Sans", sans-serif;
          background: transparent;
        }

        .react-calendar__navigation {
          display: none;
        }

        .react-calendar__month-view__weekdays {
          text-align: center;
          font-weight: bold;
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }

        .react-calendar__month-view__weekdays__weekday {
          padding: 12px 4px;
          text-decoration: none;
          border-bottom: 2px solid #e0e0e0;
          text-align: center;
        }

        .react-calendar__month-view__days {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }

        .react-calendar__tile {
          position: relative;
          padding: 16px 8px;
          text-align: center;
          transition: all 0.3s ease;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid transparent;
          font-weight: 500;
          font-size: 14px;
          min-height: 50px;
          display: flex; /* Use flexbox */
          align-items: center; /* Vertically center */
          justify-content: center; /* Horizontally center */
          color: #000;
        }

        .react-calendar__tile:hover {
          background: rgba(25, 118, 210, 0.1);
          border-color: rgba(25, 118, 210, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .react-calendar__tile.has-tasks {
          background: rgba(25, 118, 210, 0.05);
          border-color: rgba(25, 118, 210, 0.2);
          cursor: pointer;
        }

        .react-calendar__tile.has-tasks:hover {
          background: rgba(25, 118, 210, 0.15);
          border-color: #1976d2;
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(25, 118, 210, 0.2);
        }

        .react-calendar__tile.is-today {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          border-color: #1976d2;
          font-weight: bold;
          color: #1976d2;
          box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
        }

        .react-calendar__month-view__days__day--neighboringMonth {
          color: #bbb;
          background: rgba(255, 255, 255, 0.5);
        }

        .react-calendar__tile--active {
          background: #1976d2 !important;
          color: white !important;
          border-color: #1976d2 !important;
          box-shadow: 0 6px 20px rgba(25, 118, 210, 0.3);
        }

        .react-calendar__tile--active:hover {
          background: #1565c0 !important;
        }

        .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
          font-weight: 600;
          color: #1976d2;
        }
      `}</style>
    </Box>
  );
};

export default CalendarTask;
