"use client";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Paper,
  Button,
  Stack,
  Rating,
  Alert,
} from "@mui/material";
import { useState } from "react";

export default function ReviewsPage() {
  // TODO: отримати автомийки та відгуки з бекенду
  const carWashes = [
    { id: "1", name: "Автомийка №1" },
    { id: "2", name: "Автомийка №2" },
  ];
  const [carWashId, setCarWashId] = useState("");
  const reviews = [
    { id: "r1", user: "Іван", rating: 5, comment: "Все супер!" },
    { id: "r2", user: "Петро", rating: 4, comment: "Довго чекати" },
  ];
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleRating = (_: any, value: number | null) => {
    setForm((f) => ({ ...f, rating: value || 1 }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: відправити відгук через reviewService
    setSuccess("Відгук додано!");
  };

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
        Відгуки про автомийку
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
        {reviews.map((r) => (
          <Paper key={r.id} sx={{ p: 2 }}>
            <Typography variant="subtitle2">{r.user}</Typography>
            <Rating value={r.rating} readOnly size="small" />
            <Typography variant="body2">{r.comment}</Typography>
          </Paper>
        ))}
      </Stack>
      <Box mt={4}>
        <Typography variant="h6" mb={2}>
          Залишити відгук
        </Typography>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Rating name="rating" value={form.rating} onChange={handleRating} />
          <TextField
            label="Коментар"
            name="comment"
            value={form.comment}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Залишити відгук
          </Button>
        </form>
      </Box>
    </Box>
  );
}
