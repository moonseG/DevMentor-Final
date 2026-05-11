import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import Checkbox from "expo-checkbox";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { apiFetch } from "../config/api";
import {
  getCurrentUser,
  updateCurrentUser,
} from "../services/sessionService";

export default function MyAccount() {
  const currentUser = getCurrentUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileImageUri, setProfileImageUri] = useState(
    currentUser?.foto_perfil || currentUser?.profileImageUri || ""
  );

  const [nombre, setNombre] = useState(currentUser?.nombre || "");
  const [correo, setCorreo] = useState(currentUser?.correo || "");
  const [telefono, setTelefono] = useState(currentUser?.telefono || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [advisorProfileId, setAdvisorProfileId] = useState(null);
  const [especialidad, setEspecialidad] = useState("");
  const [areaEspecialidad, setAreaEspecialidad] = useState("");
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);

  const isAdvisor = useMemo(() => {
    return (currentUser?.rol || "").toLowerCase() === "asesor";
  }, [currentUser?.rol]);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }

      try {
        const [userResponse, materiasResponse] = await Promise.all([
          apiFetch(`/auth/users/${currentUser.id}`),
          isAdvisor ? apiFetch("/materias") : Promise.resolve(null),
        ]);

        if (userResponse?.ok) {
          const userData = await userResponse.json();
          setNombre(userData?.nombre || "");
          setCorreo(userData?.correo || "");
          setTelefono(userData?.telefono || "");
          setProfileImageUri(userData?.foto_perfil || "");

          updateCurrentUser({
            nombre: userData?.nombre || currentUser?.nombre,
            correo: userData?.correo || currentUser?.correo,
            telefono: userData?.telefono || currentUser?.telefono,
            foto_perfil: userData?.foto_perfil || "",
          });
        }

        if (isAdvisor && materiasResponse?.ok) {
          const materias = await materiasResponse.json();
          if (Array.isArray(materias)) {
            setMateriasDisponibles(materias);
          }
        }

        if (isAdvisor) {
          const advisorResponse = await apiFetch(
            `/advisors/user/${currentUser.id}`
          );

          if (advisorResponse.ok) {
            const advisorData = await advisorResponse.json();
            setAdvisorProfileId(advisorData?.id_perfil || null);
            setEspecialidad(advisorData?.especialidad || "");
            setAreaEspecialidad(advisorData?.area_especialidad || "");
            setMateriasSeleccionadas(
              Array.isArray(advisorData?.materias) ? advisorData.materias : []
            );
          }
        }
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar la información de tu cuenta");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [currentUser?.id, currentUser?.correo, currentUser?.nombre, currentUser?.telefono, isAdvisor]);

  const seleccionarFoto = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) return;

      const imageAsset = result.assets[0];
      if (imageAsset.size && imageAsset.size > 2 * 1024 * 1024) {
        Alert.alert("Error", "Selecciona una imagen menor a 2 MB");
        return;
      }

      const mimeType = imageAsset.mimeType || "image/jpeg";
      const base64Content = await FileSystem.readAsStringAsync(imageAsset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const imageDataUrl = `data:${mimeType};base64,${base64Content}`;

      setProfileImageUri(imageDataUrl);
      updateCurrentUser({
        profileImageUri: imageDataUrl,
        foto_perfil: imageDataUrl,
      });
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const toggleMateria = (idMateria) => {
    setMateriasSeleccionadas((prev) => {
      if (prev.includes(idMateria)) {
        return prev.filter((id) => id !== idMateria);
      }

      return [...prev, idMateria];
    });
  };

  const guardarCambios = async () => {
    if (!nombre.trim() || !correo.trim() || !telefono.trim()) {
      Alert.alert("Error", "Nombre, correo y teléfono son obligatorios");
      return;
    }

    if (!correo.trim().endsWith("@unach.mx")) {
      Alert.alert("Error", "Debes usar un correo institucional @unach.mx");
      return;
    }

    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        Alert.alert("Error", "Las contraseñas no coinciden");
        return;
      }
    }

    if (isAdvisor) {
      if (!especialidad.trim() || !areaEspecialidad.trim()) {
        Alert.alert("Error", "Completa especialidad y área de especialidad");
        return;
      }

      if (materiasSeleccionadas.length === 0) {
        Alert.alert("Error", "Selecciona al menos una materia");
        return;
      }
    }

    setSaving(true);

    try {
      const userPayload = {
        nombre: nombre.trim(),
        correo: correo.trim(),
        telefono: telefono.trim(),
        foto_perfil: profileImageUri || null,
      };

      if (password) {
        userPayload.contrasena = password;
      }

      const userResponse = await apiFetch(`/auth/users/${currentUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userPayload),
      });

      const userData = await userResponse.json();
      if (!userResponse.ok) {
        Alert.alert("Error", userData?.detail || "No se pudo actualizar tu cuenta");
        return;
      }

      if (isAdvisor) {
        const advisorPayload = {
          especialidad: especialidad.trim(),
          area_especialidad: areaEspecialidad.trim(),
          materias: materiasSeleccionadas,
        };

        if (advisorProfileId) {
          const updateAdvisorResponse = await apiFetch(
            `/advisors/${advisorProfileId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(advisorPayload),
            }
          );

          const advisorUpdateData = await updateAdvisorResponse.json();
          if (!updateAdvisorResponse.ok) {
            Alert.alert(
              "Error",
              advisorUpdateData?.detail || "No se pudo actualizar el perfil de asesor"
            );
            return;
          }
        } else {
          const createAdvisorResponse = await apiFetch("/advisors", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id_usuario_auth: currentUser.id,
              ...advisorPayload,
            }),
          });

          const advisorCreateData = await createAdvisorResponse.json();
          if (!createAdvisorResponse.ok) {
            Alert.alert(
              "Error",
              advisorCreateData?.detail || "No se pudo crear el perfil de asesor"
            );
            return;
          }

          setAdvisorProfileId(advisorCreateData?.id_perfil || null);
        }
      }

      updateCurrentUser({
        nombre: userData?.nombre || nombre.trim(),
        correo: userData?.correo || correo.trim(),
        telefono: userData?.telefono || telefono.trim(),
        profileImageUri: userData?.foto_perfil || profileImageUri,
        foto_perfil: userData?.foto_perfil || profileImageUri,
      });

      setPassword("");
      setConfirmPassword("");

      Alert.alert("Listo", "Tu perfil se actualizó correctamente");
    } catch (error) {
      Alert.alert("Error", "No se pudieron guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E5BE0" />
          <Text style={styles.loadingText}>Cargando tu cuenta...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={seleccionarFoto}>
              <Image
                source={
                  profileImageUri
                    ? { uri: profileImageUri }
                    : require("../../assets/icons/user.png")
                }
                style={styles.avatar}
              />
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{nombre || "Usuario"}</Text>
              <Text style={styles.profileRole}>{currentUser?.rol || "No disponible"}</Text>
              <TouchableOpacity onPress={seleccionarFoto}>
                <Text style={styles.changePhotoText}>Cambiar foto</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="mail" size={20} color="#FF5722" />
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>Correo: </Text>
                {correo || "No disponible"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="call" size={20} color="#4CAF50" />
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>Telefono: </Text>
                {telefono || "No disponible"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <MaterialIcons name="manage-accounts" size={22} color="#0077b6" />
            <Text style={styles.sectionTitle}>Datos de registro</Text>
          </View>

          <Text style={styles.inputLabel}>Nombre</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

          <Text style={styles.inputLabel}>Correo</Text>
          <TextInput
            style={styles.input}
            value={correo}
            onChangeText={setCorreo}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.inputLabel}>Teléfono</Text>
          <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} />

          <Text style={styles.inputLabel}>Nueva contraseña (opcional)</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Solo si deseas cambiarla"
          />

          <Text style={styles.inputLabel}>Confirmar contraseña</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {isAdvisor ? (
          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcons name="school" size={22} color="#0077b6" />
              <Text style={styles.sectionTitle}>Perfil de asesor</Text>
            </View>

            <Text style={styles.inputLabel}>Especialidad</Text>
            <TextInput
              style={styles.input}
              value={especialidad}
              onChangeText={setEspecialidad}
            />

            <Text style={styles.inputLabel}>Área de especialidad</Text>
            <TextInput
              style={styles.input}
              value={areaEspecialidad}
              onChangeText={setAreaEspecialidad}
            />

            <Text style={styles.inputLabel}>Materias</Text>
            <View style={styles.materiasContainer}>
              {materiasDisponibles.map((materia) => (
                <View key={materia.id} style={styles.materiaRow}>
                  <Checkbox
                    value={materiasSeleccionadas.includes(materia.id)}
                    onValueChange={() => toggleMateria(materia.id)}
                  />
                  <Text style={styles.materiaText}>{materia.nombre}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, saving && styles.disabledButton]}
            onPress={guardarCambios}
            disabled={saving}
          >
            <Ionicons name="save-outline" size={20} color="#0077b6" />
            <Text style={styles.actionButtonText}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#0077b6",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
  },
  profileRole: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    textTransform: "capitalize",
  },
  changePhotoText: {
    marginTop: 4,
    color: "#0077b6",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 16,
  },
  detailsContainer: {
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    color: "#334155",
    flex: 1,
  },
  detailLabel: {
    fontWeight: "600",
    color: "#0f172a",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  inputLabel: {
    marginTop: 12,
    marginBottom: 6,
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f8fafc",
    color: "#0f172a",
  },
  materiasContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#f8fafc",
  },
  materiaRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  materiaText: {
    marginLeft: 10,
    color: "#334155",
    fontSize: 14,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 6,
    flexDirection: "row",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#0077b6",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#64748b",
  },
});