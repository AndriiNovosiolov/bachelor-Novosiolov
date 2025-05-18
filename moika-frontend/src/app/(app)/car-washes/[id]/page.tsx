"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Card,
} from "@mui/material";
import { carWashService } from "@/services/carWashService";
import { serviceService } from "@/services/serviceService";
import AddIcon from "@mui/icons-material/Add";
import { jwtDecode } from "jwt-decode";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  DirectionsRenderer,
} from "@react-google-maps/api";
import EventIcon from "@mui/icons-material/Event";
import { bookingService } from "@/services/bookingService";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BuildIcon from "@mui/icons-material/Build";
import StarIcon from "@mui/icons-material/Star";
import PlaceIcon from "@mui/icons-material/Place";
import Fade from "@mui/material/Fade";
import LocalCarWashIcon from "@mui/icons-material/LocalCarWash";
import { reviewService } from "@/services/reviewService";
import Rating from "@mui/material/Rating";
import Grid from "@mui/material/Grid";

// Google Map wrapper component
function GoogleMapWrapper({
  lat,
  lng,
  name,
  height = 500,
}: {
  lat: number;
  lng: number;
  name: string;
  height?: number;
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [directions, setDirections] = useState<any>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => setUserPos(null)
      );
    }
  }, []);

  useEffect(() => {
    if (userPos && isLoaded) {
      const directionsService = new (
        window as any
      ).google.maps.DirectionsService();
      directionsService.route(
        {
          origin: userPos,
          destination: { lat, lng },
          travelMode: "DRIVING",
        },
        (result: any, status: string) => {
          if (status === "OK") setDirections(result);
        }
      );
    }
  }, [userPos, isLoaded, lat, lng]);

  if (!isLoaded || isNaN(lat) || isNaN(lng))
    return (
      <Box
        height={height}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height }}
      center={{ lat, lng }}
      zoom={15}
    >
      <Marker position={{ lat, lng }} title={name} />
      {userPos && directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
}

