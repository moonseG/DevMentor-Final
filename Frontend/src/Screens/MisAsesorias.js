import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, SafeAreaView, Modal,
  Image, StyleSheet, RefreshControl, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { apiFetch } from "../config/api";
import { getCurrentUser } from "../services/sessionService";
import { colors } from "../Styles/AdvisorProfileStyle";

export default function MisAsesorias() {
  const [citas, setCitas]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingQr, setLoadingQr]   = useState(false);
  const [qrModal, setQrModal]       = useState({ visible: false, qr: null });

  const currentUser = getCurrentUser();
  const idPerfil    = currentUser?.id_perfil;

  const cargarCitas = async () => {
    try {
      const res  = await apiFetch(`/calendario/citas/asesor/${idPerfil}`);
      const data = await res.json();
      setCitas(Array.isArray(data) ? data : []);
    } catch {
      setCitas([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Se recarga cada vez que el asesor entra a esta pantalla
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      cargarCitas();
    }, [idPerfil])
  );

  const generarQR = async (id_cita) => {
    setLoadingQr(true);
    try {
      const res  = await apiFetch(`/qr/generar/${id_cita}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data.detail || "No se pudo generar el QR");
        return;
      }
      setQrModal({ visible: true, qr: data.qr_base64 });
    } catch {
      Alert.alert("Error", "Error de conexión");
    } finally {
      setLoadingQr(false);
    }
  };

  const cancelarCita = (id_cita) => {
    Alert.alert(
      "Cancelar asesoría",
      "¿Seguro que quieres cancelar esta asesoría?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            await apiFetch(`/calendario/citas/${id_cita}/cancelar`, { method: "PATCH" });
            cargarCitas();
          },
        },
      ]
    );
  };

  const renderCita = ({ item }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={s.alumnoText}>{item.nombre_alumno}</Text>
          <Text style={s.fechaText}>{item.fecha}  •  {item.hora}</Text>
        </View>
        <View style={[s.badge, item.estado_qr === "completada" ? s.badgeOk : s.badgePendiente]}>
          <Text style={s.badgeText}>
            {item.estado_qr === "completada" ? "Completada" : "Pendiente"}
          </Text>
        </View>
      </View>

      {item.estado_qr !== "completada" && (
        <View style={s.actions}>
          <TouchableOpacity
            style={s.btnQr}
            onPress={() => generarQR(item.id)}
            disabled={loadingQr}
          >
            <Ionicons name="qr-code-outline" size={18} color="#fff" />
            <Text style={s.btnQrText}>Generar QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btnCancelar}
            onPress={() => cancelarCita(item.id)}
          >
            <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
            <Text style={s.btnCancelarText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) return (
    <SafeAreaView style={s.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safeArea}>

      {/* Modal que muestra el QR */}
      <Modal visible={qrModal.visible} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Código QR de asistencia</Text>
            <Text style={s.modalSub}>
              El alumno debe escanear este código para confirmar su asistencia
            </Text>
            {qrModal.qr && (
              <Image
                source={{ uri: `data:image/png;base64,${qrModal.qr}` }}
                style={s.qrImage}
              />
            )}
            <TouchableOpacity
              style={s.btnCerrar}
              onPress={() => { setQrModal({ visible: false, qr: null }); cargarCitas(); }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FlatList
        data={citas}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCita}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); cargarCitas(); }}
          />
        }
        ListEmptyComponent={
          <View style={s.center}>
            <Ionicons name="calendar-outline" size={64} color={colors.border} />
            <Text style={{ color: colors.text.secondary, marginTop: 12, fontSize: 15 }}>
              No tienes asesorías pendientes
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea:    { flex: 1, backgroundColor: "#f5f5f5" },
  center:      { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader:       { flexDirection: "row", alignItems: "center" },
  alumnoText:       { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  fechaText:        { fontSize: 13, color: "#64748b", marginTop: 2 },
  badge:            { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgePendiente:   { backgroundColor: "#FFF3CD" },
  badgeOk:          { backgroundColor: "#D1FAE5" },
  badgeText:        { fontSize: 11, fontWeight: "700" },
  actions:          { flexDirection: "row", marginTop: 12, gap: 10 },
  btnQr: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", backgroundColor: colors.primary,
    padding: 10, borderRadius: 10, gap: 6,
  },
  btnQrText:        { color: "#fff", fontWeight: "700", fontSize: 13 },
  btnCancelar: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", borderWidth: 1,
    borderColor: colors.danger, padding: 10, borderRadius: 10, gap: 6,
  },
  btnCancelarText:  { color: colors.danger, fontWeight: "700", fontSize: 13 },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center", alignItems: "center",
  },
  modalBox: {
    width: "85%", backgroundColor: "#fff",
    borderRadius: 20, padding: 24, alignItems: "center",
  },
  modalTitle:   { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  modalSub: {
    fontSize: 13, color: "#64748b",
    textAlign: "center", marginTop: 6, marginBottom: 16,
  },
  qrImage:      { width: 220, height: 220, borderRadius: 8 },
  btnCerrar: {
    marginTop: 20, backgroundColor: colors.primary,
    paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12,
  },
});