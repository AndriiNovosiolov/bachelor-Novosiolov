"use client";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import { useState } from "react";

const days = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export default function ShedulePage() {
  // TODO: отримати автомийки та розклад з бекенду
  const carWashes = [
    { id: "1", name: "Автомийка №1" },
    { id: "2", name: "Автомийка №2" },
  ];
  const [carWashId, setCarWashId] = useState("");
  const [schedule, setSchedule] = useState(
    days.map((day) => ({
      dayOfWeek: day,
      openTime: "08:00",
      closeTime: "20:00",
      isWorking: true,
    }))
  );

  const handleTimeChange = (
    idx: number,
    field: "openTime" | "closeTime",
    value: string
  ) => {
    setSchedule((sch) =>
      sch.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };
  const handleWorkingChange = (idx: number, value: boolean) => {
    setSchedule((sch) =>
      sch.map((row, i) => (i === idx ? { ...row, isWorking: value } : row))
    );
  };

  const handleSave = () => {
    // TODO: зберегти розклад через scheduleService
    alert("Розклад збережено!");
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
        Розклад роботи автомийки
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
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>День</TableCell>
              <TableCell>Відкриття</TableCell>
              <TableCell>Закриття</TableCell>
              <TableCell>Працює</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule.map((row, idx) => (
              <TableRow key={row.dayOfWeek}>
                <TableCell>{row.dayOfWeek}</TableCell>
                <TableCell>
                  <TextField
                    type="time"
                    value={row.openTime}
                    onChange={(e) =>
                      handleTimeChange(idx, "openTime", e.target.value)
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="time"
                    value={row.closeTime}
                    onChange={(e) =>
                      handleTimeChange(idx, "closeTime", e.target.value)
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant={row.isWorking ? "contained" : "outlined"}
                    color={row.isWorking ? "success" : "inherit"}
                    onClick={() => handleWorkingChange(idx, !row.isWorking)}
                  >
                    {row.isWorking ? "Так" : "Ні"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3 }}
        onClick={handleSave}
      >
        Зберегти розклад
      </Button>
    </Box>
  );
}
