"use client";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Paper,
  Button,
  Stack,
} from "@mui/material";
import { useState } from "react";

export default function ServicePage() {
  // TODO: отримати автомийки та сервіси з бекенду
  const carWashes = [
    { id: "1", name: "Автомийка №1" },
    { id: "2", name: "Автомийка №2" },
  ];
  const [carWashId, setCarWashId] = useState("");
  const services = [
    { id: "a", name: "Мийка кузова", price: 250, duration: 30 },
    { id: "b", name: "Пилосос салону", price: 100, duration: 15 },
  ];

  return (
    <Box
      maxWidth={700}
      mx="auto"
      mt={8}
      p={4}
      boxShadow={3}
      borderRadius={2}
      bgcolor="#fff"
    >
      <Typography variant="h5" mb={2} align="center">
        Сервіси автомийки
      </Typography>
      <TextField
        select
        label="Автомийка"
        value={carWashId}
        onChange={(e) => setCarWashId(e.target.value)}
        fullWidth
        required
        margin="normal"
      >
        {carWashes.map((cw) => (
          <MenuItem key={cw.id} value={cw.id}>
            {cw.name}
          </MenuItem>
        ))}
      </TextField>
      <Stack spacing={2} mt={3}>
        {services.map((s) => (
          <Paper key={s.id} sx={{ p: 2 }}>
            <Typography variant="subtitle1">{s.name}</Typography>
            <Typography variant="body2">Ціна: {s.price} грн</Typography>
            <Typography variant="body2">Тривалість: {s.duration} хв</Typography>
          </Paper>
        ))}
      </Stack>
      {/* TODO: Додати кнопку для додавання сервісу (для owner) */}
      <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
        Додати сервіс
      </Button>
    </Box>
  );
}
