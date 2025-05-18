"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  IconButton,
} from "@mui/material";
import { userService } from "@/services/userService";
import { jwtDecode } from "jwt-decode";
import { User } from "@/types";
import { carWashService } from "@/services/carWashService";
import axios from "axios";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import { Fade, Divider, Stack } from "@mui/material";
import LocalCarWashIcon from "@mui/icons-material/LocalCarWash";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaidIcon from "@mui/icons-material/Paid";
import { bookingService } from "@/services/bookingService";
import DeleteIcon from "@mui/icons-material/Delete";
import { carService } from "@/services/carService";
import { Car } from "@/types";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import ElectricCarIcon from "@mui/icons-material/ElectricCar";
import SpeedIcon from "@mui/icons-material/Speed";
import BuildIcon from "@mui/icons-material/Build";
import OilBarrelIcon from "@mui/icons-material/OilBarrel";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

// Дні тижня українською для відображення у формі
const daysUA: Record<string, string> = {
  monday: "Понеділок",
  tuesday: "Вівторок",
  wednesday: "Середа",
  thursday: "Четвер",
  friday: "П'ятниця",
  saturday: "Субота",
  sunday: "Неділя",
};

// Порядок днів тижня для UI
const weekOrder = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function getUserIdFromToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    return decoded.sub;
  } catch {
    return null;
  }
}

// Функція для приведення workingHours до масиву для UI
function workingHoursToArray(wh: any): any[] {
  if (Array.isArray(wh)) return wh;
  if (typeof wh === "object" && wh !== null) {
    return Object.entries(wh).map(([day, val]: [string, any]) => ({
      day,
      open: val.open || "",
      close: val.close || "",
      isWorking: !!(val.open && val.close),
    }));
  }
  return [];
}

