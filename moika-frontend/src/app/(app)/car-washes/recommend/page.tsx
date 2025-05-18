"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Chip,
  Avatar,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LocalCarWashIcon from "@mui/icons-material/LocalCarWash";
import StarIcon from "@mui/icons-material/Star";
import { carService } from "@/services/carService";
import { carWashService } from "@/services/carWashService";
import { Car } from "@/types";
import { useRouter } from "next/navigation";

const sizeLabels: Record<string, string> = {
  micro: "Мікроавто",
  sedan: "Седан",
  suv: "Позашляховик/Джип",
  minivan: "Мінівен",
  pickup: "Пікап",
  other: "Інше",
};

export default function RecommendCarWashPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>("");
  const [carWashes, setCarWashes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiHint, setAiHint] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    carService.getAll().then((res: { data: Car[] }) => {
      setCars(res.data);
      if (res.data.length > 0) setSelectedCarId(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCarId) return;
    const car = cars.find((c) => c.id === selectedCarId);
    if (!car) return;
    setLoading(true);
    setAiHint("");
    // AI-підказка (імітація, заміни на реальний API якщо є)
    if (
      car.mileage > 0 &&
      car.serviceFrequency > 0 &&
      car.mileage % car.serviceFrequency < 1000
    ) {
      setAiHint("Пора на ТО! Зверніть увагу на інтервал обслуговування.");
    }
    carWashService.getAll().then((res: { data: any[] }) => {
      // Фільтруємо мийки, які підтримують розмір авто
      const filtered = res.data.filter(
        (cw) =>
          Array.isArray(cw.supportedSizes) &&
          cw.supportedSizes.includes(car.size)
      );
      setCarWashes(filtered);
      setLoading(false);
    });
  }, [selectedCarId, cars]);

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)",
        py: 6,
        px: 2,
      }}
    >
      <Box maxWidth={900} mx="auto" mb={5}>
        <Typography variant="h4" fontWeight={900} color="primary.main" mb={3}>
          Підібрати мийку під моє авто
        </Typography>
        {cars.length === 0 ? (
          <Alert severity="info">
            Додайте авто у профілі, щоб отримати персональні рекомендації!
          </Alert>
        ) : (
          <Box mb={3}>
            <Typography fontWeight={700} mb={1}>
              Оберіть авто:
            </Typography>
            <Select
              value={selectedCarId}
              onChange={(e) => setSelectedCarId(e.target.value as string)}
              sx={{ minWidth: 220, bgcolor: "#fff", borderRadius: 2 }}
            >
              {cars.map((car) => (
                <MenuItem value={car.id} key={car.id}>
                  <DirectionsCarIcon sx={{ mr: 1 }} />
                  {car.brand} {car.model} ({car.year}) — {sizeLabels[car.size]}
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}
        {aiHint && (
          <Alert severity="info" sx={{ mb: 3, fontWeight: 700 }}>
            {aiHint}
          </Alert>
        )}
      </Box>
      <Box maxWidth={900} mx="auto">
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={200}
          >
            <CircularProgress />
          </Box>
        ) : cars.length === 0 ? null : carWashes.length === 0 ? (
          <Alert severity="warning">
            Наразі немає автомийок, які обслуговують ваш тип авто.
          </Alert>
        ) : (
          <Stack spacing={4}>
            {carWashes.map((cw) => (
              <Paper
                key={cw.id}
                sx={{
                  p: 4,
                  borderRadius: 5,
                  boxShadow: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  bgcolor: "linear-gradient(100deg, #fff 0%, #e0eafc 100%)",
                }}
              >
                <Avatar
                  src={cw.photos?.[0]}
                  variant="rounded"
                  sx={{
                    width: 100,
                    height: 80,
                    mr: 3,
                    bgcolor: "primary.light",
                  }}
                >
                  <LocalCarWashIcon color="primary" sx={{ fontSize: 48 }} />
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
                  <Typography color="text.secondary" mb={0.5}>
                    {cw.address}, {cw.city}
                  </Typography>
                  <Typography color="primary.dark" fontWeight={600} mb={1}>
                    {cw.description}
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                    {Array.isArray(cw.supportedSizes) &&
                      cw.supportedSizes.length > 0 &&
                      cw.supportedSizes.map((size: string) => (
                        <Chip
                          key={size}
                          label={sizeLabels[size] || size}
                          color="info"
                          size="small"
                        />
                      ))}
                  </Box>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Chip
                      label={cw.supportedSizes
                        .map((s: string) => sizeLabels[s])
                        .join(", ")}
                      color="info"
                      size="small"
                    />
                    {typeof cw.averageRating === "number" && (
                      <Chip
                        icon={<StarIcon />}
                        label={`★ ${cw.averageRating.toFixed(2)}`}
                        color="warning"
                        size="small"
                        sx={{ fontWeight: 700, fontSize: 16 }}
                      />
                    )}
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ fontWeight: 700, borderRadius: 3, px: 4 }}
                  onClick={() => router.push(`/car-washes/${cw.id}`)}
                >
                  Детальніше
                </Button>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
