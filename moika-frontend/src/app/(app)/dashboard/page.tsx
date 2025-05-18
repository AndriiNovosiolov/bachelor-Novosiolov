"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
  Fade,
  Chip,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { carWashService } from "@/services/carWashService";
import LocalCarWashIcon from "@mui/icons-material/LocalCarWash";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BuildIcon from "@mui/icons-material/Build";
import StarIcon from "@mui/icons-material/Star";
import PlaceIcon from "@mui/icons-material/Place";

const defaultCenter = { lat: 49.8397, lng: 24.0297 };
const defaultZoom = 11;

export default function DashboardPage() {
  const router = useRouter();
  const [center, setCenter] = useState(defaultCenter);
  const [carWashes, setCarWashes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log("Запит координати:", latitude, longitude, 10000);
          setCenter({ lat: latitude, lng: longitude });
          try {
            const res = await carWashService.searchByLocation({
              lat: latitude,
              lon: longitude,
              radius: 100,
            });
            const mapped = res.data.map((cw: any) => ({
              id: cw.id || cw.carWash_id,
              name: cw.name || cw.carWash_name,
              address: cw.address || cw.carWash_address,
              latitude: Number(cw.latitude || cw.carWash_latitude),
              longitude: Number(cw.longitude || cw.carWash_longitude),
              city: cw.city || cw.carWash_city,
              description: cw.description || cw.carWash_description,
              phone: cw.phone || cw.carWash_phone,
              ownerId: cw.ownerId || cw.carWash_ownerId,
              createdAt: cw.createdAt || cw.carWash_createdAt,
              updatedAt: cw.updatedAt || cw.carWash_updatedAt,
            }));
            setCarWashes(mapped);
            fetchRatings(mapped);
          } catch {
            setError("Не вдалося отримати автомийки з бекенду");
          } finally {
            setLoading(false);
          }
        },
        async () => {
          try {
            const res = await carWashService.searchByLocation({
              lat: defaultCenter.lat,
              lon: defaultCenter.lng,
              radius: 100,
            });
            const mapped = res.data.map((cw: any) => ({
              id: cw.id || cw.carWash_id,
              name: cw.name || cw.carWash_name,
              address: cw.address || cw.carWash_address,
              latitude: Number(cw.latitude || cw.carWash_latitude),
              longitude: Number(cw.longitude || cw.carWash_longitude),
              city: cw.city || cw.carWash_city,
              description: cw.description || cw.carWash_description,
              phone: cw.phone || cw.carWash_phone,
              ownerId: cw.ownerId || cw.carWash_ownerId,
              createdAt: cw.createdAt || cw.carWash_createdAt,
              updatedAt: cw.updatedAt || cw.carWash_updatedAt,
            }));
            setCarWashes(mapped);
            fetchRatings(mapped);
          } catch {
            setError("Не вдалося отримати автомийки з бекенду");
          } finally {
            setLoading(false);
          }
        }
      );
    } else {
      carWashService
        .searchByLocation({
          lat: defaultCenter.lat,
          lon: defaultCenter.lng,
          radius: 100,
        })
        .then((res) => {
          const mapped = res.data.map((cw: any) => ({
            id: cw.id || cw.carWash_id,
            name: cw.name || cw.carWash_name,
            address: cw.address || cw.carWash_address,
            latitude: Number(cw.latitude || cw.carWash_latitude),
            longitude: Number(cw.longitude || cw.carWash_longitude),
            city: cw.city || cw.carWash_city,
            description: cw.description || cw.carWash_description,
            phone: cw.phone || cw.carWash_phone,
            ownerId: cw.ownerId || cw.carWash_ownerId,
            createdAt: cw.createdAt || cw.carWash_createdAt,
            updatedAt: cw.updatedAt || cw.carWash_updatedAt,
          }));
          setCarWashes(mapped);
          fetchRatings(mapped);
        })
        .catch(() => setError("Не вдалося отримати автомийки з бекенду"))
        .finally(() => setLoading(false));
    }
  }, []);

  const fetchRatings = async (washes: any[]) => {
    const ratingResults = await Promise.all(
      washes.map(async (cw) => {
        try {
          const res = await carWashService.getAverageRating(cw.id);
          return [cw.id, res.data];
        } catch {
          return [cw.id, null];
        }
      })
    );
    setRatings(Object.fromEntries(ratingResults));
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
      {/* HERO BLOCK */}
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
          <LocalCarWashIcon fontSize="inherit" />
        </Avatar>
        <Box>
          <Typography
            variant="h3"
            fontWeight={900}
            color="primary.main"
            mb={1}
            letterSpacing={1}
          >
            Знайди свою ідеальну автомийку!
          </Typography>
          <Typography variant="h5" color="primary.dark" mb={1}>
            🚗 Локації, сервіси, бронювання — все онлайн
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Порівнюй, обирай та бронюй автомийку у два кліки. Спробуй прямо
            зараз!
          </Typography>
        </Box>
      </Box>
      {/* MAP BLOCK */}
      <Box mb={5} width="100%" maxWidth={1400} mx="auto" px={{ xs: 2, md: 6 }}>
        {/* <Typography variant="h6" mb={2} fontWeight={700} color="primary.main">
          Карта автомийок
        </Typography> */}
        <Paper
          sx={{
            height: 500,
            width: "100%",
            mb: 2,
            borderRadius: 6,
            boxShadow: 8,
            background: "linear-gradient(100deg, #e0eafc 0%, #cfdef3 100%)",
            overflow: "hidden",
          }}
        >
          {!isLoaded || loading ? (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
            >
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={center}
              zoom={defaultZoom}
            >
              {carWashes.map((cw) => (
                <Marker
                  key={cw.id}
                  position={{ lat: cw.latitude, lng: cw.longitude }}
                  title={cw.name}
                />
              ))}
            </GoogleMap>
          )}
        </Paper>
        <Button variant="outlined" onClick={() => router.push("/car-washes")}>
          Всі автомийки
        </Button>
      </Box>
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} mb={0.5}>
          <LocalCarWashIcon color="primary" sx={{ fontSize: 36 }} />
          <Typography variant="h5" fontWeight={900} color="primary.main">
            Найближчі автомийки
          </Typography>
        </Stack>
        <Typography variant="subtitle1" color="primary.dark" mb={2}>
          Автомийки поруч з вами, які можна забронювати прямо зараз
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Stack spacing={5}>
            {carWashes.map((cw, idx) => {
              // Масив іконок для різноманіття
              const icons = [
                <LocalCarWashIcon fontSize="inherit" key="wash" />,
                <DirectionsCarIcon fontSize="inherit" key="car" />,
                <BuildIcon fontSize="inherit" key="build" />,
                <StarIcon fontSize="inherit" key="star" />,
                <PlaceIcon fontSize="inherit" key="place" />,
              ];
              const icon = icons[idx % icons.length];
              return (
                <Fade in timeout={500 + idx * 80} key={cw.id}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" },
                      gap: 5,
                      p: { xs: 4, sm: 6 },
                      borderRadius: 8,
                      boxShadow: 12,
                      background:
                        "linear-gradient(100deg, #e0eafc 0%, #cfdef3 100%)",
                      cursor: "pointer",
                      transition: "box-shadow 0.2s, transform 0.2s",
                      "&:hover": {
                        boxShadow: 20,
                        transform: "translateY(-3px) scale(1.012)",
                        background:
                          "linear-gradient(100deg, #b6e0fe 0%, #e0c3fc 100%)",
                      },
                      minHeight: 160,
                    }}
                    onClick={() => router.push(`/car-washes/${cw.id}`)}
                  >
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: "primary.main",
                        fontSize: 44,
                        fontWeight: 700,
                        boxShadow: 3,
                        mr: { sm: 3 },
                        mb: { xs: 2, sm: 0 },
                      }}
                    >
                      {icon}
                    </Avatar>
                    <Box flex={1} minWidth={0}>
                      <Typography
                        variant="h5"
                        fontWeight={900}
                        color="primary.main"
                        mb={1}
                      >
                        {cw.name}
                      </Typography>
                      {typeof ratings[cw.id] === "number" && (
                        <Stack
                          direction="row"
                          alignItems="center"
                          gap={1}
                          mb={1}
                        >
                          <Chip
                            icon={<StarIcon />}
                            label={`Рейтинг: ${ratings[cw.id].toFixed(2)}`}
                            color="warning"
                            sx={{ fontWeight: 700, fontSize: 16 }}
                          />
                        </Stack>
                      )}
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        mb={0.5}
                      >
                        {cw.address}
                        {cw.city ? `, ${cw.city}` : ""}
                      </Typography>
                      {cw.phone && (
                        <Typography
                          variant="body1"
                          color="primary.dark"
                          mb={0.5}
                        >
                          Телефон: {cw.phone}
                        </Typography>
                      )}
                      {cw.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mb={0.5}
                        >
                          {cw.description}
                        </Typography>
                      )}
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: 18,
                        px: 4,
                        py: 1.5,
                        boxShadow: 3,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/car-washes/${cw.id}`);
                      }}
                    >
                      Детальніше
                    </Button>
                  </Box>
                </Fade>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
