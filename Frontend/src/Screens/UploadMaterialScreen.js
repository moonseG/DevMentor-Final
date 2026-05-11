import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Button, Alert, ActivityIndicator } from "react-native";
import * as DocumentPicker from "expo-document-picker";

import { apiFetch } from "../config/api";
import { getCurrentUser } from "../services/sessionService";

export default function UploadMaterialScreen({ route }) {

  // Recibe datos del AdvisorProfile
  const advisorParam = route?.params?.advisor || {};
  const [advisor, setAdvisor] = useState(advisorParam);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  useEffect(() => {
    const cargarEstadoActual = async () => {
      try {
        const idPerfil = advisorParam.id_perfil;
        const idUsuarioAuth = advisorParam.id_usuario_auth;

        if (!idPerfil && !idUsuarioAuth) {
          setAdvisor(advisorParam);
          return;
        }

        const endpoint = idPerfil
          ? `/advisors/${idPerfil}`
          : `/advisors/user/${idUsuarioAuth}`;

        const response = await apiFetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setAdvisor((prev) => ({ ...prev, ...data }));
        }
      } catch (error) {
        setAdvisor(advisorParam);
      } finally {
        setLoading(false);
      }
    };

    cargarEstadoActual();
  }, [advisorParam.id_perfil, advisorParam.id_usuario_auth]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={{ marginTop: 12 }}>Verificando aprobación...</Text>
      </View>
    );
  }

  if (currentUser?.rol === "Estudiante") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ marginBottom: 20, textAlign: 'center', paddingHorizontal: 20 }}>
          No tienes permiso para subir archivos. Solo los asesores pueden compartir materiales.
        </Text>
      </View>
    );
  }

  if (!advisor?.aprobado) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ marginBottom: 20, textAlign: 'center', paddingHorizontal: 20 }}>
          Tu perfil de asesor aún no ha sido aprobado. No puedes subir archivos hasta que el administrador lo apruebe.
        </Text>
      </View>
    );
  }

  // ⚠️ Temporal: luego puedes elegir materia desde lista
  const materiaSeleccionada = 2;

  const seleccionarArchivo = async () => {

    try {

      const result =
        await DocumentPicker.getDocumentAsync({
          type: "application/pdf",
        });

      if (result.canceled) return;

      const file = result.assets[0];

      const formData = new FormData();

      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: "application/pdf",
      });

      const response = await apiFetch(

        `/contents/upload/?id_perfil=${advisor.id_perfil}&id_materia=${materiaSeleccionada}`,

        {
          method: "POST",
          body: formData,
        }

      );

      if (response.ok) {

        Alert.alert(
          "Éxito",
          "Archivo subido correctamente"
        );

      } else {

        Alert.alert(
          "Error",
          "No se pudo subir el archivo"
        );

      }

    } catch (error) {

      console.log(error);

      Alert.alert(
        "Error",
        "Ocurrió un error al subir"
      );

    }

  };

  return (

    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >

      <Text style={{ marginBottom: 20 }}>
        Subir material PDF
      </Text>

      <Button
        title="Seleccionar archivo"
        onPress={seleccionarArchivo}
      />

    </View>

  );

}