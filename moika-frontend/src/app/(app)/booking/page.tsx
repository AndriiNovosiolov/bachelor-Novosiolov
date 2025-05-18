"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Button,
} from "@mui/material";
import { bookingService } from "@/services/bookingService";
import { jwtDecode } from "jwt-decode";
import EventIcon from "@mui/icons-material/Event";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BuildIcon from "@mui/icons-material/Build";
import StarIcon from "@mui/icons-material/Star";
import PlaceIcon from "@mui/icons-material/Place";
import apiService from "@/services/api";

const SERVICE_TYPE_LABELS: Record<string, string> = {
  oil_change: "Заміна масла",
  polishing: "Полірування",
  chemical_cleaning: "Хімчистка",
  diagnostics: "Діагностика",
  tire_service: "Шиномонтаж",
  other: "Інше",
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  let userId: string | null = null;
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        userId = decoded.sub;
      } catch {}
    }
  }
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      bookingService.getAll({ userId }),
      apiService.get("/auto-services/external/bookings/my"),
    ])
      .then(([ourRes, googleRes]) => {
        // ourRes.data — наші бронювання, googleRes.data — Google-бронювання
        const all = [
          ...(ourRes.data || []),
          ...(googleRes.data || []).map((b: any) => ({
            ...b,
            isExternal: true,
          })),
        ];
        setBookings(all);
      })
      .catch(() => setError("Не вдалося завантажити бронювання"))
      .finally(() => setLoading(false));
  }, [userId]);

  const icons = [
    <EventIcon fontSize="large" key="event" />, // generic
    <DirectionsCarIcon fontSize="large" key="car" />, // car wash
    <BuildIcon fontSize="large" key="build" />, // service
    <StarIcon fontSize="large" key="star" />, // rating
    <PlaceIcon fontSize="large" key="place" />, // address
  ];

  const getGoogleCalendarUrl = (
    b: any,
    name: string,
    address: string,
    city: string,
    isExternal: boolean
  ) => {
    const start = new Date(b.startTime);
    const end = new Date(b.endTime);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const formatDate = (d: Date) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(
        d.getUTCDate()
      )}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
    const dates = `${formatDate(start)}/${formatDate(end)}`;
    const text = encodeURIComponent(name);
    const details = encodeURIComponent(
      (isExternal && b.serviceType
        ? `Послуга: ${SERVICE_TYPE_LABELS[b.serviceType] || b.serviceType}\n`
        : "") + (b.notes || "")
    );
    const location = encodeURIComponent(address + (city ? `, ${city}` : ""));
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)",
        py: { xs: 2, md: 6 },
        px: { xs: 2, md: 6 },
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
          mb: 6,
          borderRadius: 10,
          background: "linear-gradient(100deg, #b6e0fe 0%, #e0c3fc 100%)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
          p: { xs: 3, md: 7 },
          px: { xs: 2, md: 6 },
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Typography
          variant="h3"
          fontWeight={900}
          color="primary.main"
          align="center"
          mb={1}
          letterSpacing={1}
          sx={{ flex: 1 }}
        >
          Мої бронювання
        </Typography>
      </Box>
      <Box maxWidth={1200} mx="auto" p={{ xs: 2, md: 5 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : bookings.length === 0 ? (
          <Alert severity="info">У вас ще немає бронювань.</Alert>
        ) : (
          <Stack spacing={4}>
            {bookings
              .sort(
                (a, b) =>
                  new Date(b.startTime).getTime() -
                  new Date(a.startTime).getTime()
              )
              .map((b, idx) => {
                const isCarWash = !!b.carWash;
                const isExternal = !!b.isExternal || !!b.externalAutoService;
                const icon = isCarWash
                  ? icons[1]
                  : isExternal
                  ? icons[4]
                  : icons[2];
                const name = isCarWash
                  ? b.carWash?.name
                  : isExternal
                  ? b.externalAutoService?.name || b.name
                  : b.service?.name;
                const address = isCarWash
                  ? b.carWash?.address
                  : isExternal
                  ? b.externalAutoService?.address || b.address
                  : b.service?.address;
                const city = isCarWash
                  ? b.carWash?.city
                  : isExternal
                  ? b.externalAutoService?.city || ""
                  : b.service?.city;
                const typeLabel = isCarWash
                  ? "Автомийка"
                  : isExternal
                  ? "Google-сервіс"
                  : "Авто-сервіс";
                const date = new Date(b.startTime);
                const end = new Date(b.endTime);
                return (
                  <Paper
                    key={b.id}
                    sx={{
                      p: { xs: 3, md: 5 },
                      borderRadius: 6,
                      boxShadow: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background:
                        "linear-gradient(100deg, #fff 0%, #e0eafc 100%)",
                      width: "100%",
                      mx: "auto",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: isCarWash
                          ? "primary.main"
                          : isExternal
                          ? "info.main"
                          : "secondary.main",
                        color: "white",
                        width: 70,
                        height: 70,
                        fontSize: 38,
                        mr: 3,
                        boxShadow: 3,
                      }}
                    >
                      {icon}
                    </Avatar>
                    <Box flex={1} minWidth={0}>
                      <Typography variant="h5" fontWeight={900} mb={0.5}>
                        {name}
                      </Typography>
                      {isExternal && b.serviceType && (
                        <Typography
                          fontWeight={700}
                          color="primary.main"
                          mb={0.5}
                        >
                          Послуга:{" "}
                          {SERVICE_TYPE_LABELS[b.serviceType] || b.serviceType}
                        </Typography>
                      )}
                      <Typography variant="body1" color="text.secondary" mb={1}>
                        {address}
                        {city ? `, ${city}` : ""}
                      </Typography>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        mb={1}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        <Chip
                          label={typeLabel}
                          color={
                            isCarWash
                              ? "primary"
                              : isExternal
                              ? "info"
                              : "secondary"
                          }
                          sx={{
                            fontWeight: 700,
                            fontSize: 16,
                            px: 2,
                            borderRadius: 2,
                          }}
                        />
                        <Chip
                          label={
                            date.toLocaleDateString("uk-UA", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }) +
                            ", " +
                            date.toLocaleTimeString("uk-UA", {
                              hour: "2-digit",
                              minute: "2-digit",
                            }) +
                            " - " +
                            end.toLocaleTimeString("uk-UA", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          }
                          icon={<EventIcon />}
                          sx={{
                            fontWeight: 700,
                            fontSize: 16,
                            px: 2,
                            borderRadius: 2,
                          }}
                        />
                        {b.status && (
                          <Chip
                            label={
                              b.status === "pending"
                                ? "Очікує"
                                : b.status === "confirmed"
                                ? "Підтверджено"
                                : b.status === "completed"
                                ? "Завершено"
                                : b.status === "cancelled"
                                ? "Скасовано"
                                : b.status
                            }
                            color={
                              b.status === "pending"
                                ? "default"
                                : b.status === "confirmed"
                                ? "success"
                                : b.status === "completed"
                                ? "primary"
                                : b.status === "cancelled"
                                ? "error"
                                : "default"
                            }
                            sx={{
                              fontWeight: 700,
                              fontSize: 16,
                              px: 2,
                              borderRadius: 2,
                            }}
                          />
                        )}
                      </Stack>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mt: 2,
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="primary"
                          sx={{
                            fontWeight: 700,
                            borderRadius: 2,
                            px: 3,
                            whiteSpace: "nowrap",
                          }}
                          onClick={() =>
                            window.open(
                              getGoogleCalendarUrl(
                                b,
                                name,
                                address,
                                city,
                                isExternal
                              ),
                              "_blank"
                            )
                          }
                        >
                          Додати в календар
                        </Button>
                      </Box>
                      {b.totalPrice && (
                        <Typography fontWeight={700} color="secondary.main">
                          Вартість: {Number(b.totalPrice).toFixed(2)} грн
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                );
              })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