export default function CarWashDetailPage() {
  const { id } = useParams();
  const [carWash, setCarWash] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [servicesToAdd, setServicesToAdd] = useState([
    { name: "", description: "", durationMinutes: "", price: "" },
  ]);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState("");
  const [serviceSuccess, setServiceSuccess] = useState("");
  const [calendarModal, setCalendarModal] = useState<{
    open: boolean;
    service: any | null;
  }>({ open: false, service: null });
  const [calendarDate, setCalendarDate] = useState("");
  const [calendarTime, setCalendarTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [editService, setEditService] = useState<any | null>(null);
  const [editServiceModalOpen, setEditServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    durationMinutes: "",
    price: "",
  });
  const [serviceActionLoading, setServiceActionLoading] = useState(false);
  const [serviceActionError, setServiceActionError] = useState("");
  const [serviceActionSuccess, setServiceActionSuccess] = useState("");
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");

  // Витягуємо userId з токена
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

  const days = [
    { key: "monday", label: "Понеділок" },
    { key: "tuesday", label: "Вівторок" },
    { key: "wednesday", label: "Середа" },
    { key: "thursday", label: "Четвер" },
    { key: "friday", label: "П'ятниця" },
    { key: "saturday", label: "Субота" },
    { key: "sunday", label: "Неділя" },
  ];

  const sizeLabels: Record<string, string> = {
    micro: "Мікроавто",
    sedan: "Седан",
    suv: "Позашляховик/Джип",
    minivan: "Мінівен",
    pickup: "Пікап",
    other: "Інше",
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    carWashService
      .getById(id as string)
      .then((res: { data: any }) => setCarWash(res.data))
      .catch(() => setError("Не вдалося завантажити дані автомийки"))
      .finally(() => setLoading(false));
    reviewService
      .getByCarWash(id as string)
      .then((res: { data: any[] }) => setReviews(res.data))
      .catch(() => setReviews([]));
    // Додаю запит на рейтинг
    carWashService
      .getAverageRating(id as string)
      .then((res: { data: any }) => setAverageRating(res.data.averageRating))
      .catch(() => setAverageRating(null));
  }, [id]);

  const handleServiceFieldChange = (
    idx: number,
    field: string,
    value: string
  ) => {
    setServicesToAdd((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  };
  const handleAddServiceRow = () => {
    setServicesToAdd((prev) => [
      ...prev,
      { name: "", description: "", durationMinutes: "", price: "" },
    ]);
  };
  const handleRemoveServiceRow = (idx: number) => {
    setServicesToAdd((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)
    );
  };
  const handleSubmitServices = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carWash) return;
    setServiceLoading(true);
    setServiceError("");
    setServiceSuccess("");
    try {
      for (const s of servicesToAdd) {
        await serviceService.create(carWash.id, {
          name: s.name,
          description: s.description,
          //   duration: Number(s.durationMinutes),
          durationMinutes: Number(s.durationMinutes),
          price: Number(s.price),
        });
      }
      setServiceSuccess("Сервіси додано!");
      setServicesToAdd([
        { name: "", description: "", durationMinutes: "", price: "" },
      ]);
      setServiceModalOpen(false);
      // Оновити дані автомийки
      carWashService
        .getById(carWash.id)
        .then((res: { data: any }) => setCarWash(res.data));
    } catch {
      setServiceError("Помилка додавання сервісів");
    } finally {
      setServiceLoading(false);
    }
  };

  // Визначаємо доступні дати (дні, коли мийка працює)
  const availableDays = useMemo(() => {
    if (!carWash?.workingHours) return [];
    return Object.entries(carWash.workingHours)
      .filter(
        ([_, wh]: any) =>
          wh.open && wh.close && wh.open !== "" && wh.close !== ""
      )
      .map(([key]) => key);
  }, [carWash]);

  // Визначаємо доступні години для вибраної дати
  const getAvailableTimes = (dateStr: string, service: any) => {
    if (!carWash?.workingHours || !dateStr || !service) return [];
    const dayOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][new Date(dateStr).getDay()];
    const wh = carWash.workingHours[dayOfWeek];
    if (!wh || !wh.open || !wh.close) return [];
    const [openH, openM] = wh.open.split(":").map(Number);
    const [closeH, closeM] = wh.close.split(":").map(Number);
    const times = [];
    let cur = new Date(dateStr + "T" + wh.open);
    const end = new Date(dateStr + "T" + wh.close);
    while (cur <= end) {
      times.push(cur.toTimeString().slice(0, 5));
      cur = new Date(cur.getTime() + service.durationMinutes * 60000);
    }
    return times;
  };

  useEffect(() => {
    if (calendarModal.open && calendarModal.service && calendarDate) {
      bookingService
        .getAvailableSlots({
          carWashId: carWash.id,
          serviceId: calendarModal.service.id,
          date: calendarDate,
        })
        .then((res: { data: string[] }) => setAvailableSlots(res.data || []));
    } else {
      setAvailableSlots([]);
    }
  }, [calendarModal.open, calendarModal.service, calendarDate, carWash]);

  // Масив іконок для різноманіття hero-блоку
  const heroIcons = [
    <LocalCarWashIcon fontSize="inherit" key="wash" />,
    <DirectionsCarIcon fontSize="inherit" key="car" />,
    <BuildIcon fontSize="inherit" key="build" />,
    <StarIcon fontSize="inherit" key="star" />,
    <PlaceIcon fontSize="inherit" key="place" />,
  ];
  // Вибір іконки для hero (по id або випадково)
  const heroIcon = carWash?.id
    ? heroIcons[parseInt(carWash.id.replace(/\D/g, ""), 10) % heroIcons.length]
    : heroIcons[0];

  // Отримати рекомендацію при відкритті модалки
  useEffect(() => {
    setRecommendation(null);
    setRecommendationError("");
    if (calendarModal.open && calendarModal.service && userId) {
      setRecommendationLoading(true);
      bookingService
        .getRecommendation({
          userId,
          carWashId: carWash.id,
          serviceId: calendarModal.service.id,
        })
        .then((res: { data: any }) => setRecommendation(res.data))
        .catch(() => setRecommendationError("Не вдалося отримати рекомендацію"))
        .finally(() => setRecommendationLoading(false));
    }
  }, [calendarModal.open, calendarModal.service, userId, carWash]);

  if (loading)
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box p={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  if (!carWash) return null;

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
      {/* HERO BLOCK */}
      <Fade in timeout={600}>
        <Box
          sx={{
            width: "100%",
            maxWidth: 1200,
            mx: "auto",
            mb: 5,
            borderRadius: 8,
            background: "linear-gradient(100deg, #b6e0fe 0%, #e0c3fc 100%)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
            p: { xs: 3, md: 6 },
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Avatar
            sx={{
              width: 90,
              height: 90,
              bgcolor: "primary.main",
              fontSize: 54,
              fontWeight: 700,
              boxShadow: 4,
            }}
          >
            {heroIcon}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography
              variant="h3"
              fontWeight={900}
              color="primary.main"
              mb={1}
              letterSpacing={1}
            >
              {carWash.name}
            </Typography>
            <Stack direction="row" spacing={2} mb={1} alignItems="center">
              <Chip
                label={carWash.isActive ? "Активна" : "Неактивна"}
                color={carWash.isActive ? "success" : "default"}
                sx={{ fontWeight: 700, fontSize: 18, px: 2, borderRadius: 2 }}
              />
              {averageRating !== null && (
                <Chip
                  icon={<StarIcon />}
                  label={`Рейтинг: ${averageRating.toFixed(2)}`}
                  color="warning"
                  sx={{ fontWeight: 700, fontSize: 18 }}
                />
              )}
            </Stack>
            <Typography variant="h6" color="primary.dark" mb={0.5}>
              {carWash.address}
              {carWash.city ? `, ${carWash.city}` : ""}
            </Typography>
            {carWash.description && (
              <Typography variant="body1" color="text.secondary" mb={1}>
                {carWash.description}
              </Typography>
            )}
            {/* Додаю секцію підтримуваних типів авто */}
            {Array.isArray(carWash.supportedSizes) &&
              carWash.supportedSizes.length > 0 && (
                <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
                  <Typography fontWeight={700} color="primary.main" mr={1}>
                    Підтримувані типи авто:
                  </Typography>
                  {carWash.supportedSizes.map((size: string) => (
                    <Chip
                      key={size}
                      label={sizeLabels[size] || size}
                      color="info"
                      size="small"
                    />
                  ))}
                </Box>
              )}
            {carWash.photos && carWash.photos.length > 0 && (
              <Stack direction="row" spacing={2} mt={2}>
                {carWash.photos.map((url: string, idx: number) => (
                  <Avatar
                    key={idx}
                    src={url}
                    variant="rounded"
                    sx={{ width: 120, height: 80, boxShadow: 2 }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      </Fade>
      {/* MAP BLOCK */}
      {carWash.latitude && carWash.longitude && (
        <Fade in timeout={800}>
          <Box
            mb={4}
            width="100%"
            maxWidth={1200}
            mx="auto"
            sx={{ overflow: "visible" }}
            borderRadius={10}
          >
            <Paper
              sx={{
                height: 500,
                width: "100%",
                borderRadius: 10,
                boxShadow: 8,
                background: "linear-gradient(100deg, #e0eafc 0%, #cfdef3 100%)",
                overflow: "visible",
                mb: 2,
                p: 0,
              }}
            >
              <GoogleMapWrapper
                lat={Number(carWash.latitude)}
                lng={Number(carWash.longitude)}
                name={carWash.name}
                height={500}
              />
            </Paper>
          </Box>
        </Fade>
      )}
      {/* SERVICES BLOCK */}
      <Fade in timeout={1000}>
        <Box width="100%" maxWidth={1200} mx="auto" mb={4}>
          <Typography variant="h5" fontWeight={900} color="primary.main" mb={2}>
            🚗 Сервіси
          </Typography>
          {/* Кнопка додати сервіс для owner */}
          {userId === carWash.ownerId && (
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                sx={{ fontWeight: 700, borderRadius: 2, px: 4 }}
                onClick={() => {
                  setServiceForm({
                    name: "",
                    description: "",
                    durationMinutes: "",
                    price: "",
                  });
                  setEditService(null);
                  setEditServiceModalOpen(true);
                }}
              >
                Додати сервіс
              </Button>
            </Box>
          )}
          <Grid
            container
            spacing={6}
            mb={3}
            justifyContent="center"
            alignItems="stretch"
            sx={{ flexWrap: "wrap" }}
          >
            {carWash.services && carWash.services.length > 0 ? (
              carWash.services.map((s: any, idx: number) => {
                const serviceIcons = [
                  <BuildIcon fontSize="large" key="build" />,
                  <DirectionsCarIcon fontSize="large" key="car" />,
                  <StarIcon fontSize="large" key="star" />,
                ];
                const icon = serviceIcons[idx % serviceIcons.length];
                return (
                  <Grid item xs={12} md={6} key={s.id}>
                    <Card
                      sx={{
                        p: 4,
                        borderRadius: 4,
                        boxShadow: 10,
                        transition: "box-shadow 0.2s",
                        "&:hover": {
                          boxShadow: 16,
                          borderColor: "primary.main",
                          transform: "translateY(-2px) scale(1.01)",
                        },
                        bgcolor:
                          "linear-gradient(100deg, #fff 0%, #e0eafc 100%)",
                        mb: 2,
                        minWidth: 400,
                        maxWidth: 600,
                        minHeight: 220,
                        alignItems: "stretch",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Box
                        width="100%"
                        display="flex"
                        alignItems="center"
                        gap={3}
                        mb={2}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            color: "white",
                            width: 80,
                            height: 80,
                            fontSize: 40,
                          }}
                        >
                          {icon}
                        </Avatar>
                        <Box flex={1} minWidth={0}>
                          <Typography variant="h5" fontWeight={900} mb={0.5}>
                            {s.name}
                          </Typography>
                          <Typography
                            variant="body1"
                            color="text.secondary"
                            mb={1}
                          >
                            {s.description}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        width="100%"
                        display="flex"
                        alignItems="flex-end"
                        justifyContent="space-between"
                        mt={2}
                      >
                        <Box>
                          <Typography
                            variant="body1"
                            color="primary.main"
                            fontWeight={700}
                            mb={0.5}
                          >
                            Тривалість:
                          </Typography>
                          <Typography
                            variant="h6"
                            color="primary.main"
                            fontWeight={900}
                          >
                            {s.durationMinutes} хв
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="body1"
                            color="secondary.main"
                            fontWeight={700}
                            mb={0.5}
                          >
                            Ціна:
                          </Typography>
                          <Typography
                            variant="h6"
                            color="secondary.main"
                            fontWeight={900}
                          >
                            {Number(s.price).toFixed(2)} грн
                          </Typography>
                        </Box>
                      </Box>
                      {/* Owner-кнопки редагування/видалення */}
                      {userId === carWash.ownerId && (
                        <Box display="flex" gap={2} mt={2}>
                          <Button
                            variant="outlined"
                            color="primary"
                            sx={{ fontWeight: 700, borderRadius: 2, px: 3 }}
                            onClick={() => {
                              setEditService(s);
                              setServiceForm({
                                name: s.name,
                                description: s.description,
                                durationMinutes: s.durationMinutes.toString(),
                                price: s.price.toString(),
                              });
                              setEditServiceModalOpen(true);
                            }}
                          >
                            Редагувати
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            sx={{ fontWeight: 700, borderRadius: 2, px: 3 }}
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  "Ви впевнені, що хочете видалити цей сервіс?"
                                )
                              )
                                return;
                              setServiceActionLoading(true);
                              setServiceActionError("");
                              try {
                                await serviceService.delete(s.id);
                                carWashService
                                  .getById(carWash.id)
                                  .then((res: { data: any }) =>
                                    setCarWash(res.data)
                                  );
                              } catch {
                                setServiceActionError(
                                  "Помилка видалення сервісу"
                                );
                              } finally {
                                setServiceActionLoading(false);
                              }
                            }}
                          >
                            Видалити
                          </Button>
                        </Box>
                      )}
                      <Box
                        width="100%"
                        display="flex"
                        justifyContent="flex-end"
                        mt={3}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<EventIcon />}
                          sx={{
                            width: "100%",
                            borderRadius: 3,
                            fontWeight: 900,
                            px: 4,
                            py: 1.5,
                            fontSize: 20,
                            boxShadow: 3,
                          }}
                          onClick={() => {
                            setCalendarModal({ open: true, service: s });
                            setCalendarDate("");
                            setCalendarTime("");
                          }}
                        >
                          GOOGLE CALENDAR
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                );
              })
            ) : (
              <Typography color="text.secondary" ml={2}>
                Немає сервісів
              </Typography>
            )}
          </Grid>
          {/* Модалка додавання/редагування сервісу */}
          <Dialog
            open={editServiceModalOpen}
            onClose={() => setEditServiceModalOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                background: "linear-gradient(100deg, #b6e0fe 0%, #e0c3fc 100%)",
                borderRadius: 4,
              },
            }}
          >
            <DialogTitle
              sx={{
                fontWeight: 800,
                fontSize: 26,
                color: "primary.main",
                textAlign: "center",
                letterSpacing: 1,
              }}
            >
              {editService ? "Редагувати сервіс" : "Додати сервіс"}
            </DialogTitle>
            <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setServiceActionLoading(true);
                  setServiceActionError("");
                  setServiceActionSuccess("");
                  try {
                    if (editService) {
                      await serviceService.update(editService.id, {
                        ...editService,
                        ...serviceForm,
                        durationMinutes: Number(serviceForm.durationMinutes),
                        price: Number(serviceForm.price),
                      });
                      setServiceActionSuccess("Сервіс оновлено!");
                    } else {
                      await serviceService.create(carWash.id, {
                        ...serviceForm,
                        durationMinutes: Number(serviceForm.durationMinutes),
                        price: Number(serviceForm.price),
                      });
                      setServiceActionSuccess("Сервіс додано!");
                    }
                    setEditServiceModalOpen(false);
                    carWashService
                      .getById(carWash.id)
                      .then((res: { data: any }) => setCarWash(res.data));
                  } catch {
                    setServiceActionError("Помилка збереження сервісу");
                  } finally {
                    setServiceActionLoading(false);
                  }
                }}
              >
                <TextField
                  label="Назва"
                  value={serviceForm.name}
                  onChange={(e) =>
                    setServiceForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  fullWidth
                  sx={{ mb: 2, bgcolor: "#fff", borderRadius: 2 }}
                />
                <TextField
                  label="Опис"
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  required
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                  sx={{ mb: 2, bgcolor: "#fff", borderRadius: 2 }}
                />
                <TextField
                  label="Тривалість (хв)"
                  type="number"
                  value={serviceForm.durationMinutes}
                  onChange={(e) =>
                    setServiceForm((f) => ({
                      ...f,
                      durationMinutes: e.target.value,
                    }))
                  }
                  required
                  fullWidth
                  sx={{ mb: 2, bgcolor: "#fff", borderRadius: 2 }}
                />
                <TextField
                  label="Ціна (грн)"
                  type="number"
                  value={serviceForm.price}
                  onChange={(e) =>
                    setServiceForm((f) => ({ ...f, price: e.target.value }))
                  }
                  required
                  fullWidth
                  sx={{ mb: 2, bgcolor: "#fff", borderRadius: 2 }}
                />
                {serviceActionError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {serviceActionError}
                  </Alert>
                )}
                {serviceActionSuccess && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {serviceActionSuccess}
                  </Alert>
                )}
                <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
                  <Button
                    onClick={() => setEditServiceModalOpen(false)}
                    color="secondary"
                    variant="outlined"
                    sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
                    disabled={serviceActionLoading}
                  >
                    Скасувати
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
                    disabled={serviceActionLoading}
                  >
                    {serviceActionLoading
                      ? editService
                        ? "Зберігаємо..."
                        : "Додаємо..."
                      : editService
                      ? "Зберегти"
                      : "Додати"}
                  </Button>
                </DialogActions>
              </form>
            </DialogContent>
          </Dialog>
        </Box>
      </Fade>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" mb={2} fontWeight={900} color="primary.main">
        🕒 Розклад роботи
      </Typography>
      <List
        sx={{
          mb: 3,
          bgcolor: "transparent",
          borderRadius: 3,
          boxShadow: 0,
          p: 0,
        }}
      >
        {carWash.workingHours ? (
          days.map((d) => {
            const wh = carWash.workingHours[d.key];
            const isWorking =
              wh && wh.open && wh.close && wh.open !== "" && wh.close !== "";
            return (
              <ListItem
                key={d.key}
                sx={{
                  bgcolor: isWorking
                    ? "linear-gradient(90deg, #e0fce0 0%, #c8f7c5 100%)"
                    : "linear-gradient(90deg, #f5f5f5 0%, #e0e0e0 100%)",
                  borderRadius: 3,
                  mb: 2,
                  boxShadow: isWorking ? 4 : 1,
                  border: isWorking
                    ? "1.5px solid #7ed957"
                    : "1.5px solid #eee",
                  display: "flex",
                  alignItems: "center",
                  px: 3,
                  py: 2,
                  minHeight: 64,
                  gap: 2,
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {isWorking ? (
                    <EventAvailableIcon color="success" sx={{ fontSize: 32 }} />
                  ) : (
                    <EventBusyIcon color="disabled" sx={{ fontSize: 32 }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography fontWeight={800} fontSize={18}>
                      {d.label}
                    </Typography>
                  }
                  secondary={
                    isWorking ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color: "var(--mui-palette-text-secondary)",
                          fontWeight: 600,
                          fontSize: 16,
                        }}
                      >
                        <AccessTimeIcon
                          fontSize="medium"
                          style={{ marginRight: 6 }}
                        />
                        {wh.open} - {wh.close}
                      </span>
                    ) : (
                      <Typography
                        color="error"
                        fontWeight={700}
                        component="span"
                        fontSize={16}
                      >
                        Вихідний
                      </Typography>
                    )
                  }
                />
              </ListItem>
            );
          })
        ) : (
          <Typography color="text.secondary" ml={2}>
            Немає розкладу
          </Typography>
        )}
      </List>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" mb={1} fontWeight={900} color="primary.main">
        💬 Відгуки
      </Typography>
      <Stack spacing={3}>
        {reviews && reviews.length > 0 ? (
          reviews.map((r: any) => (
            <Box
              key={r.id}
              sx={{
                p: 3,
                bgcolor: "linear-gradient(100deg, #f5fafd 0%, #e0eafc 100%)",
                borderRadius: 5,
                boxShadow: 6,
                maxWidth: 600,
                position: "relative",
                ml: 2,
                "&:before": {
                  content: '""',
                  position: "absolute",
                  left: -18,
                  top: 24,
                  width: 0,
                  height: 0,
                  borderTop: "12px solid transparent",
                  borderBottom: "12px solid transparent",
                  borderRight: "18px solid #e0eafc",
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={0.5}>
                <Rating
                  value={Number(r.rating)}
                  readOnly
                  precision={0.5}
                  size="medium"
                />
                {r.user && (
                  <Typography
                    fontWeight={600}
                    color="primary.main"
                    fontSize={16}
                  >
                    {r.user.firstName} {r.user.lastName}
                  </Typography>
                )}
              </Box>
              <Typography variant="body1" fontStyle="italic" mb={1}>
                {r.comment}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(r.createdAt).toLocaleString()}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography color="text.secondary" ml={2}>
            Відгуків ще немає
          </Typography>
        )}
      </Stack>
      {/* Форма для залишення відгуку */}
      {userId && carWash && userId !== carWash.ownerId && (
        <Box
          mt={4}
          maxWidth="100%"
          width="100%"
          p={{ xs: 2, md: 4 }}
          sx={{
            background: "linear-gradient(100deg, #e0eafc 0%, #cfdef3 100%)",
            borderRadius: 5,
            boxShadow: 8,
            mx: "auto",
          }}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setReviewLoading(true);
              setReviewError("");
              setReviewSuccess("");
              try {
                await reviewService.create(carWash.id, {
                  userId,
                  rating: reviewForm.rating,
                  comment: reviewForm.comment,
                });
                setReviewSuccess("Відгук додано!");
                setReviewForm({ rating: 5, comment: "" });
                // Оновити список відгуків
                const res = await reviewService.getByCarWash(carWash.id);
                setReviews(res.data);
              } catch (err: any) {
                setReviewError(
                  err?.response?.data?.message || "Помилка додавання відгуку"
                );
              } finally {
                setReviewLoading(false);
              }
            }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography fontWeight={600} fontSize={20}>
                Обери оцінку:
              </Typography>
              <Rating
                value={reviewForm.rating}
                onChange={(_, v) =>
                  setReviewForm((f) => ({ ...f, rating: v || 1 }))
                }
                precision={1}
                size="large"
              />
            </Box>
            <TextField
              label="Ваш коментар"
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm((f) => ({ ...f, comment: e.target.value }))
              }
              fullWidth
              multiline
              minRows={2}
              maxRows={5}
              required
              sx={{ mb: 2, bgcolor: "#fff", borderRadius: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={reviewLoading || !reviewForm.comment.trim()}
              sx={{
                fontWeight: 700,
                fontSize: 18,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                boxShadow: 2,
              }}
            >
              {reviewLoading ? "Відправка..." : "Залишити відгук"}
            </Button>
            {reviewError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {reviewError}
              </Alert>
            )}
            {reviewSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {reviewSuccess}
              </Alert>
            )}
          </form>
        </Box>
      )}
      {/* Модалка Google Calendar */}
      <Dialog
        open={calendarModal.open}
        onClose={() => setCalendarModal({ open: false, service: null })}
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontSize: 22, color: "primary.main" }}
        >
          Бронювання через Google Calendar
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {/* Рекомендація */}
            {recommendationLoading && (
              <Alert severity="info">
                Завантаження персональної рекомендації...
              </Alert>
            )}
            {recommendationError && (
              <Alert severity="error">{recommendationError}</Alert>
            )}
            {recommendation && recommendation.slot && (
              <Alert
                severity="success"
                sx={{ fontWeight: 700, fontSize: 18, mb: 1 }}
              >
                Рекомендуємо вам:{" "}
                {new Date(recommendation.slot.date).toLocaleDateString(
                  "uk-UA",
                  { weekday: "long" }
                )}
                , {recommendation.slot.time}
                {recommendation.weather && (
                  <>
                    <br />
                    <span style={{ fontWeight: 500, fontSize: 16 }}>
                      Погода:{" "}
                      {recommendation.weather.weather?.[0]?.description || "-"},{" "}
                      {Math.round(recommendation.weather.main?.temp)}°C
                    </span>
                  </>
                )}
                <Box mt={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                    onClick={() => {
                      setCalendarDate(recommendation.slot.date);
                      setCalendarTime(recommendation.slot.time);
                    }}
                  >
                    Записатись на цей час
                  </Button>
                </Box>
              </Alert>
            )}
            {recommendation && recommendation.message && (
              <Alert severity="warning">{recommendation.message}</Alert>
            )}
            <TextField
              label="Оберіть дату"
              type="date"
              value={calendarDate}
              onChange={(e) => setCalendarDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            {calendarDate && calendarModal.service && (
              <TextField
                select
                label="Оберіть час"
                value={calendarTime}
                onChange={(e) => setCalendarTime(e.target.value)}
                fullWidth
                required
                helperText="Зайняті слоти недоступні для вибору"
              >
                {getAvailableTimes(calendarDate, calendarModal.service).map(
                  (t: string) => {
                    const isRecommended =
                      recommendation &&
                      recommendation.slot &&
                      recommendation.slot.date === calendarDate &&
                      recommendation.slot.time === t;
                    return (
                      <MenuItem
                        key={t}
                        value={t}
                        disabled={!availableSlots.includes(t)}
                        sx={
                          isRecommended
                            ? { bgcolor: "#e0fce0", fontWeight: 700 }
                            : {}
                        }
                      >
                        {t} {!availableSlots.includes(t) ? " (Зайнято)" : ""}
                        {isRecommended ? " (Рекомендовано)" : ""}
                      </MenuItem>
                    );
                  }
                )}
              </TextField>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setCalendarModal({ open: false, service: null })}
            color="secondary"
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Скасувати
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={
              bookingLoading ||
              !calendarDate ||
              !calendarTime ||
              !availableSlots.includes(calendarTime)
            }
            sx={{ borderRadius: 2, fontWeight: 600, px: 3, boxShadow: 2 }}
            onClick={async () => {
              if (!calendarModal.service || !calendarDate || !calendarTime)
                return;
              setBookingLoading(true);
              setBookingError("");
              try {
                const s = calendarModal.service;
                const start = new Date(`${calendarDate}T${calendarTime}`);
                const end = new Date(
                  start.getTime() + (s.durationMinutes || 30) * 60000
                );
                const pad = (n: number) => n.toString().padStart(2, "0");
                const formatDate = (d: Date) =>
                  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(
                    d.getUTCDate()
                  )}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
                const dates = `${formatDate(start)}/${formatDate(end)}`;
                const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                  s.name
                )}&dates=${dates}&details=${encodeURIComponent(
                  s.description
                )}&location=${encodeURIComponent(
                  carWash.address + ", " + carWash.city
                )}`;
                // bookingService.create
                if (!userId) throw new Error("Не знайдено користувача");
                const price = Number(s.price);
                if (!price || isNaN(price) || price <= 0) {
                  setBookingError("Ціна сервісу некоректна!");
                  setBookingLoading(false);
                  return;
                }
                await bookingService.create(userId, {
                  carWashId: carWash.id,
                  serviceId: s.id,
                  startTime: start.toISOString(),
                  endTime: end.toISOString(),
                  notes: "",
                  totalPrice: price,
                });
                setCalendarModal({ open: false, service: null });
                window.open(calUrl, "_blank");
              } catch (err: any) {
                setBookingError(
                  err?.response?.data?.message ||
                    err.message ||
                    "Помилка бронювання"
                );
              } finally {
                setBookingLoading(false);
              }
            }}
          >
            {bookingLoading ? "Бронюємо..." : "ДОДАТИ У GOOGLE CALENDAR"}
          </Button>
          {bookingError && (
            <Box width="100%" mt={2}>
              <Alert severity="error">{bookingError}</Alert>
            </Box>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