const sizeLabels: Record<string, string> = {
  micro: "Мікроавто",
  sedan: "Седан",
  suv: "Позашляховик/Джип",
  minivan: "Мінівен",
  pickup: "Пікап",
  other: "Інше",
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [carWashForm, setCarWashForm] = useState<{
    name: string;
    address: string;
    city: string;
    description: string;
    phone: string;
    photos: string[];
    workingHours: {
      day: string;
      open: string;
      close: string;
      isWorking: boolean;
    }[];
    supportedSizes: string[];
  }>({
    name: "",
    address: "",
    city: "",
    description: "",
    phone: "",
    photos: ["https://placehold.co/120x80?text=Car+Wash"],
    workingHours: [
      { day: "monday", open: "08:00", close: "20:00", isWorking: true },
      { day: "tuesday", open: "08:00", close: "20:00", isWorking: true },
      { day: "wednesday", open: "08:00", close: "20:00", isWorking: true },
      { day: "thursday", open: "08:00", close: "20:00", isWorking: true },
      { day: "friday", open: "08:00", close: "20:00", isWorking: true },
      { day: "saturday", open: "09:00", close: "18:00", isWorking: true },
      { day: "sunday", open: "09:00", close: "18:00", isWorking: true },
    ],
    supportedSizes: [],
  });
  const [cwLoading, setCwLoading] = useState(false);
  const [cwSuccess, setCwSuccess] = useState("");
  const [cwError, setCwError] = useState("");
  const [myCarWashes, setMyCarWashes] = useState<any[]>([]);
  const [editCarWash, setEditCarWash] = useState<any | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const defaultSchedule = [
    {
      dayOfWeek: "MONDAY",
      openTime: "08:00",
      closeTime: "20:00",
      isWorking: true,
    },
    {
      dayOfWeek: "TUESDAY",
      openTime: "08:00",
      closeTime: "20:00",
      isWorking: true,
    },
    {
      dayOfWeek: "WEDNESDAY",
      openTime: "08:00",
      closeTime: "20:00",
      isWorking: true,
    },
    {
      dayOfWeek: "THURSDAY",
      openTime: "08:00",
      closeTime: "20:00",
      isWorking: true,
    },
    {
      dayOfWeek: "FRIDAY",
      openTime: "08:00",
      closeTime: "20:00",
      isWorking: true,
    },
    {
      dayOfWeek: "SATURDAY",
      openTime: "09:00",
      closeTime: "18:00",
      isWorking: true,
    },
    {
      dayOfWeek: "SUNDAY",
      openTime: "09:00",
      closeTime: "18:00",
      isWorking: true,
    },
  ];
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [carForm, setCarForm] = useState<Omit<Car, "id">>({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    engineType: "petrol",
    mileage: 0,
    serviceFrequency: 10000,
    lastOilChangeDate: new Date().toISOString().slice(0, 10),
    lastDiagnosticsDate: new Date().toISOString().slice(0, 10),
    size: "micro",
  });
  const [carEditId, setCarEditId] = useState<string | null>(null);
  const [carLoading, setCarLoading] = useState(false);
  const [carError, setCarError] = useState("");

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) return;
    userService
      .getById(userId)
      .then((res: { data: User }) => {
        setUser(res.data);
        setForm({
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          phone: res.data.phone,
        });
        if (res.data.role === "owner") {
          carWashService
            .getByOwner(res.data.id)
            .then((cwRes: { data: any[] }) => {
              setMyCarWashes(cwRes.data);
              cwRes.data.forEach((cw) => {
                carWashService
                  .getAverageRating(cw.id)
                  .then((r: { data: number }) =>
                    setRatings((prev) => ({ ...prev, [cw.id]: r.data }))
                  )
                  .catch(() => {});
              });
            })
            .catch(() => setMyCarWashes([]));
        }
        if (res.data.role === "customer") {
          setBookingsLoading(true);
          bookingService
            .getByUser(res.data.id)
            .then((bRes: { data: any[] }) => setBookings(bRes.data))
            .catch(() => setBookings([]))
            .finally(() => setBookingsLoading(false));
          carService
            .getAll()
            .then((res: { data: Car[] }) => setCars(res.data))
            .catch(() => setCars([]));
        }
      })
      .catch(() => setError("Не вдалося завантажити дані користувача"));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await userService.update(user.id, form);
      setSuccess("Дані оновлено!");
      setUser({ ...user, ...form });
      setEditOpen(false);
    } catch (err: any) {
      setError("Помилка оновлення профілю");
    } finally {
      setLoading(false);
    }
  };

  const handleCarWashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCarWashForm({ ...carWashForm, [e.target.name]: e.target.value });
  };

  const handleWorkingHoursChange = (
    idx: number,
    field: "open" | "close" | "isWorking",
    value: string | boolean
  ) => {
    setCarWashForm((prev) => ({
      ...prev,
      workingHours: prev.workingHours.map((row, i) =>
        i === idx ? { ...row, [field]: value } : row
      ),
    }));
  };

  const handleAddCarWash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCwLoading(true);
    setCwError("");
    setCwSuccess("");
    try {
      const address = `${carWashForm.address}, ${carWashForm.city}`;
      const geoRes = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address,
            key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          },
        }
      );
      const location = geoRes.data.results[0]?.geometry.location;
      if (!location)
        throw new Error("Не вдалося визначити координати за адресою");
      const workingHoursObj: Record<string, { open: string; close: string }> =
        {};
      carWashForm.workingHours.forEach((row) => {
        if (row.isWorking) {
          workingHoursObj[row.day] = { open: row.open, close: row.close };
        } else {
          workingHoursObj[row.day] = { open: "", close: "" };
        }
      });
      const { workingHours, ...rest } = carWashForm;
      await carWashService.create(user.id, {
        ...rest,
        latitude: location.lat,
        longitude: location.lng,
        workingHours: workingHoursObj,
        photos:
          carWashForm.photos && carWashForm.photos.length > 0
            ? carWashForm.photos
            : ["https://placehold.co/120x80?text=Car+Wash"],
        supportedSizes: carWashForm.supportedSizes,
      });
      setCwSuccess("Автомийку додано!");
      setCarWashForm({
        name: "",
        address: "",
        city: "",
        description: "",
        phone: "",
        photos: ["https://placehold.co/120x80?text=Car+Wash"],
        workingHours: [
          { day: "monday", open: "08:00", close: "20:00", isWorking: true },
          { day: "tuesday", open: "08:00", close: "20:00", isWorking: true },
          { day: "wednesday", open: "08:00", close: "20:00", isWorking: true },
          { day: "thursday", open: "08:00", close: "20:00", isWorking: true },
          { day: "friday", open: "08:00", close: "20:00", isWorking: true },
          { day: "saturday", open: "09:00", close: "18:00", isWorking: true },
          { day: "sunday", open: "09:00", close: "18:00", isWorking: true },
        ],
        supportedSizes: [],
      });
      setOpen(false);
      if (user) {
        carWashService
          .getByOwner(user.id)
          .then((cwRes: { data: any[] }) => setMyCarWashes(cwRes.data))
          .catch(() => setMyCarWashes([]));
      }
    } catch (err: any) {
      setCwError("Помилка додавання автомийки");
    } finally {
      setCwLoading(false);
    }
  };

  const handleDeleteCarWash = useCallback(async (id: string) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цю автомийку?"))
      return;
    try {
      await carWashService.deleteById(id);
      setMyCarWashes((prev) => prev.filter((cw) => cw.id !== id));
    } catch {
      alert("Помилка видалення автомийки");
    }
  }, []);

  const handleEditCarWash = (cw: any) => {
    // Перетворюємо workingHours з об'єкта у масив для UI
    const workingHoursObj = cw.workingHours || {};
    const workingHoursArr = [
      {
        day: "monday",
        ...(workingHoursObj["monday"] || { open: "08:00", close: "20:00" }),
        isWorking: !!(
          workingHoursObj["monday"] && workingHoursObj["monday"].open
        ),
      },
      {
        day: "tuesday",
        ...(workingHoursObj["tuesday"] || { open: "08:00", close: "20:00" }),
        isWorking: !!(
          workingHoursObj["tuesday"] && workingHoursObj["tuesday"].open
        ),
      },
      {
        day: "wednesday",
        ...(workingHoursObj["wednesday"] || { open: "08:00", close: "20:00" }),
        isWorking: !!(
          workingHoursObj["wednesday"] && workingHoursObj["wednesday"].open
        ),
      },
      {
        day: "thursday",
        ...(workingHoursObj["thursday"] || { open: "08:00", close: "20:00" }),
        isWorking: !!(
          workingHoursObj["thursday"] && workingHoursObj["thursday"].open
        ),
      },
      {
        day: "friday",
        ...(workingHoursObj["friday"] || { open: "08:00", close: "20:00" }),
        isWorking: !!(
          workingHoursObj["friday"] && workingHoursObj["friday"].open
        ),
      },
      {
        day: "saturday",
        ...(workingHoursObj["saturday"] || { open: "09:00", close: "18:00" }),
        isWorking: !!(
          workingHoursObj["saturday"] && workingHoursObj["saturday"].open
        ),
      },
      {
        day: "sunday",
        ...(workingHoursObj["sunday"] || { open: "09:00", close: "18:00" }),
        isWorking: !!(
          workingHoursObj["sunday"] && workingHoursObj["sunday"].open
        ),
      },
    ];
    setEditCarWash({ ...cw, workingHours: workingHoursArr });
    setEditModalOpen(true);
  };

  const handleEditCarWashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditCarWash({ ...editCarWash, [e.target.name]: e.target.value });
  };

  const handleEditWorkingHoursChange = (
    idx: number,
    field: "open" | "close" | "isWorking",
    value: string | boolean
  ) => {
    setEditCarWash((prev: any) => {
      const whArr = workingHoursToArray(prev.workingHours);
      return {
        ...prev,
        workingHours: whArr.map((row: any, i: number) =>
          i === idx ? { ...row, [field]: value } : row
        ),
      };
    });
  };

  const handleSaveEditCarWash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCarWash) return;
    try {
      // 1. Отримати координати через Google Maps API
      const address = `${editCarWash.address}, ${editCarWash.city}`;
      const geoRes = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address,
            key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          },
        }
      );
      const location = geoRes.data.results[0]?.geometry.location;
      if (!location)
        throw new Error("Не вдалося визначити координати за адресою");
      // 2. Перетворити workingHours у об'єкт
      const whArr = workingHoursToArray(editCarWash.workingHours);
      const workingHoursObj: Record<string, { open: string; close: string }> =
        {};
      whArr.forEach((row: any) => {
        if (row.isWorking) {
          workingHoursObj[row.day] = { open: row.open, close: row.close };
        } else {
          workingHoursObj[row.day] = { open: "", close: "" };
        }
      });
      await carWashService.update(editCarWash.id, {
        ...editCarWash,
        latitude: location.lat,
        longitude: location.lng,
        workingHours: workingHoursObj,
        supportedSizes: editCarWash.supportedSizes,
      });
      setEditModalOpen(false);
      // Оновити список автомийок
      if (user) {
        carWashService
          .getByOwner(user.id)
          .then((cwRes: { data: any[] }) => setMyCarWashes(cwRes.data))
          .catch(() => setMyCarWashes([]));
      }
    } catch {
      alert("Помилка оновлення автомийки");
    }
  };

  const handleOpenAddCar = () => {
    setCarForm({
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      engineType: "petrol",
      mileage: 0,
      serviceFrequency: 10000,
      lastOilChangeDate: new Date().toISOString().slice(0, 10),
      lastDiagnosticsDate: new Date().toISOString().slice(0, 10),
      size: "micro",
    });
    setCarEditId(null);
    setCarModalOpen(true);
  };

  const handleEditCar = (car: Car) => {
    setCarForm({
      brand: car.brand,
      model: car.model,
      year: car.year,
      engineType: car.engineType,
      mileage: car.mileage,
      serviceFrequency: car.serviceFrequency,
      lastOilChangeDate: car.lastOilChangeDate.slice(0, 10),
      lastDiagnosticsDate: car.lastDiagnosticsDate.slice(0, 10),
      size: car.size,
    });
    setCarEditId(car.id);
    setCarModalOpen(true);
  };

  const handleDeleteCar = async (id: string) => {
    if (!window.confirm("Ви впевнені, що хочете видалити це авто?")) return;
    setCarLoading(true);
    try {
      await carService.delete(id);
      setCars((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setCarError("Помилка видалення авто");
    } finally {
      setCarLoading(false);
    }
  };

  // Для input і select (MUI TextField прокидує event як HTMLInputElement)
  const handleCarFormInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setCarForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleCarFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarLoading(true);
    setCarError("");
    // Basic validation
    if (
      !carForm.brand ||
      !carForm.model ||
      !carForm.year ||
      !carForm.engineType
    ) {
      setCarError("Всі поля обов'язкові!");
      setCarLoading(false);
      return;
    }
    try {
      if (carEditId) {
        await carService.update(carEditId, carForm);
        setCars((prev) =>
          prev.map((c) => (c.id === carEditId ? { ...c, ...carForm } : c))
        );
      } else {
        const res = await carService.create(carForm);
        setCars((prev) => [...prev, res.data]);
      }
      setCarModalOpen(false);
    } catch {
      setCarError("Помилка збереження авто");
    } finally {
      setCarLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)",
        py: { xs: 2, md: 8 },
        px: { xs: 0, md: 0 },
        width: "100%",
        borderRadius: 4,
        minWidth: 0,
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {/* HERO PROFILE BLOCK */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 1400,
          minHeight: 280,
          borderRadius: 10,
          background: "linear-gradient(100deg, #b6e0fe 0%, #e0c3fc 100%)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
          position: "relative",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: { xs: "center", md: "flex-start" },
          p: { xs: 3, md: 7 },
          mb: 6,
          mx: "auto",
        }}
      >
        {/* Edit button in top right */}
        <IconButton
          onClick={() => setEditOpen(true)}
          sx={{
            position: "absolute",
            top: 24,
            right: 24,
            bgcolor: "rgba(255,255,255,0.7)",
            boxShadow: 2,
            zIndex: 2,
            "&:hover": { bgcolor: "primary.light" },
          }}
          size="large"
        >
          <EditIcon fontSize="large" color="primary" />
        </IconButton>
        {/* Avatar */}
        <Box
          sx={{
            mr: { md: 5 },
            mb: { xs: 2, md: 0 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Avatar
            sx={{
              width: 120,
              height: 120,
              fontSize: 48,
              fontWeight: 700,
              bgcolor: "primary.main",
              boxShadow: 6,
              border: "6px solid #fff",
            }}
          >
            {user.firstName?.[0]?.toUpperCase() || ""}
            {user.lastName?.[0]?.toUpperCase() || ""}
          </Avatar>
        </Box>
        {/* Info */}
        <Box flex={1} minWidth={0}>
          <Typography
            variant="h4"
            fontWeight={800}
            color="primary.main"
            mb={1}
            sx={{ letterSpacing: 1 }}
          >
            {user.firstName} {user.lastName}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <EmailIcon color="primary" />
            <Typography
              variant="h6"
              fontWeight={600}
              color="primary.dark"
              sx={{ wordBreak: "break-all" }}
            >
              {user.email}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <PhoneIcon color="action" />
            <Typography variant="h6" color="text.secondary" fontWeight={500}>
              {user.phone}
            </Typography>
          </Stack>
          <Chip
            label={
              user.role === "customer"
                ? "Клієнт"
                : user.role === "owner"
                ? "Власник"
                : user.role
            }
            color={user.role === "owner" ? "primary" : "secondary"}
            sx={{
              fontWeight: 700,
              fontSize: 18,
              px: 3,
              py: 1,
              mt: 2,
              textTransform: "capitalize",
              borderRadius: 2,
            }}
          />
        </Box>
      </Box>
      {/* Edit Profile Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="md"
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
            fontSize: 28,
            color: "primary.main",
            textAlign: "center",
            letterSpacing: 1,
          }}
        >
          Внесіть нову інформацію про себе
        </DialogTitle>
        <DialogContent
          sx={{
            p: { xs: 2, md: 4 },
          }}
        >
          <form onSubmit={handleSave}>
            <Box
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              gap={3}
              alignItems="center"
              justifyContent="center"
            >
              <TextField
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                sx={{ flex: 1, bgcolor: "#fff", borderRadius: 2 }}
              />
              <TextField
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                sx={{ flex: 1, bgcolor: "#fff", borderRadius: 2 }}
              />
              <TextField
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                sx={{ flex: 1, bgcolor: "#fff", borderRadius: 2 }}
              />
            </Box>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
            <DialogActions sx={{ justifyContent: "center", mt: 3 }}>
              <Button
                onClick={() => setEditOpen(false)}
                color="secondary"
                variant="outlined"
                sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
              >
                Скасувати
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
                disabled={loading}
              >
                {loading ? "Зберігаємо..." : "Зберегти"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      {/* Секція автомийок для owner */}
      {user.role === "owner" && (
        <Fade in timeout={900}>
          <Box width="100%" maxWidth={1200} mt={6} mx="auto">
            <Divider sx={{ mb: 3 }}>Мої автомийки</Divider>
            {/* Кнопка додати мийку */}
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                variant="contained"
                color="primary"
                sx={{ fontWeight: 700, borderRadius: 2, px: 4 }}
                onClick={() => setOpen(true)}
              >
                Додати мийку
              </Button>
            </Box>
            <Box pb={2}>
              {myCarWashes.length === 0 ? (
                <Typography color="text.secondary" ml={2}>
                  У вас ще немає автомийок
                </Typography>
              ) : (
                <Box
                  display="grid"
                  gridTemplateColumns={{
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "1fr 1fr 1fr",
                  }}
                  gap={4}
                >
                  {myCarWashes.map((cw) => (
                    <Box
                      key={cw.id}
                      sx={{
                        p: 3,
                        borderRadius: 5,
                        boxShadow: 8,
                        bgcolor:
                          "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        minHeight: 260,
                        transition: "box-shadow 0.2s, transform 0.2s",
                        cursor: "pointer",
                        position: "relative",
                        "&:hover": {
                          boxShadow: 16,
                          transform: "translateY(-3px) scale(1.012)",
                          bgcolor:
                            "linear-gradient(120deg, #b6e0fe 0%, #e0c3fc 100%)",
                        },
                      }}
                      onClick={() => router.push(`/car-washes/${cw.id}`)}
                    >
                      {/* Edit/Delete buttons */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          display: "flex",
                          gap: 1,
                          zIndex: 2,
                        }}
                      >
                        <IconButton
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.8)",
                            boxShadow: 1,
                            "&:hover": { bgcolor: "primary.light" },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditCarWash(cw);
                            setEditModalOpen(true);
                          }}
                        >
                          <EditIcon color="primary" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.8)",
                            boxShadow: 1,
                            "&:hover": { bgcolor: "error.light" },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                "Ви впевнені, що хочете видалити цю автомийку?"
                              )
                            )
                              handleDeleteCarWash(cw.id);
                          }}
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Box>
                      {cw.photos && cw.photos.length > 0 ? (
                        <Avatar
                          src={cw.photos[0]}
                          variant="rounded"
                          sx={{
                            width: "100%",
                            height: 100,
                            mb: 2,
                            borderRadius: 3,
                            boxShadow: 2,
                          }}
                        />
                      ) : (
                        <Avatar
                          variant="rounded"
                          sx={{
                            width: "100%",
                            height: 100,
                            mb: 2,
                            borderRadius: 3,
                            bgcolor: "primary.light",
                            boxShadow: 2,
                          }}
                        >
                          <LocalCarWashIcon
                            color="primary"
                            sx={{ fontSize: 48 }}
                          />
                        </Avatar>
                      )}
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        color="primary.main"
                        mb={0.5}
                      >
                        {cw.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        mb={0.5}
                      >
                        {cw.address}, {cw.city}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="primary.dark"
                        fontWeight={600}
                        mb={1}
                      >
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
                      <Box display="flex" alignItems="center" gap={1} mt="auto">
                        {typeof ratings[cw.id] === "number" && (
                          <Chip
                            label={`★ ${ratings[cw.id].toFixed(2)}`}
                            color="warning"
                            size="small"
                            sx={{ fontWeight: 700, fontSize: 16 }}
                          />
                        )}
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{
                            ml: 1,
                            fontWeight: 700,
                            borderRadius: 2,
                            px: 2,
                            boxShadow: 2,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/car-washes/${cw.id}`);
                          }}
                        >
                          Детальніше
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Fade>
      )}
      {/* Секція для авто користувача */}
      {user.role === "customer" && (
        <Fade in timeout={900}>
          <Box width="100%" maxWidth={1000} mt={6} mx="auto">
            <Divider
              sx={{
                mb: 3,
                color: "primary.main",
                fontWeight: 800,
                fontSize: 24,
              }}
            >
              Мої авто
            </Divider>
            {cars.length === 0 ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight={180}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{
                    fontWeight: 700,
                    borderRadius: 3,
                    px: 6,
                    py: 2,
                    fontSize: 22,
                  }}
                  onClick={handleOpenAddCar}
                >
                  Додати авто
                </Button>
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" gap={3}>
                {cars.map((car) => (
                  <Box
                    key={car.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 4,
                      borderRadius: 6,
                      boxShadow: 10,
                      bgcolor:
                        "linear-gradient(100deg, #e0eafc 0%, #cfdef3 100%)",
                      gap: 4,
                      minHeight: 180,
                      maxWidth: 900,
                      mx: "auto",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: 80,
                        height: 80,
                        mr: 3,
                      }}
                    >
                      <DirectionsCarIcon sx={{ fontSize: 48 }} />
                    </Avatar>
                    <Box flex={1} minWidth={0}>
                      <Typography
                        variant="h5"
                        fontWeight={900}
                        color="primary.main"
                        mb={1}
                      >
                        {car.brand} {car.model} ({car.year})
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        {car.engineType === "petrol" && (
                          <LocalGasStationIcon color="secondary" />
                        )}
                        {car.engineType === "diesel" && (
                          <LocalGasStationIcon color="action" />
                        )}
                        {car.engineType === "electric" && (
                          <ElectricCarIcon color="success" />
                        )}
                        {car.engineType === "hybrid" && (
                          <ElectricCarIcon color="primary" />
                        )}
                        <Typography fontWeight={700} sx={{ minWidth: 90 }}>
                          {car.engineType === "petrol" && "Бензин"}
                          {car.engineType === "diesel" && "Дизель"}
                          {car.engineType === "electric" && "Електро"}
                          {car.engineType === "hybrid" && "Гібрид"}
                        </Typography>
                        <SpeedIcon color="action" sx={{ ml: 2 }} />
                        <Typography fontWeight={700}>
                          {car.mileage} км
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <BuildIcon color="primary" />
                        <Typography>
                          Інтервал ТО: {car.serviceFrequency} км
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <OilBarrelIcon color="warning" />
                        <Typography>
                          Остання заміна оливи:{" "}
                          {new Date(car.lastOilChangeDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <EventAvailableIcon color="success" />
                        <Typography>
                          Остання діагностика:{" "}
                          {new Date(
                            car.lastDiagnosticsDate
                          ).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={2} ml={3}>
                      <Button
                        variant="outlined"
                        color="primary"
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2,
                          px: 4,
                          fontSize: 18,
                        }}
                        onClick={() => handleEditCar(car)}
                      >
                        Редагувати
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2,
                          px: 4,
                          fontSize: 18,
                        }}
                        onClick={() => handleDeleteCar(car.id)}
                      >
                        Видалити
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2,
                          px: 4,
                          fontSize: 18,
                        }}
                        onClick={() =>
                          router.push(`/car-washes/recommend?carId=${car.id}`)
                        }
                      >
                        Підібрати мийку під це авто
                      </Button>
                    </Box>
                  </Box>
                ))}
                <Box display="flex" justifyContent="center" mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      fontWeight: 700,
                      borderRadius: 3,
                      px: 6,
                      py: 2,
                      fontSize: 20,
                    }}
                    onClick={handleOpenAddCar}
                  >
                    Додати ще авто
                  </Button>
                </Box>
              </Box>
            )}
            {/* Модалка для додавання/редагування авто */}
            <Dialog
              open={carModalOpen}
              onClose={() => setCarModalOpen(false)}
              maxWidth="xs"
              fullWidth
            >
              <DialogTitle
                sx={{
                  fontWeight: 800,
                  fontSize: 24,
                  color: "primary.main",
                  textAlign: "center",
                }}
              >
                {carEditId ? "Редагувати авто" : "Додати авто"}
              </DialogTitle>
              <DialogContent>
                <form onSubmit={handleCarFormSubmit}>
                  <TextField
                    label="Марка"
                    name="brand"
                    value={carForm.brand}
                    onChange={handleCarFormInputChange}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Модель"
                    name="model"
                    value={carForm.model}
                    onChange={handleCarFormInputChange}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Рік"
                    name="year"
                    type="number"
                    value={carForm.year}
                    onChange={handleCarFormInputChange}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                    inputProps={{
                      min: 1900,
                      max: new Date().getFullYear() + 1,
                    }}
                  />
                  <TextField
                    label="Тип двигуна"
                    name="engineType"
                    select
                    value={carForm.engineType}
                    onChange={handleCarFormInputChange}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                    SelectProps={{ native: true }}
                  >
                    <option value="petrol">Бензин</option>
                    <option value="diesel">Дизель</option>
                    <option value="electric">Електро</option>
                    <option value="hybrid">Гібрид</option>
                  </TextField>
                  <TextField
                    label="Пробіг (км)"
                    name="mileage"
                    type="number"
                    value={carForm.mileage}
                    onChange={handleCarFormInputChange}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                    inputProps={{ min: 0 }}
                  />
                  <TextField
                    label="Інтервал ТО (км)"
                    name="serviceFrequency"
                    type="number"
                    value={carForm.serviceFrequency}
                    onChange={handleCarFormInputChange}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                    inputProps={{ min: 1000 }}
                  />
                  <TextField
                    label="Остання заміна оливи"
                    name="lastOilChangeDate"
                    type="date"
                    value={carForm.lastOilChangeDate}
                    onChange={handleCarFormInputChange}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Остання діагностика"
                    name="lastDiagnosticsDate"
                    type="date"
                    value={carForm.lastDiagnosticsDate}
                    onChange={handleCarFormInputChange}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Розмір авто"
                    name="size"
                    select
                    value={carForm.size}
                    onChange={handleCarFormInputChange}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                    SelectProps={{ native: true }}
                    helperText="Оберіть розмір вашого авто для кращого підбору сервісів"
                  >
                    <option value="micro">Мікроавто</option>
                    <option value="sedan">Седан</option>
                    <option value="suv">Позашляховик/Джип</option>
                    <option value="minivan">Мінівен</option>
                    <option value="pickup">Пікап</option>
                    <option value="other">Інше</option>
                  </TextField>
                  {carError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {carError}
                    </Alert>
                  )}
                  <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
                    <Button
                      onClick={() => setCarModalOpen(false)}
                      color="secondary"
                      variant="outlined"
                      sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
                    >
                      Скасувати
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
                      disabled={carLoading}
                    >
                      {carLoading
                        ? "Зберігаємо..."
                        : carEditId
                        ? "Зберегти"
                        : "Додати"}
                    </Button>
                  </DialogActions>
                </form>
              </DialogContent>
            </Dialog>
          </Box>
        </Fade>
      )}
      {/* Edit Car Wash Modal */}
      {editCarWash && (
        <Dialog
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          maxWidth="md"
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
            Редагування автомийки
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
            <form onSubmit={handleSaveEditCarWash}>
              <Box
                display="flex"
                flexDirection={{ xs: "column", md: "row" }}
                gap={3}
                mb={2}
              >
                <TextField
                  label="Назва"
                  name="name"
                  value={editCarWash.name}
                  onChange={(e) =>
                    setEditCarWash((prev: any) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  sx={{ flex: 1, bgcolor: "#fff", borderRadius: 2 }}
                />
                <TextField
                  label="Адреса"
                  name="address"
                  value={editCarWash.address}
                  onChange={(e) =>
                    setEditCarWash((prev: any) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  required
                  sx={{ flex: 1, bgcolor: "#fff", borderRadius: 2 }}
                />
                <TextField
                  label="Місто"
                  name="city"
                  value={editCarWash.city}
                  onChange={(e) =>
                    setEditCarWash((prev: any) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                  required
                  sx={{ flex: 1, bgcolor: "#fff", borderRadius: 2 }}
                />
              </Box>
              <Box mb={2}>
                <Typography fontWeight={700} color="primary.main" mb={1}>
                  Робочі години
                </Typography>
                <Box bgcolor="#fff" borderRadius={2} boxShadow={1} p={2}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {weekOrder.map((dayKey) => {
                        const whArr = workingHoursToArray(
                          editCarWash.workingHours
                        );
                        const wh = whArr.find((d: any) => d.day === dayKey) || {
                          day: dayKey,
                          open: "",
                          close: "",
                          isWorking: false,
                        };
                        const whIdx = whArr.findIndex(
                          (d: any) => d.day === dayKey
                        );
                        return (
                          <tr key={wh.day}>
                            <td
                              style={{
                                padding: 6,
                                fontWeight: 600,
                                color: "#1976d2",
                              }}
                            >
                              {daysUA[wh.day] || wh.day}
                            </td>
                            <td style={{ padding: 6 }}>
                              <TextField
                                type="time"
                                size="small"
                                value={wh.open}
                                onChange={(e) =>
                                  whIdx !== -1 &&
                                  handleEditWorkingHoursChange(
                                    whIdx,
                                    "open",
                                    e.target.value
                                  )
                                }
                                disabled={!wh.isWorking}
                                sx={{ width: 110 }}
                              />
                            </td>
                            <td style={{ padding: 6 }}>
                              <TextField
                                type="time"
                                size="small"
                                value={wh.close}
                                onChange={(e) =>
                                  whIdx !== -1 &&
                                  handleEditWorkingHoursChange(
                                    whIdx,
                                    "close",
                                    e.target.value
                                  )
                                }
                                disabled={!wh.isWorking}
                                sx={{ width: 110 }}
                              />
                            </td>
                            <td style={{ padding: 6 }}>
                              <Button
                                variant={
                                  wh.isWorking ? "contained" : "outlined"
                                }
                                color={wh.isWorking ? "success" : "secondary"}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  borderRadius: 2,
                                  minWidth: 0,
                                  px: 1.5,
                                }}
                                onClick={() =>
                                  whIdx !== -1 &&
                                  handleEditWorkingHoursChange(
                                    whIdx,
                                    "isWorking",
                                    !wh.isWorking
                                  )
                                }
                              >
                                {wh.isWorking ? "Працює" : "Вихідний"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Box>
              </Box>
              <TextField
                label="Опис"
                name="description"
                value={editCarWash.description}
                onChange={(e) =>
                  setEditCarWash((prev: any) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                sx={{ mb: 2, bgcolor: "#fff", borderRadius: 2 }}
              />
              <TextField
                label="Телефон"
                name="phone"
                value={editCarWash.phone}
                onChange={(e) =>
                  setEditCarWash((prev: any) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                fullWidth
                sx={{ mb: 2, bgcolor: "#fff", borderRadius: 2 }}
              />
              <TextField
                label="Фото (URL)"
                name="photos"
                value={
                  editCarWash.photos && editCarWash.photos[0]
                    ? editCarWash.photos[0]
                    : ""
                }
                onChange={(e) =>
                  setEditCarWash((prev: any) => ({
                    ...prev,
                    photos: [e.target.value],
                  }))
                }
                fullWidth
                sx={{ mb: 2, bgcolor: "#fff", borderRadius: 2 }}
              />
              <TextField
                label="Підтримувані розміри авто"
                name="supportedSizes"
                select
                SelectProps={{ multiple: true, native: true }}
                value={editCarWash.supportedSizes || []}
                onChange={(e) => {
                  const target = e.target as unknown as HTMLSelectElement;
                  setEditCarWash((prev: any) => ({
                    ...prev,
                    supportedSizes: Array.from(
                      target.selectedOptions,
                      (opt) => opt.value
                    ),
                  }));
                }}
                required
                fullWidth
                sx={{ mb: 2 }}
                helperText="Оберіть всі розміри авто, які обслуговує ця мийка"
              >
                <option value="micro">Мікроавто</option>
                <option value="sedan">Седан</option>
                <option value="suv">Позашляховик/Джип</option>
                <option value="minivan">Мінівен</option>
                <option value="pickup">Пікап</option>
                <option value="other">Інше</option>
              </TextField>
              <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
                <Button
                  onClick={() => setEditModalOpen(false)}
                  color="secondary"
                  variant="outlined"
                  sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
                >
                  Скасувати
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
                >
                  Зберегти
                </Button>
              </DialogActions>
            </form>
          </DialogContent>
        </Dialog>
      )}
      {/* Add Car Wash Modal */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
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
          Додати нову автомийку
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
          <form onSubmit={handleAddCarWash}>
            <Box
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              gap={3}
              mb={2}
            >
              <TextField
                label="Назва"
                name="name"
                value={carWashForm.name}
                onChange={handleCarWashChange}
                required
                sx={{ flex: 1, bgcolor: "#fff", borderRadius: 2 }}
              />
              <TextField
                label="Адреса"
                name="address"
                value={carWashForm.address}
                onChange={handleCarWashChange}
                required
                sx={{ flex: 1, bgcolor: "#fff", borderRadius: 2 }}
              />
              <TextField
                label="Місто"
                name="city"
                value={carWashForm.city}
                onChange={handleCarWashChange}
                required
                sx={{ flex: 1, bgcolor: "#fff", borderRadius: 2 }}
              />
            </Box>
            <Box mb={2}>
              <Typography fontWeight={700} color="primary.main" mb={1}>
                Робочі години
              </Typography>
              <Box bgcolor="#fff" borderRadius={2} boxShadow={1} p={2}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {weekOrder.map((dayKey, idx) => {
                      const wh = carWashForm.workingHours[idx];
                      return (
                        <tr key={wh.day}>
                          <td
                            style={{
                              padding: 6,
                              fontWeight: 600,
                              color: "#1976d2",
                            }}
                          >
                            {daysUA[wh.day] || wh.day}
                          </td>
                          <td style={{ padding: 6 }}>
                            <TextField
                              type="time"
                              size="small"
                              value={wh.open}
                              onChange={(e) =>
                                handleWorkingHoursChange(
                                  idx,
                                  "open",
                                  e.target.value
                                )
                              }
                              disabled={!wh.isWorking}
                              sx={{ width: 110 }}
                            />
                          </td>
                          <td style={{ padding: 6 }}>
                            <TextField
                              type="time"
                              size="small"
                              value={wh.close}
                              onChange={(e) =>
                                handleWorkingHoursChange(
                                  idx,
                                  "close",
                                  e.target.value
                                )
                              }
                              disabled={!wh.isWorking}
                              sx={{ width: 110 }}
                            />
                          </td>
                          <td style={{ padding: 6 }}>
                            <Button
                              variant={wh.isWorking ? "contained" : "outlined"}
                              color={wh.isWorking ? "success" : "secondary"}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                borderRadius: 2,
                                minWidth: 0,
                                px: 1.5,
                              }}
                              onClick={() =>
                                handleWorkingHoursChange(
                                  idx,
                                  "isWorking",
                                  !wh.isWorking
                                )
                              }
                            >
                              {wh.isWorking ? "Працює" : "Вихідний"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Box>
            </Box>
            <TextField
              label="Опис"
              name="description"
              value={carWashForm.description}
              onChange={handleCarWashChange}
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              sx={{ mb: 2, bgcolor: "#fff", borderRadius: 2 }}
            />
            <TextField
              label="Телефон"
              name="phone"
              value={carWashForm.phone}
              onChange={handleCarWashChange}
              fullWidth
              sx={{ mb: 2, bgcolor: "#fff", borderRadius: 2 }}
            />
            <TextField
              label="Фото (URL)"
              name="photos"
              value={
                carWashForm.photos && carWashForm.photos[0]
                  ? carWashForm.photos[0]
                  : ""
              }
              onChange={(e) =>
                setCarWashForm((prev) => ({
                  ...prev,
                  photos: [e.target.value],
                }))
              }
              fullWidth
              sx={{ mb: 2, bgcolor: "#fff", borderRadius: 2 }}
            />
            <TextField
              label="Підтримувані розміри авто"
              name="supportedSizes"
              select
              SelectProps={{ multiple: true, native: true }}
              value={carWashForm.supportedSizes}
              onChange={(e) => {
                const target = e.target as unknown as HTMLSelectElement;
                setCarWashForm((prev) => ({
                  ...prev,
                  supportedSizes: Array.from(
                    target.selectedOptions,
                    (opt) => opt.value
                  ),
                }));
              }}
              required
              fullWidth
              sx={{ mb: 2 }}
              helperText="Оберіть всі розміри авто, які обслуговує ця мийка"
            >
              <option value="micro">Мікроавто</option>
              <option value="sedan">Седан</option>
              <option value="suv">Позашляховик/Джип</option>
              <option value="minivan">Мінівен</option>
              <option value="pickup">Пікап</option>
              <option value="other">Інше</option>
            </TextField>
            {cwError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {cwError}
              </Alert>
            )}
            {cwSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {cwSuccess}
              </Alert>
            )}
            <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
              <Button
                onClick={() => setOpen(false)}
                color="secondary"
                variant="outlined"
                sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
                disabled={cwLoading}
              >
                Скасувати
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
                disabled={cwLoading}
              >
                {cwLoading ? "Додаємо..." : "Додати"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
