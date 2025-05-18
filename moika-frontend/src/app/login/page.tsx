"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, TextField, Typography, Link, Alert } from "@mui/material";
import { authService } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await authService.login({ email, password });
      localStorage.setItem("token", data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Помилка входу");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background: "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)",
        py: { xs: 2, md: 8 },
        px: { xs: 0, md: 0 },
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <Box
        maxWidth={600}
        width="100%"
        maxHeight="90vh"
        overflow="auto"
        p={{ xs: 2, md: 5 }}
        boxShadow={12}
        borderRadius={5}
        bgcolor="rgba(255,255,255,0.98)"
        mx="auto"
      >
        <Typography
          variant="h3"
          mb={3}
          align="center"
          fontWeight={900}
          color="primary.main"
          letterSpacing={1}
          fontSize={{ xs: 24, md: 32 }}
        >
          Вхід
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: 18 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            margin="dense"
            sx={{ bgcolor: "#f7faff", borderRadius: 2, fontSize: 16 }}
            InputProps={{
              style: { height: 38, fontSize: 16, padding: "8px 12px" },
            }}
            InputLabelProps={{ style: { fontSize: 15 } }}
          />
          <TextField
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            margin="dense"
            sx={{ bgcolor: "#f7faff", borderRadius: 2, fontSize: 16 }}
            InputProps={{
              style: { height: 38, fontSize: 16, padding: "8px 12px" },
            }}
            InputLabelProps={{ style: { fontSize: 15 } }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.5,
              fontWeight: 900,
              fontSize: { xs: 18, md: 22 },
              borderRadius: 3,
              boxShadow: 3,
              background: "linear-gradient(100deg, #1976d2 0%, #b6e0fe 100%)",
            }}
          >
            {loading ? "Входимо..." : "Увійти"}
          </Button>
        </form>
        <Typography
          mt={3}
          align="center"
          color="primary.dark"
          fontSize={{ xs: 16, md: 20 }}
        >
          Не маєте акаунту?{" "}
          <Link
            href="/register"
            sx={{
              color: "#7c4dff",
              fontWeight: 700,
              fontSize: { xs: 16, md: 20 },
            }}
          >
            Зареєструватися
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
