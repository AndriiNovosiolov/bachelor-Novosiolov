"use client";
import {
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Fade,
  Avatar,
  Stack,
  IconButton,
  Divider,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, createContext, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import LocalCarWashIcon from "@mui/icons-material/LocalCarWash";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import BuildIcon from "@mui/icons-material/Build";
import EventIcon from "@mui/icons-material/Event";

const theme = createTheme();

const AuthContext = createContext<{ isAuth: boolean; logout: () => void }>({
  isAuth: false,
  logout: () => {},
});

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsAuth(!!token);
    console.log("[AuthProvider] token in localStorage:", token);
  }, [pathname]);

  useEffect(() => {
    if (isAuth === null) return;
    if (!isAuth && pathname !== "/login" && pathname !== "/register") {
      router.push("/login");
    }
    if (isAuth && (pathname === "/login" || pathname === "/register")) {
      router.push("/dashboard");
    }
  }, [isAuth, pathname, router]);

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuth(false);
    router.push("/login");
  };

  if (isAuth === null) return null;

  return (
    <AuthContext.Provider value={{ isAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function AppNavBar() {
  const { logout } = useContext(AuthContext);
  const router = useRouter();
  let userRole: string | null = null;
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        userRole = decoded.role || null;
      } catch {}
    }
  }
  return (
    <Fade in timeout={700}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          borderRadius: 5,
          mx: 0,
          py: 2,
          px: 0,
          mt: 2,
          background: "linear-gradient(100deg, #2196f3 0%, #b47cff 100%)",
          boxShadow: "0 8px 32px 0 rgba(31,38,135,0.18)",
          backdropFilter: "blur(8px)",
          minHeight: 80,
        }}
      >
        <Toolbar
          sx={{
            minHeight: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, md: 4 },
            gap: 0,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ flexGrow: 1, cursor: "pointer", minWidth: 0 }}
            onClick={() => router.push("/dashboard")}
          >
            <Avatar
              sx={{
                bgcolor: "white",
                color: "primary.main",
                width: 56,
                height: 56,
                boxShadow: 2,
                mr: 2,
              }}
            >
              <LocalCarWashIcon fontSize="large" />
            </Avatar>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                letterSpacing: 2,
                color: "white",
                textShadow: "0 2px 8px #0002",
                userSelect: "none",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Чисто-Go
            </Typography>
          </Stack>
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              mx: 3,
              height: 48,
              alignSelf: "center",
              borderColor: "rgba(255,255,255,0.25)",
            }}
          />
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ minHeight: 56 }}
          >
            <Button
              color="inherit"
              startIcon={<HomeIcon />}
              onClick={() => router.push("/dashboard")}
              sx={{
                borderRadius: 3,
                fontWeight: 700,
                fontSize: 18,
                px: 3,
                py: 1.5,
                minHeight: 56,
                boxShadow: 2,
                background: "rgba(255,255,255,0.10)",
                transition: "background 0.2s, box-shadow 0.2s",
                "&:hover": { background: "#ffffff22", boxShadow: 4 },
              }}
            >
              Головна
            </Button>
            <Button
              color="inherit"
              startIcon={<BuildIcon />}
              onClick={() => router.push("/auto-services")}
              sx={{
                borderRadius: 3,
                fontWeight: 700,
                fontSize: 18,
                px: 3,
                py: 1.5,
                minHeight: 56,
                boxShadow: 2,
                background: "rgba(255,255,255,0.10)",
                transition: "background 0.2s, box-shadow 0.2s",
                "&:hover": { background: "#ffffff22", boxShadow: 4 },
              }}
            >
              Авто-сервіси
            </Button>
            <Button
              color="inherit"
              startIcon={<EventIcon />}
              onClick={() => router.push("/booking")}
              sx={{
                borderRadius: 3,
                fontWeight: 700,
                fontSize: 18,
                px: 3,
                py: 1.5,
                minHeight: 56,
                boxShadow: 2,
                background: "rgba(255,255,255,0.10)",
                transition: "background 0.2s, box-shadow 0.2s",
                "&:hover": { background: "#ffffff22", boxShadow: 4 },
              }}
            >
              Мої бронювання
            </Button>
            <Button
              color="inherit"
              startIcon={<PersonIcon />}
              onClick={() => router.push("/profile")}
              sx={{
                borderRadius: 3,
                fontWeight: 700,
                fontSize: 18,
                px: 3,
                py: 1.5,
                minHeight: 56,
                boxShadow: 2,
                background: "rgba(255,255,255,0.10)",
                transition: "background 0.2s, box-shadow 0.2s",
                "&:hover": { background: "#ffffff22", boxShadow: 4 },
              }}
            >
              Профіль
            </Button>
            <Button
              color="secondary"
              variant="contained"
              endIcon={<LogoutIcon />}
              onClick={logout}
              sx={{
                borderRadius: 3,
                fontWeight: 900,
                fontSize: 18,
                px: 3,
                py: 1.5,
                minHeight: 56,
                boxShadow: 3,
                letterSpacing: 1,
              }}
            >
              Вийти
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
    </Fade>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        {!isAuthPage && <AppNavBar />}
        <Container
          maxWidth={false}
          sx={{
            bgcolor: "#f5f7fa",
            borderRadius: 4,
            boxShadow: 3,
            p: { xs: 4, sm: 2 },
          }}
        >
          {children}
        </Container>
      </AuthProvider>
    </ThemeProvider>
  );
}
