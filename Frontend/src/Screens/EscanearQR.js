import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet,
  Alert, SafeAreaView, TouchableOpacity,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "../config/api";
import { colors } from "../Styles/AdvisorProfileStyle";

export default function EscanearQR({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned]           = useState(false);
  const [loading, setLoading]           = useState(false);

  // Ref para bloqueo síncrono — evita múltiples disparos del scanner
  const procesando = useRef(false);

  const handleBarCodeScanned = async ({ data }) => {
    // Bloqueo inmediato con ref (síncrono, no espera re-render)
    if (procesando.current) return;
    procesando.current = true;

    setScanned(true);
    setLoading(true);

    try {
      const res  = await apiFetch("/qr/verificar", {
        method: "POST",
        body: JSON.stringify({ token_qr: data }),
      });
      const body = await res.json();

      if (res.ok) {
        Alert.alert(
          "Asistencia confirmada",
          `Asesoría del ${body.fecha} a las ${body.hora} registrada.`,
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert("QR inválido", body.detail || "No se pudo verificar", [
          {
            text: "Reintentar",
            onPress: () => {
              // Resetear ambos al reintentar
              procesando.current = false;
              setScanned(false);
            },
          },
        ]);
      }
    } catch {
      Alert.alert("Error", "Error de conexión", [
        {
          text: "Reintentar",
          onPress: () => {
            procesando.current = false;
            setScanned(false);
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) return <View />;

  if (!permission.granted) return (
    <SafeAreaView style={s.center}>
      <Ionicons name="camera-outline" size={60} color={colors.primary} />
      <Text style={s.permText}>Se necesita acceso a la cámara para escanear el QR</Text>
      <TouchableOpacity style={s.btnPerm} onPress={requestPermission}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>Permitir cámara</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />
      <View style={s.overlay}>
        <Text style={s.hint}>
          {loading ? "Verificando..." : "Apunta al código QR del asesor"}
        </Text>
        <View style={s.visor} />
        {scanned && !loading && (
          <TouchableOpacity
            style={s.btnRescan}
            onPress={() => {
              procesando.current = false;
              setScanned(false);
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Escanear otro</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center:    { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  permText:  { fontSize: 15, color: "#0f172a", textAlign: "center", marginVertical: 16 },
  btnPerm:   { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  overlay:   { flex: 1, justifyContent: "space-between", alignItems: "center", paddingVertical: 60 },
  hint: {
    color: "#fff", fontSize: 15, fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
  },
  visor:     { width: 240, height: 240, borderWidth: 3, borderColor: colors.primary, borderRadius: 16 },
  btnRescan: { backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
});