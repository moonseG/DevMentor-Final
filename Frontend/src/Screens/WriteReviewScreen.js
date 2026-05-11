import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { styles, ui } from "../Styles/writeReviewStyles";
import { createResena } from "../services/reviewService";
import { getCurrentUser } from "../services/sessionService";
import { apiFetch } from "../config/api";

const EMPTY_LIST = [];

function SelectorModal({ visible, title, options, onClose, onSelect }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                activeOpacity={0.8}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.modalOptionText}>{item.nombre}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

function RatingStars({ rating, onChange }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((value) => (
        <TouchableOpacity
          key={value}
          activeOpacity={0.75}
          onPress={() => onChange(value)}
          style={styles.starTouch}
        >
          <Ionicons
            name={value <= rating ? "star" : "star-outline"}
            size={ui.star}
            color={value <= rating ? "#1E5BE0" : "#C0C5D2"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function WriteReviewScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const usuarioActual = getCurrentUser();

  const [materiasDisponibles, setMateriasDisponibles] = useState(EMPTY_LIST);
  const [asesoresDisponibles, setAsesoresDisponibles] = useState(EMPTY_LIST);
  const [isLoadingMaterias, setIsLoadingMaterias] = useState(true);
  const [isLoadingAsesores, setIsLoadingAsesores] = useState(true);
  const [materia, setMateria] = useState(null);
  const [asesor, setAsesor] = useState(null);
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [modalType, setModalType] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const modalTitle = useMemo(() => {
    if (modalType === "materia") return "Selecciona materia";
    if (modalType === "asesor") return "Selecciona asesor";
    return "";
  }, [modalType]);

  const modalData = useMemo(() => {
    if (modalType === "materia") return materiasDisponibles;
    if (modalType === "asesor") return asesoresDisponibles;
    return [];
  }, [modalType, materiasDisponibles, asesoresDisponibles]);

  useEffect(() => {
    const cargarMaterias = async () => {
      try {
        const response = await apiFetch("/materias");
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setMateriasDisponibles(data);
          if (data.length > 0) {
            setMateria(data[0]);
          }
        } else {
          setMateriasDisponibles([]);
        }
      } catch (_error) {
        setMateriasDisponibles([]);
      } finally {
        setIsLoadingMaterias(false);
      }
    };

    const getUserById = async (idUsuario) => {
      try {
        const response = await apiFetch(`/auth/users/${idUsuario}`);
        if (!response.ok) return null;
        return response.json();
      } catch (_error) {
        return null;
      }
    };

    const cargarAsesores = async () => {
      try {
        const response = await apiFetch("/advisors");
        const data = await response.json();

        if (!response.ok || !Array.isArray(data)) {
          setAsesoresDisponibles([]);
          return;
        }

        const advisorsWithUser = await Promise.all(
          data.map(async (advisor) => {
            const user = await getUserById(advisor.id_usuario_auth);
            return {
              id: advisor.id_usuario_auth,
              nombre: user?.nombre || `Asesor #${advisor.id_usuario_auth}`,
            };
          })
        );

        setAsesoresDisponibles(advisorsWithUser);
        if (advisorsWithUser.length > 0) {
          setAsesor(advisorsWithUser[0]);
        }
      } catch (_error) {
        setAsesoresDisponibles([]);
      } finally {
        setIsLoadingAsesores(false);
      }
    };

    cargarMaterias();
    cargarAsesores();
  }, []);

  const handleSelect = (item) => {
    if (modalType === "materia") {
      setMateria(item);
      return;
    }

    if (modalType === "asesor") {
      setAsesor(item);
    }
  };

  const payloadPreview = {
    idUsuario: usuarioActual?.id,
    idUsuarioAuth: asesor?.id,
    idMateria: materia?.id,
    calificacion,
    comentario: comentario.trim(),
  };

  const saveReview = async () => {
    if (isSaving) return;

    if (!usuarioActual?.id) {
      Alert.alert("Error", "Debes iniciar sesion para escribir una reseña");
      navigation.navigate("Login");
      return;
    }

    if (!payloadPreview.idMateria || !payloadPreview.idUsuarioAuth) {
      Alert.alert("Error", "Selecciona materia y asesor");
      return;
    }

    if (payloadPreview.calificacion < 1 || payloadPreview.calificacion > 5) {
      Alert.alert("Error", "Selecciona una calificacion entre 1 y 5");
      return;
    }

    if (payloadPreview.comentario.length < 3) {
      Alert.alert("Error", "El comentario debe tener al menos 3 caracteres");
      return;
    }

    try {
      setIsSaving(true);
      await createResena(payloadPreview);
      Alert.alert("Exito", "Reseña guardada correctamente");
      navigation.navigate("ReviewScreen");
    } catch (error) {
      Alert.alert("Error", error.message || "No se pudo guardar la reseña");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.container}>
          <View style={[styles.header, { paddingTop: insets.top + 6 }]}> 
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.goBack()}
              style={styles.headerIconButton}
            >
              <Ionicons name="chevron-back" size={ui.iconBack} color="#1E5BE0" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Reseña en curso</Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate("ReviewScreen")}
              style={styles.headerIconButton}
            >
              <Ionicons name="close" size={ui.iconClose} color="#1E5BE0" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formSection}>
              <Text style={styles.label}>Usuario</Text>
              <View style={styles.readOnlyInput}>
                <Text style={styles.readOnlyText}>{usuarioActual?.nombre || "Usuario no identificado"}</Text>
              </View>

              <Text style={styles.label}>Materia</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.selectorInput}
                onPress={() => setModalType("materia")}
              >
                <Text style={styles.selectorText}>
                  {isLoadingMaterias ? "Cargando materias..." : materia?.nombre || "Sin materias"}
                </Text>
                <Ionicons name="chevron-down" size={ui.iconSelect} color="#8D93A3" />
              </TouchableOpacity>

              <Text style={styles.label}>Asesor</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.selectorInput}
                onPress={() => setModalType("asesor")}
              >
                <Text style={styles.selectorText}>
                  {isLoadingAsesores ? "Cargando asesores..." : asesor?.nombre || "Sin asesores"}
                </Text>
                <Ionicons name="chevron-down" size={ui.iconSelect} color="#8D93A3" />
              </TouchableOpacity>

              <View style={styles.ratingRow}>
                <Text style={styles.label}>Calificación promedio</Text>
                <RatingStars rating={calificacion} onChange={setCalificacion} />
              </View>

              <TextInput
                style={styles.commentInput}
                multiline
                placeholder="Tell us everything."
                placeholderTextColor="#9DA3B4"
                value={comentario}
                onChangeText={setComentario}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}> 
            <TouchableOpacity activeOpacity={0.9} style={styles.saveButton} onPress={saveReview}>
              <Text style={styles.saveButtonText}>{isSaving ? "Guardando..." : "Guardar reseña"}</Text>
              <Ionicons name="checkmark" size={ui.iconSave} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <SelectorModal
        visible={Boolean(modalType)}
        title={modalTitle}
        options={modalData}
        onClose={() => setModalType(null)}
        onSelect={handleSelect}
      />
    </SafeAreaView>
  );
}
