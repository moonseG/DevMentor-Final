import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles, colors } from "../Styles/AdvisorProfileStyle";
import { apiFetch } from "../config/api";

const diasSemana = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado"
];

export default function DisponibilidadScreen({ route, navigation }) {
  const advisor = route?.params?.advisor;

  const [diaSeleccionado, setDiaSeleccionado] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");

  const horarios = [
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00"
  ];
  const horariosFin = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00"
  ]

  const guardarDisponibilidad = async () => {

    console.log("ENVIANDO:", {
        id_perfil: advisor.id_perfil,
        dia_semana: diaSeleccionado,
        hora_inicio: horaInicio,
        hora_fin: horaFin
    });

    if (!diaSeleccionado || !horaInicio || !horaFin) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    if (!advisor?.id_perfil) {
      Alert.alert("Error", "No se encontró el perfil del asesor");
      return;
    }

    try {
      const response = await apiFetch("/calendario/disponibilidad-semanal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_perfil: advisor.id_perfil,
          dia_semana: diaSeleccionado,
          hora_inicio: horaInicio + ":00",
          hora_fin: horaFin + ":00",
          activo: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.detail || "No se pudo guardar");
        return;
      }

      Alert.alert("Éxito", "Disponibilidad guardada correctamente");
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Problema de conexión");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
      >

        {/* DÍAS */}
        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
          Selecciona un día
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {diasSemana.map((dia) => (
            <TouchableOpacity
              key={dia}
              onPress={() => setDiaSeleccionado(dia)}
              style={{
                backgroundColor:
                  diaSeleccionado === dia ? colors.primary : "#E5E5E5",
                padding: 10,
                borderRadius: 10,
                margin: 5,
              }}
            >
              <Text
                style={{
                  color: diaSeleccionado === dia ? "white" : "black",
                }}
              >
                {dia}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* HORA INICIO */}
        <Text style={{ fontWeight: "bold", marginTop: 20 }}>
          Hora inicio
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {horarios.map((hora) => (
            <TouchableOpacity
              key={hora}
              onPress={() => setHoraInicio(hora)}
              style={{
                backgroundColor:
                  horaInicio === hora ? colors.primary : "#E5E5E5",
                padding: 10,
                borderRadius: 10,
                margin: 5,
              }}
            >
              <Text
                style={{
                  color: horaInicio === hora ? "white" : "black",
                }}
              >
                {hora}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* HORA FIN */}
        <Text style={{ fontWeight: "bold", marginTop: 20 }}>
          Hora fin
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {horariosFin.map((hora) => (
            <TouchableOpacity
              key={hora}
              onPress={() => setHoraFin(hora)}
              style={{
                backgroundColor:
                  horaFin === hora ? colors.primary : "#E5E5E5",
                padding: 10,
                borderRadius: 10,
                margin: 5,
              }}
            >
              <Text
                style={{
                  color: horaFin === hora ? "white" : "black",
                }}
              >
                {hora}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BOTÓN GUARDAR */}
        <TouchableOpacity
          onPress={guardarDisponibilidad}
          style={{
            backgroundColor: colors.primary,
            marginTop: 30,
            padding: 15,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Guardar disponibilidad
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}