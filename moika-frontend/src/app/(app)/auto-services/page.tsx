"use client";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Paper,
  Button,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
} from "@mui/material";
import { useState, useEffect } from "react";
import { carWashService } from "@/services/carWashService";
import { autoService } from "@/services/autoService";
import { reviewService } from "@/services/reviewService";
import { jwtDecode } from "jwt-decode";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useRouter } from "next/navigation";
import { bookingService } from "@/services/bookingService";
import apiService from "@/services/api";

const SERVICE_TYPES = [
  { value: "oil_change", label: "Заміна масла" },
  { value: "polishing", label: "Полірування" },
  { value: "chemical_cleaning", label: "Хімчистка" },
  { value: "diagnostics", label: "Діагностика" },
  { value: "tire_service", label: "Шиномонтаж" },
  { value: "other", label: "Інше" },
];

export default function AutoServicesPage() {
  const [carWashes, setCarWashes] = useState<any[]>([]);
  const [carWashesLoading, setCarWashesLoading] = useState(false);
  const [carWashesError, setCarWashesError] = useState("");
  const [carWashId, setCarWashId] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [filterType, setFilterType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState("");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [compareResult, setCompareResult] = useState<any[]>([]);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState("");
  const [requestError, setRequestError] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [externalServices, setExternalServices] = useState<any[]>([]);
  const [externalLoading, setExternalLoading] = useState(false);
  const [externalError, setExternalError] = useState("");
  const [externalSuccess, setExternalSuccess] = useState("");
  const [searchParams, setSearchParams] = useState({
    lat: "",
    lng: "",
    radius: "300",
    type: "car_repair",
  });
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });
  const [bookingModal, setBookingModal] = useState<{
    open: boolean;
    service: any | null;
  }>({ open: false, service: null });
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    service: any | null;
  }>({ open: false, service: null });
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [reviewModalRating, setReviewModalRating] = useState(5);
  const [reviewModalComment, setReviewModalComment] = useState("");
  const [reviewModalLoading, setReviewModalLoading] = useState(false);
  const [reviewModalSuccess, setReviewModalSuccess] = useState("");
  const [reviewModalError, setReviewModalError] = useState("");
  const [serviceType, setServiceType] = useState("oil_change");
  const [reviewServiceType, setReviewServiceType] = useState("oil_change");
  const router = useRouter();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSearchParams((p) => ({
            ...p,
            lat: pos.coords.latitude.toFixed(6),
            lng: pos.coords.longitude.toFixed(6),
          }));
          handleExternalSearch({
            lat: pos.coords.latitude.toFixed(6),
            lng: pos.coords.longitude.toFixed(6),
          });
        },
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    if (searchParams.lat && searchParams.lng && searchParams.radius) {
      handleExternalSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.radius]);

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
    setCarWashesLoading(true);
    carWashService
      .getAll()
      .then((res) => setCarWashes(res.data))
      .catch(() => setCarWashesError("Не вдалося завантажити автомийки"))
      .finally(() => setCarWashesLoading(false));
  }, []);

  const fetchServices = () => {
    setServicesLoading(true);
    setServicesError("");
    autoService
      .getAll({
        type: filterType || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
      })
      .then((res) => setServices(res.data))
      .catch(() => setServicesError("Не вдалося завантажити сервіси"))
      .finally(() => setServicesLoading(false));
  };
  useEffect(() => {
    fetchServices();
  }, [filterType, minPrice, maxPrice, minRating]);

  useEffect(() => {
    if (!carWashes[0]) return;
    setReviewsLoading(true);
    reviewService
      .getByCarWash(carWashes[0].id)
      .then((res) => setReviews(res.data))
      .catch(() => setReviewsError("Не вдалося завантажити відгуки"))
      .finally(() => setReviewsLoading(false));
  }, [carWashes]);

  const handleCreateRequest = async (e: any) => {
    e.preventDefault();
    setRequestLoading(true);
    setRequestSuccess("");
    setRequestError("");
    try {
      await autoService.createRequest({ type, description, carWashId });
      setRequestSuccess("Запит успішно створено!");
      setType("");
      setDescription("");
      setCarWashId("");
    } catch {
      setRequestError("Не вдалося створити запит");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleCompare = async () => {
    setCompareLoading(true);
    setCompareError("");
    try {
      const res = await autoService.compare(compareIds);
      setCompareResult(res.data);
    } catch {
      setCompareError("Не вдалося порівняти сервіси");
    } finally {
      setCompareLoading(false);
    }
  };

  const handleCreateReview = async () => {
    setReviewLoading(true);
    setReviewSuccess("");
    setReviewError("");
    try {
      if (!userId) throw new Error("Не знайдено користувача");
      await reviewService.create(carWashes[0].id, {
        userId,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSuccess("Відгук додано!");
      setReviewRating(5);
      setReviewComment("");
      const res = await reviewService.getByCarWash(carWashes[0].id);
      setReviews(res.data);
    } catch {
      setReviewError("Не вдалося залишити відгук");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleCompareToggle = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExternalSearch = async (
    paramsOverride?: Partial<typeof searchParams>
  ) => {
    setExternalLoading(true);
    setExternalError("");
    setExternalSuccess("");
    try {
      const params = { ...searchParams, ...paramsOverride };
      const res = await autoService.searchExternal({
        lat: Number(params.lat),
        lng: Number(params.lng),
        radius: params.radius ? Number(params.radius) : undefined,
        type: params.type,
      });
      setExternalServices(res.data);
    } catch {
      setExternalError("Не вдалося знайти сервіси Google");
    } finally {
      setExternalLoading(false);
    }
  };

  const ensureServiceSaved = async (service: any) => {
    try {
      const res = await autoService.saveExternal(service);
      return res.data;
    } catch {
      return null;
    }
  };

  const handleBookGoogleService = async (service: any) => {
    setExternalSuccess("");
    setExternalError("");
    const saved = await ensureServiceSaved(service);
    if (!saved || !saved.id) {
      setBookingError("Не вдалося зберегти сервіс");
      return;
    }
    setBookingModal({ open: true, service: saved });
    setBookingDate("");
    setBookingTime("");
    setBookingSuccess("");
    setBookingError("");
  };

  const handleReviewGoogleService = async (service: any) => {
    setExternalSuccess("");
    setExternalError("");
    const saved = await ensureServiceSaved(service);
    if (!saved || !saved.id) {
      setReviewModalError("Не вдалося зберегти сервіс");
      return;
    }
    setReviewModal({ open: true, service: saved });
    setReviewModalRating(5);
    setReviewModalComment("");
    setReviewModalSuccess("");
    setReviewModalError("");
  };

  const handleSubmitBooking = async (e: any) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingSuccess("");
    setBookingError("");
    try {
      if (!userId) throw new Error("Не знайдено користувача");
      if (!bookingModal.service) throw new Error("Не обрано сервіс");
      if (!bookingDate || !bookingTime) throw new Error("Вкажіть дату і час");
      const start = new Date(`${bookingDate}T${bookingTime}`);
      const end = new Date(start.getTime() + 60 * 60000); // 1 година, можна зробити гнучко
      const totalPrice = bookingModal.service.price || 500;
      const notes = "";
      if (bookingModal.service.placeId) {
        // Google-сервіс — правильний endpoint!
        const externalAutoServiceId = bookingModal.service.id;
        if (!externalAutoServiceId)
          throw new Error("Не знайдено externalAutoServiceId");
        await apiService.post(
          `/auto-services/external/${externalAutoServiceId}/bookings`,
          {
            externalAutoServiceId,
            serviceType,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            notes,
          }
        );
      } else {
        // Внутрішній сервіс
        await bookingService.create(userId, {
          serviceId: bookingModal.service.id,
          carWashId: bookingModal.service.carWashId || "",
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          totalPrice,
          notes,
        });
      }
      setBookingSuccess("Бронювання успішно створено!");
      setBookingModal({ open: false, service: null });
    } catch (err: any) {
      setBookingError(
        err?.response?.data?.message || err.message || "Помилка бронювання"
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSubmitReviewModal = async (e: any) => {
    e.preventDefault();
    setReviewModalLoading(true);
    setReviewModalSuccess("");
    setReviewModalError("");
    try {
      if (!userId) throw new Error("Не знайдено користувача");
      if (!reviewModal.service) throw new Error("Не обрано сервіс");
      if (!reviewModalComment.trim()) throw new Error("Введіть коментар");
      if (reviewModal.service.placeId) {
        // Google-сервіс — правильний endpoint!
        const externalAutoServiceId = reviewModal.service.id;
        if (!externalAutoServiceId)
          throw new Error("Не знайдено externalAutoServiceId");
        await apiService.post(
          `/auto-services/external/${externalAutoServiceId}/reviews`,
          {
            serviceType: reviewServiceType,
            rating: reviewModalRating,
            comment: reviewModalComment,
          }
        );
      } else {
        // Внутрішній сервіс
        await reviewService.create(reviewModal.service.carWashId, {
          userId,
          rating: reviewModalRating,
          comment: reviewModalComment,
        });
      }
      setReviewModalSuccess("Відгук успішно додано!");
      setReviewModal({ open: false, service: null });
    } catch (err: any) {
      setReviewModalError(
        err?.response?.data?.message || err.message || "Помилка відгуку"
      );
    } finally {
      setReviewModalLoading(false);
    }
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
          maxWidth: 1400,
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
          Авто-сервіси
        </Typography>
      </Box>
      <Box maxWidth={1200} mx="auto" p={{ xs: 2, md: 5 }}>
        {/* --- Модалка бронювання Google-сервісу --- */}
        <Dialog
          open={bookingModal.open}
          onClose={() => setBookingModal({ open: false, service: null })}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 8,
              boxShadow: 10,
              p: { xs: 2, md: 5 },
              background: "linear-gradient(100deg, #e0eafc 0%, #cfdef3 100%)",
              minWidth: 400,
            },
          }}
        >
          {bookingSuccess ? (
            <Box textAlign="center" py={5} px={2}>
              <Typography
                variant="h4"
                fontWeight={900}
                color="success.main"
                mb={2}
              >
                ✔️ Бронювання успішно створено!
              </Typography>
              <Typography variant="h5" fontWeight={700} mb={2}>
                {bookingModal.service?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={1}>
                {bookingModal.service?.address}
              </Typography>
              <Typography variant="h6" color="primary.main" mb={2}>
                {bookingDate} о {bookingTime}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  borderRadius: 3,
                  fontWeight: 800,
                  fontSize: 20,
                  px: 5,
                  py: 2,
                  mt: 2,
                }}
                onClick={() => {
                  setBookingModal({ open: false, service: null });
                  router.push("/booking");
                }}
              >
                Мої бронювання
              </Button>
            </Box>
          ) : (
            <>
              <DialogTitle
                sx={{
                  fontWeight: 900,
                  fontSize: 28,
                  color: "primary.main",
                  textAlign: "center",
                  letterSpacing: 1,
                }}
              >
                <span role="img" aria-label="calendar">
                  📅
                </span>{" "}
                Бронювання сервісу
              </DialogTitle>
              <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
                <Typography
                  fontWeight={800}
                  fontSize={22}
                  mb={1}
                  color="primary.main"
                  textAlign="center"
                >
                  {bookingModal.service?.name}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  mb={2}
                  textAlign="center"
                >
                  {bookingModal.service?.address}
                </Typography>
                <form onSubmit={handleSubmitBooking}>
                  <Stack spacing={3}>
                    <TextField
                      label="Дата"
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={{ fontSize: 20 }}
                    />
                    <TextField
                      label="Час"
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={{ fontSize: 20 }}
                    />
                    {bookingModal.open && bookingModal.service?.placeId && (
                      <TextField
                        select
                        label="Тип послуги"
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        fullWidth
                        required
                        sx={{ mb: 2, bgcolor: "#fff", borderRadius: 2 }}
                      >
                        {SERVICE_TYPES.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                    {bookingError && (
                      <Alert severity="error">{bookingError}</Alert>
                    )}
                    <DialogActions sx={{ justifyContent: "center", gap: 3 }}>
                      <Button
                        onClick={() =>
                          setBookingModal({ open: false, service: null })
                        }
                        color="secondary"
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                          fontWeight: 700,
                          fontSize: 18,
                          px: 4,
                          py: 1.5,
                        }}
                      >
                        Скасувати
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{
                          borderRadius: 3,
                          fontWeight: 900,
                          fontSize: 20,
                          px: 5,
                          py: 1.5,
                        }}
                        disabled={bookingLoading}
                      >
                        {bookingLoading ? "Бронюємо..." : "Забронювати"}
                      </Button>
                    </DialogActions>
                  </Stack>
                </form>
              </DialogContent>
            </>
          )}
        </Dialog>
        {/* --- Модалка відгуку Google-сервісу --- */}
        <Dialog
          open={reviewModal.open}
          onClose={() => setReviewModal({ open: false, service: null })}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 8,
              boxShadow: 10,
              p: { xs: 2, md: 5 },
              background: "linear-gradient(100deg, #e0eafc 0%, #cfdef3 100%)",
              minWidth: 400,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 900,
              fontSize: 28,
              color: "primary.main",
              textAlign: "center",
              letterSpacing: 1,
            }}
          >
            <span role="img" aria-label="star">
              ⭐
            </span>{" "}
            Залишити відгук
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
            <Typography
              fontWeight={800}
              fontSize={22}
              mb={1}
              color="primary.main"
              textAlign="center"
            >
              {reviewModal.service?.name}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              mb={2}
              textAlign="center"
            >
              {reviewModal.service?.address}
            </Typography>
            <form onSubmit={handleSubmitReviewModal}>
              <Stack spacing={3}>
                <Rating
                  value={reviewModalRating}
                  onChange={(_, v) => setReviewModalRating(v || 1)}
                  size="large"
                  sx={{ fontSize: 40, mx: "auto" }}
                />
                <TextField
                  label="Коментар"
                  value={reviewModalComment}
                  onChange={(e) => setReviewModalComment(e.target.value)}
                  multiline
                  minRows={3}
                  required
                  fullWidth
                  sx={{ fontSize: 20 }}
                />
                {reviewModal.open && reviewModal.service?.placeId && (
                  <TextField
                    select
                    label="Тип послуги"
                    value={reviewServiceType}
                    onChange={(e) => setReviewServiceType(e.target.value)}
                    fullWidth
                    required
                    sx={{ mb: 2, bgcolor: "#fff", borderRadius: 2 }}
                  >
                    {SERVICE_TYPES.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
                {reviewModalError && (
                  <Alert severity="error">{reviewModalError}</Alert>
                )}
                <DialogActions sx={{ justifyContent: "center", gap: 3 }}>
                  <Button
                    onClick={() =>
                      setReviewModal({ open: false, service: null })
                    }
                    color="secondary"
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      fontWeight: 700,
                      fontSize: 18,
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    Скасувати
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{
                      borderRadius: 3,
                      fontWeight: 900,
                      fontSize: 20,
                      px: 5,
                      py: 1.5,
                    }}
                    disabled={reviewModalLoading}
                  >
                    {reviewModalLoading ? "Відправка..." : "Залишити відгук"}
                  </Button>
                </DialogActions>
              </Stack>
            </form>
          </DialogContent>
        </Dialog>
        <Paper
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 8,
            mb: 5,
            boxShadow: 10,
            maxWidth: 1200,
            mx: "auto",
            background: "#fff",
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={2} color="primary.main">
            Найближчі автосервіси Google
          </Typography>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            mb={3}
            alignItems="center"
          >
            <TextField
              label="Радіус (м)"
              value={searchParams.radius}
              onChange={(e) =>
                setSearchParams((p) => ({ ...p, radius: e.target.value }))
              }
              sx={{ maxWidth: 180 }}
              type="number"
              inputProps={{ min: 500, step: 100 }}
            />
          </Stack>
          {externalError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {externalError}
            </Alert>
          )}
          {externalSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {externalSuccess}
            </Alert>
          )}
          {/* Google Map для знайдених сервісів */}
          {isLoaded && searchParams.lat && searchParams.lng && (
            <Box
              sx={{
                height: { xs: 350, md: 550 },
                width: "100%",
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: 6,
                mb: 4,
              }}
            >
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={{
                  lat: Number(searchParams.lat),
                  lng: Number(searchParams.lng),
                }}
                zoom={13}
              >
                {externalServices.map((s: any) => (
                  <Marker
                    key={s.placeId}
                    position={{ lat: s.lat, lng: s.lng }}
                    title={s.name}
                    label={s.name[0]}
                  />
                ))}
              </GoogleMap>
            </Box>
          )}
          <Stack spacing={3}>
            {externalLoading && (
              <Alert severity="info">Завантаження сервісів...</Alert>
            )}
            {externalServices.map((s) => (
              <Paper
                key={s.placeId}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 5,
                  boxShadow: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  maxWidth: 1000,
                  mx: "auto",
                  width: "100%",
                  minHeight: 90,
                  gap: 2,
                }}
              >
                <Box>
                  <Typography fontWeight={700}>{s.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.address}
                  </Typography>
                  <Typography variant="body2">
                    Рейтинг: {s.rating} ({s.userRatingsTotal})
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                    onClick={() => handleBookGoogleService(s)}
                  >
                    Забронювати
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                    onClick={() => handleReviewGoogleService(s)}
                  >
                    Залишити відгук
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
