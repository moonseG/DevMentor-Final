import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Checkbox from "expo-checkbox";
import { MaterialIcons } from "@expo/vector-icons";
import styles from "../Styles/AdvisorProfileSetupStyle";
import { apiFetch } from "../config/api";

export default function AdvisorProfileSetup({ route, navigation }) {
  const { userId, nombre } = route.params;

  const [especialidad, setEspecialidad] = useState("");
  const [areaEspecialidad, setAreaEspecialidad] = useState("");
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedMaterias, setExpandedMaterias] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const redirectTimeoutRef = useRef(null);

  useEffect(() => {
    cargarMaterias();
  }, []);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const cargarMaterias = async () => {
    try {
      const response = await apiFetch("/materias");
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setMateriasDisponibles(data);
      } else {
        console.log("Formato de respuesta inesperado:", data);
        Alert.alert("Error", "No se pudieron cargar las materias");
      }
    } catch (error) {
      console.error("Error cargando materias:", error);
      Alert.alert("Error", "No se pudieron cargar las materias");
    } finally {
      setLoading(false);
    }
  };

  const toggleMateria = (idMateria) => {
    setMateriasSeleccionadas((prev) => {
      if (prev.includes(idMateria)) {
        return prev.filter((id) => id !== idMateria);
      } else {
        return [...prev, idMateria];
      }
    });
  };

  const guardarPerfil = async () => {
    if (!especialidad.trim()) {
      Alert.alert("Error", "La especialidad es obligatoria");
      return;
    }

    if (!areaEspecialidad.trim()) {
      Alert.alert("Error", "El área de especialidad es obligatoria");
      return;
    }

    if (materiasSeleccionadas.length === 0) {
      Alert.alert("Error", "Debes seleccionar al menos una materia");
      return;
    }

    setSaving(true);
    let completed = false;

    try {
      const response = await apiFetch("/advisors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario_auth: userId,
          especialidad: especialidad.trim(),
          area_especialidad: areaEspecialidad.trim(),
          materias: materiasSeleccionadas,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        completed = true;
        setProfileCompleted(true);
        Alert.alert('Solicitud enviada', 'Tu perfil ha sido enviado para revisión. El administrador recibirá la solicitud y podrá aprobar o rechazar tu perfil.');
        redirectTimeoutRef.current = setTimeout(() => {
          navigation.navigate("DevMentor");
        }, 3000);
        return;
      } else {
        Alert.alert("Error", data.detail || "Error al guardar el perfil");
      }
    } catch (error) {
      console.error("Error guardando perfil:", error);
      Alert.alert("Error", "No se pudo guardar el perfil");
    } finally {
      if (!completed) {
        setSaving(false);
      }
    }
  };

  const renderMateriaItem = ({ item }) => (
    <View style={styles.materiaItem}>
      <Checkbox
        value={materiasSeleccionadas.includes(item.id)}
        onValueChange={() => toggleMateria(item.id)}
        style={styles.checkbox}
      />
      <View style={styles.materiaInfo}>
        <Text style={styles.materiaNombre}>{item.nombre}</Text>
        {item.descripcion && (
          <Text style={styles.materiaDescripcion}>{item.descripcion}</Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Cargando materias...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (profileCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Perfil de asesor completado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Completa tu Perfil de Asesor</Text>
          <Text style={styles.subtitle}>Hola, {nombre}</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <MaterialIcons name="school" size={16} color="#2196F3" />
              {" Especialidad"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Matemáticas, Programación, etc."
              value={especialidad}
              onChangeText={setEspecialidad}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <MaterialIcons name="category" size={16} color="#2196F3" />
              {" Área de Especialidad"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Ciencias, Tecnología, Humanidades"
              value={areaEspecialidad}
              onChangeText={setAreaEspecialidad}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.materiaHeader}
              onPress={() => setExpandedMaterias(!expandedMaterias)}
            >
              <Text style={styles.label}>
                <MaterialIcons name="book" size={16} color="#2196F3" />
                {" Materias ("}
                {materiasSeleccionadas.length}
                {" seleccionadas)"}
              </Text>
              <MaterialIcons
                name={expandedMaterias ? "expand-less" : "expand-more"}
                size={24}
                color="#2196F3"
              />
            </TouchableOpacity>

            {expandedMaterias && (
              <FlatList
                data={materiasDisponibles}
                renderItem={renderMateriaItem}
                keyExtractor={(item) => item.id.toString()}
                nestedScrollEnabled={true} 
                style={styles.materiasList}
              />
            )}

            {materiasSeleccionadas.length > 0 && (
              <View style={styles.selectedMateriasPreview}>
                <Text style={styles.selectedLabel}>Seleccionadas:</Text>
                <View style={styles.selectedMateriasContainer}>
                  {materiasSeleccionadas.map((idMateria) => {
                    const materia = materiasDisponibles.find(
                      (m) => m.id === idMateria
                    );
                    return (
                      <View key={idMateria} style={styles.materiaTag}>
                        <Text style={styles.materiaTagText}>{materia?.nombre}</Text>
                        <TouchableOpacity
                          onPress={() => toggleMateria(idMateria)}
                        >
                          <MaterialIcons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.buttonDisabled]}
          onPress={guardarPerfil}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Perfil</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}